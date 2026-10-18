import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Category,
  PagedResult,
  ProductDetail,
  ProductListItem,
  ProductQueryParams,
  RelatedProduct,
} from '../models/product';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);

  getProducts(params: ProductQueryParams): Observable<PagedResult<ProductListItem>> {
    let httpParams = new HttpParams();
    if (params.category) httpParams = httpParams.set('category', params.category);
    if (params.q) httpParams = httpParams.set('q', params.q);
    if (params.minPrice != null) httpParams = httpParams.set('minPrice', params.minPrice);
    if (params.maxPrice != null) httpParams = httpParams.set('maxPrice', params.maxPrice);
    if (params.sort) httpParams = httpParams.set('sort', params.sort);
    if (params.featured) httpParams = httpParams.set('featured', 'true');
    if (params.page != null) httpParams = httpParams.set('page', params.page);
    if (params.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize);

    return this.http.get<PagedResult<ProductListItem>>('/api/products', { params: httpParams });
  }

  getProduct(slug: string): Observable<ProductDetail> {
    return this.http.get<ProductDetail>(`/api/products/${encodeURIComponent(slug)}`);
  }

  getRelated(slug: string): Observable<RelatedProduct[]> {
    return this.http.get<RelatedProduct[]>(`/api/products/${encodeURIComponent(slug)}/related`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>('/api/categories');
  }
}
