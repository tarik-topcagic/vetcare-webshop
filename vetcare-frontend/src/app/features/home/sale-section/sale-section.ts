import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductListItem } from '../../../core/models/product';
import { ProductService } from '../../../core/services/product.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card';

@Component({
  selector: 'app-sale-section',
  imports: [ProductCardComponent, RouterLink],
  templateUrl: './sale-section.html',
  styleUrl: './sale-section.scss',
})
export class SaleSectionComponent {
  private readonly productService = inject(ProductService);

  protected readonly items = signal<ProductListItem[]>([]);

  constructor() {
    this.productService
      .getProducts({ category: 'akcije', sort: 'newest', pageSize: 8 })
      .subscribe({
        next: (res) => this.items.set(res.items),
        error: () => {
        },
      });
  }
}
