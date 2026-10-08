namespace VetCare.Api.Models;

public class ProductImage
{
    public int Id { get; set; }

    public int ProductId { get; set; }

    public Product Product { get; set; } = null!;

    /// <summary>File name only (e.g. "frontline-combo-2-10kg-1.webp"), served
    /// from /product-images/{FileName}. Not a full URL, so the base URL can
    /// change between environments without touching the data.</summary>
    public required string FileName { get; set; }

    /// <summary>0 = main image.</summary>
    public int SortOrder { get; set; }
}
