import { Component } from '@angular/core';
import { CATEGORIES, categoryHref } from '../../shared/data/categories';

@Component({
  selector: 'app-category-nav',
  templateUrl: './category-nav.html',
  styleUrl: './category-nav.scss',
})
export class CategoryNavComponent {
  protected readonly categories = CATEGORIES;
  protected readonly categoryHref = categoryHref;
}
