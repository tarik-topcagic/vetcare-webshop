export type StockStatus = 'Dostupno' | 'Ograničene zalihe' | 'Nedostupno';

export type ProductSort = 'name' | 'name-desc' | 'price-asc' | 'price-desc' | 'newest';

export interface ProductCardData {
  id: number;
  name: string;
  slug: string;
  price: number | null;
  priceOnRequest: boolean;
  oldPrice: number | null;
  packageSize: string | null;
  brand: string | null;
  stockStatus: StockStatus;
  mainImageUrl: string | null;
}

export interface ProductListItem extends ProductCardData {
  variantGroup: string | null;
  categories: string[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface ProductCategory {
  slug: string;
  name: string;
}

export interface ProductVariant {
  name: string;
  slug: string;
  packageSize: string | null;
  price: number | null;
  stockStatus: StockStatus;
}

export interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  price: number | null;
  priceOnRequest: boolean;
  oldPrice: number | null;
  packageSize: string | null;
  brand: string | null;
  stockStatus: StockStatus;
  variantGroup: string | null;
  description: string;
  imageUrls: string[];
  categories: ProductCategory[];
  variants: ProductVariant[];
}

export type RelatedProduct = ProductCardData;

export interface Category {
  name: string;
  slug: string;
  productCount: number;
}

export interface ProductQueryParams {
  category?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
  featured?: boolean;
  page?: number;
  pageSize?: number;
}
