import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home/home';
import { AboutPageComponent } from './features/about/about-page/about-page';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'VetCare – Veterinarska apoteka' },
  { path: 'o-nama', component: AboutPageComponent, title: 'O nama – VetCare' },
  {
    path: 'proizvodi',
    loadComponent: () =>
      import('./features/catalog/catalog-page/catalog-page').then((m) => m.CatalogPageComponent),
    title: 'Proizvodi – VetCare',
  },
  {
    path: 'proizvodi/:slug',
    loadComponent: () =>
      import('./features/product-detail/product-detail-page/product-detail-page').then(
        (m) => m.ProductDetailPageComponent,
      ),
  },
];
