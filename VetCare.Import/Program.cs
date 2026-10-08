using System.Globalization;
using CsvHelper;
using CsvHelper.Configuration.Attributes;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Processing;
using VetCare.Api.Data;
using VetCare.Api.Models;

// One-time (idempotent - safe to re-run) import of the cleaned OLX product
// export into the database. Deliberately a separate console app, not a
// `dotnet run -- import` branch inside the web app's own Program.cs: it
// needs its own dependencies (CsvHelper, ImageSharp) that the running API
// has no reason to carry, and keeping it a distinct project makes "this is
// a one-off data migration tool, not part of the app" obvious.

var repoRoot = FindRepoRoot();
var csvPath = Path.Combine(repoRoot, "raw_podaci", "olx_products_clean.csv");
var sourceImagesDir = Path.Combine(repoRoot, "raw_podaci", "olx_images");
var destImagesDir = Path.Combine(repoRoot, "VetCare.Api", "product-images");

if (!File.Exists(csvPath))
{
    Console.Error.WriteLine($"Could not find {csvPath}");
    return 1;
}

Directory.CreateDirectory(destImagesDir);

var configuration = new ConfigurationBuilder()
    .AddUserSecrets<Marker>()
    .AddEnvironmentVariables()
    .Build();

var connectionString = configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString) || connectionString.Contains("Password=;", StringComparison.Ordinal))
{
    Console.Error.WriteLine(
        "No usable ConnectionStrings:DefaultConnection found. Set it the same way as " +
        "VetCare.Api (dotnet user-secrets, shared UserSecretsId) or via the " +
        "ConnectionStrings__DefaultConnection environment variable.");
    return 1;
}

var optionsBuilder = new DbContextOptionsBuilder<VetCareDbContext>().UseNpgsql(connectionString);
await using var db = new VetCareDbContext(optionsBuilder.Options);

Console.WriteLine("Checking database connectivity...");
if (!await db.Database.CanConnectAsync())
{
    Console.Error.WriteLine(
        "Could not connect to the database. Make sure the 'vetcare' database exists and " +
        "migrations have been applied (dotnet ef database update --project ../VetCare.Api).");
    return 1;
}

using var reader = new StreamReader(csvPath);
using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);
var rows = csv.GetRecords<OlxProductRow>().ToList();
Console.WriteLine($"Read {rows.Count} rows from {csvPath}");

var existingSlugs = (await db.Products.Select(p => p.Slug).ToListAsync()).ToHashSet();
var existingOlxAdIds = (await db.Products
    .Where(p => p.OlxAdId != null)
    .Select(p => p.OlxAdId!)
    .ToListAsync()).ToHashSet();

long totalOriginalBytes = 0;
long totalWebpBytes = 0;
var createdCount = 0;
var skippedCount = 0;

foreach (var row in rows)
{
    if (!string.IsNullOrEmpty(row.OlxAdId) && existingOlxAdIds.Contains(row.OlxAdId))
    {
        skippedCount++;
        continue; // already imported - makes re-runs idempotent
    }

    var slug = MakeUniqueSlug(row.Slug, existingSlugs);
    existingSlugs.Add(slug);

    var priceOnRequest = string.Equals(row.PriceOnRequest, "true", StringComparison.OrdinalIgnoreCase);
    decimal? price = null;
    if (!priceOnRequest && !string.IsNullOrWhiteSpace(row.Price))
    {
        price = decimal.Parse(row.Price, CultureInfo.InvariantCulture);
    }

    var now = DateTime.UtcNow;
    var product = new Product
    {
        Name = row.Title,
        Slug = slug,
        Price = price,
        PriceOnRequest = priceOnRequest,
        Description = row.DescriptionClean,
        PackageSize = string.IsNullOrWhiteSpace(row.PackageSize) ? null : row.PackageSize,
        Brand = string.IsNullOrWhiteSpace(row.Brand) ? null : row.Brand,
        VariantGroup = string.IsNullOrWhiteSpace(row.VariantGroup) ? null : row.VariantGroup,
        OlxAdId = string.IsNullOrWhiteSpace(row.OlxAdId) ? null : row.OlxAdId,
        StockStatus = StockStatus.Dostupno,
        IsActive = true,
        IsFeatured = false,
        CreatedAt = now,
        UpdatedAt = now,
    };

    var filenames = row.ImageFilenames
        .Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

    for (var i = 0; i < filenames.Length; i++)
    {
        var sourcePath = ResolveSourcePath(Path.Combine(sourceImagesDir, filenames[i]));
        if (sourcePath is null)
        {
            Console.Error.WriteLine($"  [{slug}] missing source image {filenames[i]}, skipping it");
            continue;
        }

        totalOriginalBytes += new FileInfo(sourcePath).Length;

        var webpFileName = $"{slug}-{i + 1}.webp";
        var webpBytes = ConvertToWebp(sourcePath);
        await File.WriteAllBytesAsync(Path.Combine(destImagesDir, webpFileName), webpBytes);
        totalWebpBytes += webpBytes.Length;

        product.Images.Add(new ProductImage { FileName = webpFileName, SortOrder = i });
    }

    db.Products.Add(product);
    createdCount++;

    if (createdCount % 25 == 0)
    {
        await db.SaveChangesAsync();
        Console.WriteLine($"  ...{createdCount} products imported so far");
    }
}

