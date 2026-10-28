import { Component } from '@angular/core';
import { HomeHeroComponent } from '../home-hero/home-hero';
import { TrustStripComponent } from '../trust-strip/trust-strip';
import { SaleSectionComponent } from '../sale-section/sale-section';
import { FeaturedSectionComponent } from '../featured-section/featured-section';
import { AllProductsPreviewComponent } from '../all-products-preview/all-products-preview';
import { AboutBandComponent } from '../about-band/about-band';

@Component({
  selector: 'app-home',
  imports: [
    HomeHeroComponent,
    TrustStripComponent,
    SaleSectionComponent,
    FeaturedSectionComponent,
    AllProductsPreviewComponent,
    AboutBandComponent,
  ],
  templateUrl: './home.html',
  styles: [':host { display: block; }'],
})
export class HomeComponent {}
