namespace VetCare.Api.Models;

public class Category
{
    public int Id { get; set; }

    public required string Name { get; set; }

    /// <summary>Must match vetcare-frontend's CATEGORIES slugs exactly - the
    /// nav links to /proizvodi?category={Slug}.</summary>
    public required string Slug { get; set; }

    public int DisplayOrder { get; set; }

    public List<ProductCategory> ProductCategories { get; set; } = [];
}
