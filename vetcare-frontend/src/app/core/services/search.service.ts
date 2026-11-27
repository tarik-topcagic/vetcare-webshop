import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ProductService } from './product.service';
import { ProductListItem } from '../models/product';
import { normalizeSearchText } from '../../shared/utils/normalize-search-text';

const HISTORY_KEY = 'vc_recent_searches';
const MAX_HISTORY = 5;
const MIN_LENGTH = 2;

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly productService = inject(ProductService);

  searchProducts(q: string): Observable<ProductListItem[]> {
    return this.productService.getProducts({ q, pageSize: 5 }).pipe(map((res) => res.items));
  }

  getHistory(): string[] {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
    } catch {
      return [];
    }
  }

  addToHistory(text: string): void {
    const trimmed = text.trim();
    if (trimmed.length < MIN_LENGTH) return;
    const normalized = normalizeSearchText(trimmed);
    try {
      const current = this.getHistory().filter((item) => normalizeSearchText(item) !== normalized);
      const updated = [trimmed, ...current].slice(0, MAX_HISTORY);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch {
    }
  }

  removeFromHistory(text: string): void {
    try {
      const updated = this.getHistory().filter((item) => item !== text);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch {
    }
  }

  clearHistory(): void {
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
    }
  }
}
