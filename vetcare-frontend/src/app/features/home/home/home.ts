import { Component } from '@angular/core';
import { HomeHeroComponent } from '../home-hero/home-hero';
import { TrustStripComponent } from '../trust-strip/trust-strip';

@Component({
  selector: 'app-home',
  imports: [HomeHeroComponent, TrustStripComponent],
  templateUrl: './home.html',
  styles: [':host { display: block; }'],
})
export class HomeComponent {}
