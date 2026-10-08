namespace VetCare.Api.Models;

public static class OrderStatus
{
    public const string Nova = "Nova";
}

public class Order
{
    public int Id { get; set; }

    /// <summary>Human-facing order number, format "VC-0001". Unique.</summary>
    public required string OrderNumber { get; set; }

    public required string CustomerName { get; set; }

    public required string CustomerPhone { get; set; }

    public required string CustomerEmail { get; set; }

    public string Status { get; set; } = OrderStatus.Nova;

    public decimal TotalAmount { get; set; }

    public bool EmailSent { get; set; }

    public DateTime CreatedAt { get; set; }

    public List<OrderItem> Items { get; set; } = [];
}
