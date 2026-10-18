import { Injectable, computed, signal } from '@angular/core';
import { CartItem } from '../models/cart-item';

const STORAGE_KEY = 'vetcare-cart';
const MAX_QUANTITY_PER_ITEM = 20;

function loadFromStorage(): CartItem[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<CartItem[]>(loadFromStorage());

  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().reduce((sum, item) => sum + item.quantity, 0));
  readonly subtotal = computed(() =>
    this._items().reduce((sum, item) => sum + item.price * item.quantity, 0),
  );

  add(item: Omit<CartItem, 'quantity'>, quantity = 1): void {
    this._items.update((items) => {
      const existing = items.find((i) => i.productId === item.productId);
      if (existing) {
        const newQuantity = Math.min(MAX_QUANTITY_PER_ITEM, existing.quantity + quantity);
        return items.map((i) =>
          i.productId === item.productId ? { ...i, quantity: newQuantity } : i,
        );
      }
      return [...items, { ...item, quantity: Math.min(MAX_QUANTITY_PER_ITEM, quantity) }];
    });
    this.persist();
  }

  setQuantity(productId: number, quantity: number): void {
    const clamped = Math.max(1, Math.min(MAX_QUANTITY_PER_ITEM, quantity));
    this._items.update((items) =>
      items.map((i) => (i.productId === productId ? { ...i, quantity: clamped } : i)),
    );
    this.persist();
  }

  remove(productId: number): void {
    this._items.update((items) => items.filter((i) => i.productId !== productId));
    this.persist();
  }

  clear(): void {
    this._items.set([]);
    this.persist();
  }

  private persist(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._items()));
  }
}
