import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductListItem } from '../../../core/models/product';
import { ProductService } from '../../../core/services/product.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card';
import { RevealOnScrollDirective } from '../../../shared/directives/reveal-on-scroll/reveal-on-scroll';

@Component({
  selector: 'app-all-products-preview',
  imports: [ProductCardComponent, RouterLink, RevealOnScrollDirective],
  templateUrl: './all-products-preview.html',
  styleUrl: './all-products-preview.scss',
})
export class AllProductsPreviewComponent {
  private readonly productService = inject(ProductService);

  protected readonly items = signal<ProductListItem[] | null>(null);
  protected readonly skeletonRows = Array.from({ length: 5 });

  private readonly mobileQuery = window.matchMedia('(max-width: 599px)');
  protected readonly isMobile = signal(this.mobileQuery.matches);

  constructor() {
    this.productService
      .getProducts({ sort: 'newest', pageSize: 5 })
      .subscribe({
        next: (res) => this.items.set(res.items),
        error: () => this.items.set([]),
      });

    const onChange = (event: MediaQueryListEvent) => this.isMobile.set(event.matches);
    this.mobileQuery.addEventListener('change', onChange);
    inject(DestroyRef).onDestroy(() => this.mobileQuery.removeEventListener('change', onChange));
  }
}
