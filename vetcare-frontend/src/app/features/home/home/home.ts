import { Component } from '@angular/core';
import { HomeHeroComponent } from '../home-hero/home-hero';
import { TrustStripComponent } from '../trust-strip/trust-strip';
import { AboutBandComponent } from '../about-band/about-band';

@Component({
  selector: 'app-home',
  imports: [HomeHeroComponent, TrustStripComponent, AboutBandComponent],
  templateUrl: './home.html',
  styles: [':host { display: block; }'],
})
export class HomeComponent {}
