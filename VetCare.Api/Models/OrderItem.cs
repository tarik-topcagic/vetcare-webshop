namespace VetCare.Api.Models;

public class OrderItem
{
    public int Id { get; set; }

    public int OrderId { get; set; }

    public Order Order { get; set; } = null!;

    /// <summary>Null if the product was later deleted - the snapshot fields
    /// below keep the order's own record intact regardless.</summary>
    public int? ProductId { get; set; }

    public Product? Product { get; set; }

    public required string ProductNameSnapshot { get; set; }

    public decimal UnitPriceSnapshot { get; set; }

    public int Quantity { get; set; }

    public decimal LineTotal { get; set; }
}
