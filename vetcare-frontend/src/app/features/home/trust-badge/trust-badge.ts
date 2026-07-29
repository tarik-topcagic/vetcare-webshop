import { Component, Input } from '@angular/core';

export type TrustBadgeIcon = 'shield' | 'pin' | 'phone';

@Component({
  selector: 'app-trust-badge',
  templateUrl: './trust-badge.html',
  styleUrl: './trust-badge.scss',
})
export class TrustBadgeComponent {
  @Input({ required: true }) icon!: TrustBadgeIcon;
  @Input({ required: true }) title!: string;
  @Input({ required: true }) subtitle!: string;
}
