namespace VetCare.Api.Dtos;

public record ProductListItemDto(
    int Id,
    string Name,
    string Slug,
    decimal? Price,
    bool PriceOnRequest,
    decimal? OldPrice,
    string? PackageSize,
    string? Brand,
    string StockStatus,
    string? VariantGroup,
    string? MainImageUrl,
    List<string> Categories);

public record PagedResult<T>(
    List<T> Items,
    int TotalCount,
    int Page,
    int PageSize);

public record ProductCategoryDto(string Slug, string Name);

public record ProductVariantDto(
    string Name,
    string Slug,
    string? PackageSize,
    decimal? Price,
    string StockStatus);

public record ProductDetailDto(
    int Id,
    string Name,
    string Slug,
    decimal? Price,
    bool PriceOnRequest,
    decimal? OldPrice,
    string? PackageSize,
    string? Brand,
    string StockStatus,
    string? VariantGroup,
    string Description,
    List<string> ImageUrls,
    List<ProductCategoryDto> Categories,
    List<ProductVariantDto> Variants);

public record RelatedProductDto(
    int Id,
    string Name,
    string Slug,
    decimal? Price,
    bool PriceOnRequest,
    decimal? OldPrice,
    string? PackageSize,
    string? Brand,
    string StockStatus,
    string? MainImageUrl);

public record CategoryDto(string Name, string Slug, int ProductCount);
