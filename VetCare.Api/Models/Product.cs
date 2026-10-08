namespace VetCare.Api.Models;

/// <summary>
/// Stock status as shown to shoppers. Kept as a plain string (constrained via
/// a check constraint in the DB, see VetCareDbContext) rather than an enum
/// column, since the three Bosnian values ARE the display text.
/// </summary>
public static class StockStatus
{
    public const string Dostupno = "Dostupno";
    public const string OgraniceneZalihe = "Ograničene zalihe";
    public const string Nedostupno = "Nedostupno";

    public static readonly string[] All = [Dostupno, OgraniceneZalihe, Nedostupno];
}

public class Product
{
    public int Id { get; set; }

    public required string Name { get; set; }

    /// <summary>URL-friendly identifier. Unique across all products.</summary>
    public required string Slug { get; set; }

    /// <summary>Null when <see cref="PriceOnRequest"/> is true.</summary>
    public decimal? Price { get; set; }

    public bool PriceOnRequest { get; set; }

    /// <summary>Pre-discount price. Together with the sale window, drives the
    /// computed "Akcije" (sale) category on the frontend - there is no
    /// separate IsOnSale column by design.</summary>
    public decimal? OldPrice { get; set; }

    public DateTime? SaleStartDate { get; set; }

    public DateTime? SaleEndDate { get; set; }

    /// <summary>Plain text with line breaks (not HTML). Clinical details
    /// (composition, dosage, withdrawal period, etc.) live inside this text
    /// rather than as separate columns - see the import tool / README for
    /// why.</summary>
    public string Description { get; set; } = string.Empty;

    public string? PackageSize { get; set; }

    public string? Brand { get; set; }

    public string StockStatus { get; set; } = Models.StockStatus.Dostupno;

    /// <summary>Groups size/weight/volume variants of the same underlying
    /// product (e.g. "FRONTLINE Combo"). Null for products with no variants.</summary>
    public string? VariantGroup { get; set; }

    /// <summary>Source OLX ad id, used by the import tool to make re-imports
    /// idempotent. Unique when present; multiple products may have no OLX
    /// origin (null), so this is NOT the primary key.</summary>
    public string? OlxAdId { get; set; }

    public bool IsActive { get; set; } = true;

    public bool IsFeatured { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public List<ProductImage> Images { get; set; } = [];

    public List<ProductCategory> ProductCategories { get; set; } = [];
}
