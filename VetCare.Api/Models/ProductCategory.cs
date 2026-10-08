namespace VetCare.Api.Models;

/// <summary>Many-to-many join between Product and Category. Composite key
/// (ProductId, CategoryId) configured in VetCareDbContext - no surrogate Id.</summary>
public class ProductCategory
{
    public int ProductId { get; set; }

    public Product Product { get; set; } = null!;

    public int CategoryId { get; set; }

    public Category Category { get; set; } = null!;
}
