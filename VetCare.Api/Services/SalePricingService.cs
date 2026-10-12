using System.Linq.Expressions;
using VetCare.Api.Models;

namespace VetCare.Api.Services;

/// <summary>
/// Single source of truth for "is this product's sale currently active" and
/// "what price should be shown for it". Exists so the products API and the
/// future order endpoint never duplicate this rule.
///
/// Primitive-based overloads (decimal?/DateTime? instead of a Product) exist
/// because list/related queries project a handful of raw columns out of SQL
/// before mapping to a DTO in memory - they never materialize a full Product.
/// </summary>
public interface ISalePricingService
{
    /// <summary>Expression form, for use inside EF Core queries (Where/OrderBy)
    /// so the check runs in SQL instead of after materializing every row.</summary>
    Expression<Func<Product, bool>> IsSaleActiveExpression(DateTime now);

    bool IsSaleActive(decimal? price, decimal? oldPrice, DateTime? saleStart, DateTime? saleEnd, DateTime now);

    /// <summary>The price to charge right now. Null only when PriceOnRequest.</summary>
    decimal? GetCurrentPrice(decimal? price, bool priceOnRequest);

    /// <summary>OldPrice to display (struck through) next to the current price,
    /// or null when there is no currently active sale.</summary>
    decimal? GetDisplayOldPrice(decimal? price, decimal? oldPrice, DateTime? saleStart, DateTime? saleEnd, DateTime now);
}

public class SalePricingService : ISalePricingService
{
    public Expression<Func<Product, bool>> IsSaleActiveExpression(DateTime now) => product =>
        product.OldPrice != null
        && product.Price != null
        && product.OldPrice.Value > product.Price.Value
        && (product.SaleStartDate == null || product.SaleStartDate <= now)
        && (product.SaleEndDate == null || product.SaleEndDate >= now);

    public bool IsSaleActive(decimal? price, decimal? oldPrice, DateTime? saleStart, DateTime? saleEnd, DateTime now) =>
        oldPrice != null
        && price != null
        && oldPrice.Value > price.Value
        && (saleStart == null || saleStart <= now)
        && (saleEnd == null || saleEnd >= now);

    public decimal? GetCurrentPrice(decimal? price, bool priceOnRequest) =>
        priceOnRequest ? null : price;

    public decimal? GetDisplayOldPrice(decimal? price, decimal? oldPrice, DateTime? saleStart, DateTime? saleEnd, DateTime now) =>
        IsSaleActive(price, oldPrice, saleStart, saleEnd, now) ? oldPrice : null;
}
