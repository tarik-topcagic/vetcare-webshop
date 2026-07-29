import { Component } from '@angular/core';
import { TrustBadgeComponent, TrustBadgeIcon } from '../trust-badge/trust-badge';

interface TrustBadgeData {
  icon: TrustBadgeIcon;
  title: string;
  subtitle: string;
}

const BADGES: TrustBadgeData[] = [
  { icon: 'shield', title: 'Bira veterinarski tim', subtitle: 'Provjeren asortiman' },
  { icon: 'pin', title: 'Preuzimanje ili dogovor', subtitle: 'Bez obaveznog kartičnog plaćanja' },
  { icon: 'phone', title: 'Savjet uz narudžbu', subtitle: 'Zovemo da potvrdimo detalje' },
];

@Component({
  selector: 'app-trust-strip',
  imports: [TrustBadgeComponent],
  templateUrl: './trust-strip.html',
  styleUrl: './trust-strip.scss',
})
export class TrustStripComponent {
  protected readonly badges = BADGES;
}