await db.SaveChangesAsync();

Console.WriteLine();
Console.WriteLine("=== Import complete ===");
Console.WriteLine($"Products created: {createdCount}");
Console.WriteLine($"Products skipped (already imported, matched by OlxAdId): {skippedCount}");
Console.WriteLine($"Original image bytes processed: {totalOriginalBytes:N0} ({totalOriginalBytes / 1024.0 / 1024.0:F2} MB)");
Console.WriteLine($"WebP image bytes written: {totalWebpBytes:N0} ({totalWebpBytes / 1024.0 / 1024.0:F2} MB)");

return 0;

/// <summary>
/// A handful of the scraped source filenames end in a literal "." (a quirk
/// of the original scrape - OLX photo URLs it derived an extension from).
/// Windows' normal file APIs silently strip a trailing dot/space while
/// normalizing the path, so File.Exists/File.Open report such a file as
/// missing even though it's really there. The \\?\ extended-length prefix
/// bypasses that normalization. Returns the path to actually use for
/// reading, or null if the file genuinely doesn't exist either way.
/// </summary>
static string? ResolveSourcePath(string path)
{
    if (File.Exists(path))
    {
        return path;
    }

    var extended = path.StartsWith(@"\\?\") ? path : @"\\?\" + path;
    return File.Exists(extended) ? extended : null;
}

static byte[] ConvertToWebp(string sourcePath)
{
    using var image = Image.Load(sourcePath);
    const int maxDimension = 800;
    if (image.Width > maxDimension || image.Height > maxDimension)
    {
        image.Mutate(x => x.Resize(new ResizeOptions
        {
            Mode = ResizeMode.Max,
            Size = new Size(maxDimension, maxDimension),
        }));
    }

    using var ms = new MemoryStream();
    image.Save(ms, new WebpEncoder { Quality = 80 });
    return ms.ToArray();
}

static string MakeUniqueSlug(string baseSlug, HashSet<string> taken)
{
    if (!taken.Contains(baseSlug))
    {
        return baseSlug;
    }

    var n = 2;
    while (taken.Contains($"{baseSlug}-{n}"))
    {
        n++;
    }

    return $"{baseSlug}-{n}";
}

static string FindRepoRoot()
{
    var dir = new DirectoryInfo(AppContext.BaseDirectory);
    while (dir is not null)
    {
        if (Directory.Exists(Path.Combine(dir.FullName, "raw_podaci")) &&
            Directory.Exists(Path.Combine(dir.FullName, "VetCare.Api")))
        {
            return dir.FullName;
        }

        dir = dir.Parent;
    }

    throw new DirectoryNotFoundException(
        "Could not locate the repo root (a directory containing both raw_podaci/ and VetCare.Api/) " +
        $"walking up from {AppContext.BaseDirectory}");
}

/// <summary>Anchor type for AddUserSecrets&lt;T&gt; - this assembly has no
/// Program class to hang the UserSecretsId attribute off otherwise, since
/// top-level statements compile to a different generated class name.</summary>
internal sealed class Marker;

internal sealed class OlxProductRow
{
    [Name("olx_ad_id")]
    public string OlxAdId { get; set; } = "";

    [Name("title")]
    public string Title { get; set; } = "";

    [Name("slug")]
    public string Slug { get; set; } = "";

    [Name("price")]
    public string Price { get; set; } = "";

    [Name("price_on_request")]
    public string PriceOnRequest { get; set; } = "";

    [Name("description_clean")]
    public string DescriptionClean { get; set; } = "";

    [Name("package_size")]
    public string PackageSize { get; set; } = "";

    [Name("brand")]
    public string Brand { get; set; } = "";

    [Name("variant_group")]
    public string VariantGroup { get; set; } = "";

    [Name("image_filenames")]
    public string ImageFilenames { get; set; } = "";
}
