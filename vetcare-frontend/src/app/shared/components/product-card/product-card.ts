import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { ProductCardData } from '../../../core/models/product';
import { formatPrice } from '../../utils/format-price';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCardComponent {
  @Input({ required: true }) product!: ProductCardData;
  @Input() imgPriority = false;

  private readonly cartService = inject(CartService);

  protected readonly formatPrice = formatPrice;

  protected get isUnavailable(): boolean {
    return this.product.stockStatus === 'Nedostupno';
  }

  protected get canAddToCart(): boolean {
    return !this.product.priceOnRequest && !this.isUnavailable;
  }

  protected onAddToCart(): void {
    if (!this.canAddToCart || this.product.price == null) return;
    this.cartService.add({
      productId: this.product.id,
      name: this.product.name,
      slug: this.product.slug,
      price: this.product.price,
      imageUrl: this.product.mainImageUrl,
    });
  }
}
