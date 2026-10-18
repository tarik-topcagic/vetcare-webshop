import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductListItem } from '../../../core/models/product';
import { ProductService } from '../../../core/services/product.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card';

@Component({
  selector: 'app-featured-section',
  imports: [ProductCardComponent, RouterLink],
  templateUrl: './featured-section.html',
  styleUrl: './featured-section.scss',
})
export class FeaturedSectionComponent {
  private readonly productService = inject(ProductService);

  protected readonly items = signal<ProductListItem[]>([]);

  constructor() {
    this.productService
      .getProducts({ featured: true, sort: 'newest', pageSize: 8 })
      .subscribe({
        next: (res) => this.items.set(res.items),
        error: () => {
        },
      });
  }
}
