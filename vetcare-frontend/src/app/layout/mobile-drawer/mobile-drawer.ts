import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CATEGORIES, categoryHref } from '../../shared/data/categories';

@Component({
  selector: 'app-mobile-drawer',
  templateUrl: './mobile-drawer.html',
  styleUrl: './mobile-drawer.scss',
})
export class MobileDrawerComponent {
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();

  protected readonly categories = CATEGORIES;
  protected readonly categoryHref = categoryHref;
}
