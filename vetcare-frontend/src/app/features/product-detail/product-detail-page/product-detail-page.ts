import { Component, Input, computed, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { ProductDetail, RelatedProduct } from '../../../core/models/product';
import { CartService } from '../../../core/services/cart.service';
import { ProductService } from '../../../core/services/product.service';
import { DescriptionComponent } from '../../../shared/components/description/description';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card';
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_HREF } from '../../../shared/data/contact';
import { formatPrice } from '../../../shared/utils/format-price';

@Component({
  selector: 'app-product-detail-page',
  imports: [RouterLink, ProductCardComponent, DescriptionComponent],
  templateUrl: './product-detail-page.html',
  styleUrl: './product-detail-page.scss',
})
export class ProductDetailPageComponent {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly titleService = inject(Title);

  protected readonly loading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly product = signal<ProductDetail | null>(null);
  protected readonly related = signal<RelatedProduct[]>([]);
  protected readonly selectedImageIndex = signal(0);
  protected readonly addedToCart = signal(false);

  protected readonly phoneDisplay = CONTACT_PHONE_DISPLAY;
  protected readonly phoneHref = CONTACT_PHONE_HREF;
  protected readonly formatPrice = formatPrice;

  protected readonly sortedVariants = computed(() => {
    const p = this.product();
    if (!p) return [];
    return [...p.variants].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
  });

  protected readonly isUnavailable = computed(() => this.product()?.stockStatus === 'Nedostupno');

  protected readonly canAddToCart = computed(() => {
    const p = this.product();
    return !!p && !p.priceOnRequest && p.stockStatus !== 'Nedostupno';
  });

  @Input({ required: true })
  set slug(value: string) {
    this.loadProduct(value);
  }

  protected selectImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  protected onAddToCart(): void {
    const p = this.product();
    if (!p || !this.canAddToCart() || p.price == null) return;
    this.cartService.add({
      productId: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      imageUrl: p.imageUrls[0] ?? null,
    });
    this.addedToCart.set(true);
  }

  private loadProduct(slug: string): void {
    this.loading.set(true);
    this.notFound.set(false);
    this.selectedImageIndex.set(0);
    this.addedToCart.set(false);
    this.product.set(null);
    this.related.set([]);

    this.productService.getProduct(slug).subscribe({
      next: (p) => {
        this.product.set(p);
        this.loading.set(false);
        this.titleService.setTitle(`${p.name} – VetCare`);
      },
      error: () => {
        this.loading.set(false);
        this.notFound.set(true);
      },
    });

    this.productService.getRelated(slug).subscribe({
      next: (r) => this.related.set(r),
      error: () => {
      },
    });
  }
}
