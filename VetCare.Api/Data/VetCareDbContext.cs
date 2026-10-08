using Microsoft.EntityFrameworkCore;
using VetCare.Api.Models;

namespace VetCare.Api.Data;

public class VetCareDbContext(DbContextOptions<VetCareDbContext> options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<ProductCategory> ProductCategories => Set<ProductCategory>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>(e =>
        {
            e.Property(p => p.Price).HasPrecision(10, 2);
            e.Property(p => p.OldPrice).HasPrecision(10, 2);

            e.HasIndex(p => p.Slug).IsUnique();

            // Filtered unique index: many products legitimately have a null
            // OlxAdId (manually added later), only non-null values must be unique.
            e.HasIndex(p => p.OlxAdId).IsUnique().HasFilter("\"OlxAdId\" IS NOT NULL");

            e.HasIndex(p => p.VariantGroup);

            e.ToTable(t => t.HasCheckConstraint(
                "CK_Product_StockStatus",
                $"\"StockStatus\" IN ('{Models.StockStatus.Dostupno}', '{Models.StockStatus.OgraniceneZalihe}', '{Models.StockStatus.Nedostupno}')"));
        });

        modelBuilder.Entity<ProductImage>(e =>
        {
            e.HasOne(pi => pi.Product)
                .WithMany(p => p.Images)
                .HasForeignKey(pi => pi.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasIndex(pi => new { pi.ProductId, pi.SortOrder });
        });

        modelBuilder.Entity<Category>(e =>
        {
            e.HasIndex(c => c.Slug).IsUnique();
        });

        modelBuilder.Entity<ProductCategory>(e =>
        {
            e.HasKey(pc => new { pc.ProductId, pc.CategoryId });

            e.HasOne(pc => pc.Product)
                .WithMany(p => p.ProductCategories)
                .HasForeignKey(pc => pc.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(pc => pc.Category)
                .WithMany(c => c.ProductCategories)
                .HasForeignKey(pc => pc.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Order>(e =>
        {
            e.Property(o => o.TotalAmount).HasPrecision(10, 2);
            e.HasIndex(o => o.OrderNumber).IsUnique();
        });

        modelBuilder.Entity<OrderItem>(e =>
        {
            e.Property(oi => oi.UnitPriceSnapshot).HasPrecision(10, 2);
            e.Property(oi => oi.LineTotal).HasPrecision(10, 2);

            e.HasOne(oi => oi.Order)
                .WithMany(o => o.Items)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // Keep the order line intact (via the snapshot fields) even if
            // the referenced product is later deleted.
            e.HasOne(oi => oi.Product)
                .WithMany()
                .HasForeignKey(oi => oi.ProductId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
