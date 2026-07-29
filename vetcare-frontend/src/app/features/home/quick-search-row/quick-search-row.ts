import { Component } from '@angular/core';
import { QuickSearchPillComponent, QuickSearchIcon } from '../quick-search-pill/quick-search-pill';

interface QuickSearchPillData {
  label: string;
  slug: string;
  icon: QuickSearchIcon;
}

const PILLS: QuickSearchPillData[] = [
  { label: 'Gelovi i kreme', slug: 'kreme-gelovi', icon: 'bottle' },
  { label: 'Dezinficijensi', slug: 'dezinficijensi', icon: 'drop' },
  { label: 'Ostalo', slug: 'ostalo', icon: 'box' },
];

@Component({
  selector: 'app-quick-search-row',
  imports: [QuickSearchPillComponent],
  templateUrl: './quick-search-row.html',
  styleUrl: './quick-search-row.scss',
})
export class QuickSearchRowComponent {
  protected readonly pills = PILLS;
}
