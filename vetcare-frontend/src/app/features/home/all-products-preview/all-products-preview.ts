import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductListItem } from '../../../core/models/product';
import { ProductService } from '../../../core/services/product.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card';

@Component({
  selector: 'app-all-products-preview',
  imports: [ProductCardComponent, RouterLink],
  templateUrl: './all-products-preview.html',
  styleUrl: './all-products-preview.scss',
})
export class AllProductsPreviewComponent {
  private readonly productService = inject(ProductService);

  protected readonly items = signal<ProductListItem[] | null>(null);
  protected readonly skeletonRows = Array.from({ length: 5 });

  constructor() {
    this.productService
      .getProducts({ sort: 'newest', pageSize: 5 })
      .subscribe({
        next: (res) => this.items.set(res.items),
        error: () => this.items.set([]),
      });
  }
}
