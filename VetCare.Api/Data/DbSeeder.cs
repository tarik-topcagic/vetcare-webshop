using Microsoft.EntityFrameworkCore;
using VetCare.Api.Models;

namespace VetCare.Api.Data;

public static class DbSeeder
{
    /// <summary>
    /// Slugs copied verbatim from vetcare-frontend/src/app/shared/data/categories.ts
    /// so the nav's ?category=&lt;slug&gt; links resolve. "Svi proizvodi" (no
    /// filter) and "Akcije" (computed from OldPrice/sale dates) are
    /// deliberately not real categories, so they're not seeded here.
    /// </summary>
    private static readonly (string Name, string Slug)[] CategorySeed =
    [
        ("Pas", "psi"),
        ("Mačka", "macke"),
        ("Krava", "krave"),
        ("Konj", "konji"),
        ("Ovca", "ovce"),
        ("Koza", "koze"),
        ("Peradarstvo", "peradarstvo"),
        ("Kreme/Gelovi", "kreme-gelovi"),
        ("Dezinficijensi", "dezinficijensi"),
        ("Ostalo", "ostalo"),
    ];

    public static async Task SeedCategoriesAsync(VetCareDbContext db)
    {
        if (await db.Categories.AnyAsync())
        {
            return;
        }

        var order = 0;
        foreach (var (name, slug) in CategorySeed)
        {
            db.Categories.Add(new Category { Name = name, Slug = slug, DisplayOrder = order++ });
        }

        await db.SaveChangesAsync();
    }
}
