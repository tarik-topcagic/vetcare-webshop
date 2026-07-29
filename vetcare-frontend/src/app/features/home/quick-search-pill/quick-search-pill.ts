import { Component, Input } from '@angular/core';
import { categoryHref } from '../../../shared/data/categories';

export type QuickSearchIcon = 'bottle' | 'drop' | 'box';

@Component({
  selector: 'app-quick-search-pill',
  templateUrl: './quick-search-pill.html',
  styleUrl: './quick-search-pill.scss',
})
export class QuickSearchPillComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) slug!: string;
  @Input({ required: true }) icon!: QuickSearchIcon;

  protected get href(): string {
    return categoryHref(this.slug);
  }
}
