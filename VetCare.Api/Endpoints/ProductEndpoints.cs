using Microsoft.EntityFrameworkCore;
using VetCare.Api.Data;
using VetCare.Api.Dtos;
using VetCare.Api.Services;

namespace VetCare.Api.Endpoints;

public static class ProductEndpoints
{
    private const int DefaultPageSize = 24;
    private const int MaxPageSize = 60;

    /// <summary>Raw columns pulled out of SQL for one product card (list item or
    /// related item). Mapped to a public DTO in memory via ISalePricingService
    /// so the sale rule is applied in exactly one place.</summary>
    private sealed record ProductCardRow(
        int Id,
        string Name,
        string Slug,
        decimal? Price,
        bool PriceOnRequest,
        decimal? OldPrice,
        DateTime? SaleStartDate,
        DateTime? SaleEndDate,
        string? PackageSize,
        string? Brand,
        string StockStatus,
        string? VariantGroup,
        string? MainImageUrl,
        List<string> CategorySlugs);

    public static void MapProductEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/products", GetProducts);
        app.MapGet("/api/products/{slug}", GetProductBySlug);
        app.MapGet("/api/products/{slug}/related", GetRelatedProducts);
        app.MapGet("/api/categories", GetCategories);
    }

    private static async Task<IResult> GetProducts(
        VetCareDbContext db,
        ISalePricingService pricing,
        string? category,
        string? q,
        decimal? minPrice,
        decimal? maxPrice,
        string? sort,
        int page = 1,
        int pageSize = DefaultPageSize)
    {
        if (minPrice is < 0 || maxPrice is < 0)
        {
            return Results.BadRequest(new { error = "minPrice and maxPrice must not be negative." });
        }

        if (minPrice is not null && maxPrice is not null && minPrice > maxPrice)
        {
            return Results.BadRequest(new { error = "minPrice must not be greater than maxPrice." });
        }

        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? DefaultPageSize : Math.Min(pageSize, MaxPageSize);

        var now = DateTime.UtcNow;
        var query = db.Products.AsNoTracking().Where(p => p.IsActive);

        var normalizedCategory = category?.Trim().ToLowerInvariant();
        if (normalizedCategory == "akcije")
        {
            query = query.Where(pricing.IsSaleActiveExpression(now));
        }
        else if (!string.IsNullOrEmpty(normalizedCategory))
        {
            var categoryExists = await db.Categories.AnyAsync(c => c.Slug == normalizedCategory);
            if (!categoryExists)
            {
                // Unknown category slug: empty result, not a 500.
                return Results.Ok(new PagedResult<ProductListItemDto>([], 0, page, pageSize));
            }

            query = query.Where(p => p.ProductCategories.Any(pc => pc.Category.Slug == normalizedCategory));
        }

        if (!string.IsNullOrWhiteSpace(q))
        {
            query = query.Where(p =>
                EF.Functions.ILike(p.Name, $"%{q}%")
                || (p.Brand != null && EF.Functions.ILike(p.Brand, $"%{q}%")));
        }

        if (minPrice is not null)
        {
            query = query.Where(p => p.Price >= minPrice);
        }

        if (maxPrice is not null)
        {
            query = query.Where(p => p.Price <= maxPrice);
        }

        var totalCount = await query.CountAsync();

        // Available products always sort before "Nedostupno" ones, regardless
        // of the chosen sort - applied as the primary sort key.
        var ordered = query.OrderBy(p => p.StockStatus == Models.StockStatus.Nedostupno ? 1 : 0);

        ordered = (sort?.Trim().ToLowerInvariant()) switch
        {
            "name" => ordered.ThenBy(p => p.Name),
            "price-asc" => ordered.ThenBy(p => p.Price),
            "price-desc" => ordered.ThenByDescending(p => p.Price),
            _ => ordered.ThenByDescending(p => p.CreatedAt), // "newest" and default
        };

        var rows = await ordered
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ProductCardRow(
                p.Id,
                p.Name,
                p.Slug,
                p.Price,
                p.PriceOnRequest,
                p.OldPrice,
                p.SaleStartDate,
                p.SaleEndDate,
                p.PackageSize,
                p.Brand,
                p.StockStatus,
                p.VariantGroup,
                p.Images.Where(i => i.SortOrder == 0).Select(i => "/product-images/" + i.FileName).FirstOrDefault(),
                p.ProductCategories.Select(pc => pc.Category.Slug).ToList()))
            .ToListAsync();

        var items = rows.Select(r => new ProductListItemDto(
            r.Id,
            r.Name,
            r.Slug,
            pricing.GetCurrentPrice(r.Price, r.PriceOnRequest),
            r.PriceOnRequest,
            pricing.GetDisplayOldPrice(r.Price, r.OldPrice, r.SaleStartDate, r.SaleEndDate, now),
            r.PackageSize,
            r.Brand,
            r.StockStatus,
            r.VariantGroup,
            r.MainImageUrl,
            r.CategorySlugs)).ToList();

        return Results.Ok(new PagedResult<ProductListItemDto>(items, totalCount, page, pageSize));
    }

    private static async Task<IResult> GetProductBySlug(string slug, VetCareDbContext db, ISalePricingService pricing)
    {
        var now = DateTime.UtcNow;

        var row = await db.Products
            .AsNoTracking()
            .Where(p => p.Slug == slug && p.IsActive)
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.Slug,
                p.Price,
                p.PriceOnRequest,
                p.OldPrice,
                p.SaleStartDate,
                p.SaleEndDate,
                p.Description,
                p.PackageSize,
                p.Brand,
                p.StockStatus,
                p.VariantGroup,
                ImageUrls = p.Images.OrderBy(i => i.SortOrder).Select(i => "/product-images/" + i.FileName).ToList(),
                Categories = p.ProductCategories.Select(pc => new ProductCategoryDto(pc.Category.Slug, pc.Category.Name)).ToList(),
            })
            .FirstOrDefaultAsync();

        if (row is null)
        {
            return Results.NotFound();
        }

        var variants = new List<ProductVariantDto>();
        if (row.VariantGroup is not null)
        {
            variants = await db.Products
                .AsNoTracking()
                .Where(p => p.VariantGroup == row.VariantGroup && p.Id != row.Id && p.IsActive)
                .Select(p => new ProductVariantDto(
                    p.Name,
                    p.Slug,
                    p.PackageSize,
                    pricing.GetCurrentPrice(p.Price, p.PriceOnRequest),
                    p.StockStatus))
                .ToListAsync();
        }

        var dto = new ProductDetailDto(
            row.Id,
            row.Name,
            row.Slug,
            pricing.GetCurrentPrice(row.Price, row.PriceOnRequest),
            row.PriceOnRequest,
            pricing.GetDisplayOldPrice(row.Price, row.OldPrice, row.SaleStartDate, row.SaleEndDate, now),
            row.PackageSize,
            row.Brand,
            row.StockStatus,
            row.VariantGroup,
            row.Description,
            row.ImageUrls,
            row.Categories,
            variants);

        return Results.Ok(dto);
    }

    private static async Task<IResult> GetRelatedProducts(string slug, VetCareDbContext db, ISalePricingService pricing)
    {
        var now = DateTime.UtcNow;

        var product = await db.Products
            .AsNoTracking()
            .Where(p => p.Slug == slug && p.IsActive)
            .Select(p => new { p.Id })
            .FirstOrDefaultAsync();

        if (product is null)
        {
            return Results.NotFound();
        }

        var categoryIds = await db.ProductCategories
            .Where(pc => pc.ProductId == product.Id)
            .Select(pc => pc.CategoryId)
            .ToListAsync();

        if (categoryIds.Count == 0)
        {
            return Results.Ok(new List<RelatedProductDto>());
        }

        var rows = await db.Products
            .AsNoTracking()
            .Where(p => p.IsActive && p.Id != product.Id && p.ProductCategories.Any(pc => categoryIds.Contains(pc.CategoryId)))
            .OrderByDescending(p => p.ProductCategories.Count(pc => categoryIds.Contains(pc.CategoryId)))
            .ThenByDescending(p => p.CreatedAt)
            .Take(4)
            .Select(p => new ProductCardRow(
                p.Id,
                p.Name,
                p.Slug,
                p.Price,
                p.PriceOnRequest,
                p.OldPrice,
                p.SaleStartDate,
                p.SaleEndDate,
                p.PackageSize,
                p.Brand,
                p.StockStatus,
                p.VariantGroup,
                p.Images.Where(i => i.SortOrder == 0).Select(i => "/product-images/" + i.FileName).FirstOrDefault(),
                new List<string>()))
            .ToListAsync();

        var items = rows.Select(r => new RelatedProductDto(
            r.Id,
            r.Name,
            r.Slug,
            pricing.GetCurrentPrice(r.Price, r.PriceOnRequest),
            r.PriceOnRequest,
            pricing.GetDisplayOldPrice(r.Price, r.OldPrice, r.SaleStartDate, r.SaleEndDate, now),
            r.PackageSize,
            r.Brand,
            r.StockStatus,
            r.MainImageUrl)).ToList();

        return Results.Ok(items);
    }

    private static async Task<IResult> GetCategories(VetCareDbContext db)
    {
        var categories = await db.Categories
            .AsNoTracking()
            .OrderBy(c => c.DisplayOrder)
            .Select(c => new CategoryDto(
                c.Name,
                c.Slug,
                c.ProductCategories.Count(pc => pc.Product.IsActive)))
            .ToListAsync();

        return Results.Ok(categories);
    }
}
