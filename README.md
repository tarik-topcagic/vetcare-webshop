# VetCare

- `VetCare.Api` — ASP.NET Core 8 Web API, serves the built Angular app from `wwwroot` plus
  product photos from `VetCare.Api/product-images`.
- `vetcare-frontend` — Angular app. `ng build` outputs straight into `VetCare.Api/wwwroot`.
- `VetCare.Import` — one-time/idempotent console tool that imports the cleaned OLX product
  export into the database. Not part of the running app; run it manually when needed.

## Prerequisites

- .NET 8 SDK (see `global.json`)
- Node.js + Angular CLI (for `vetcare-frontend`)
- PostgreSQL 16+ running locally (or reachable) for `VetCare.Api`'s database

## Database setup (fresh machine)

1. **Create a dedicated database role and database.** Don't use the `postgres` superuser for
   the app. Connect as an existing superuser (e.g. via the "SQL Shell (psql)" the PostgreSQL
   installer adds to the Start menu) and run:

   ```sql
   CREATE ROLE vetcare_app WITH LOGIN PASSWORD 'choose-a-strong-password-here';
   CREATE DATABASE vetcare OWNER vetcare_app;
   ```

2. **Store the connection string in user secrets** (never in `appsettings*.json` — those are
   committed to git):

   ```sh
   cd VetCare.Api
   dotnet user-secrets init   # only needed once; already done in this repo
   dotnet user-secrets set "ConnectionStrings:DefaultConnection" \
     "Host=localhost;Port=5432;Database=vetcare;Username=vetcare_app;Password=choose-a-strong-password-here"
   ```

   In production, set the `ConnectionStrings__DefaultConnection` environment variable instead
   (double underscore — that's how .NET configuration maps env vars to the nested
   `ConnectionStrings:DefaultConnection` key).

3. **Apply migrations** to create the schema:

   ```sh
   cd VetCare.Api
   dotnet ef database update
   ```

   This creates all tables (Products, ProductImages, Categories, ProductCategories, Orders,
   OrderItems). The 10 product categories are seeded automatically the first time the API
   starts (only if the Categories table is empty — see `Data/DbSeeder.cs`), not by the
   migration itself.

4. **(Optional, once) import the OLX product catalog.** Requires `raw_podaci/` to be present
   locally (it's gitignored, not part of the repo) with `olx_products_clean.csv` and
   `olx_images/`:

   ```sh
   cd VetCare.Import
   dotnet run
   ```

   Safe to re-run — it matches existing products by their OLX ad id and skips ones already
   imported, so running it twice does not create duplicates.

## Running the app

```sh
cd VetCare.Api
dotnet run
```

For frontend development with live reload, run `ng serve` in `vetcare-frontend` instead (it
proxies `/api` to the API per `proxy.conf.json`) rather than rebuilding into `wwwroot` on every
change.

## Adding a new migration later

```sh
cd VetCare.Api
dotnet ef migrations add <DescriptiveName>
dotnet ef database update
```
