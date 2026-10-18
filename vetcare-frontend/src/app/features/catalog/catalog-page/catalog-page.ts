import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { catchError, of, switchMap, tap } from 'rxjs';
import { Category, PagedResult, ProductListItem, ProductQueryParams, ProductSort } from '../../../core/models/product';
import { ProductService } from '../../../core/services/product.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card';
import { SelectComponent, SelectOption } from '../../../shared/components/select/select';

const PAGE_SIZE = 24;

const SORT_OPTIONS: SelectOption[] = [
  { value: 'newest', label: 'Najnovije' },
  { value: 'name', label: 'Naziv (A-Ž)' },
  { value: 'name-desc', label: 'Naziv (Ž-A)' },
  { value: 'price-asc', label: 'Cijena (niža prvo)' },
  { value: 'price-desc', label: 'Cijena (viša prvo)' },
];

@Component({
  selector: 'app-catalog-page',
  imports: [ProductCardComponent, RouterLink, SelectComponent],
  templateUrl: './catalog-page.html',
  styleUrl: './catalog-page.scss',
})
export class CatalogPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly titleService = inject(Title);

  protected readonly sortOptions = SORT_OPTIONS;
  protected readonly skeletonRows = Array.from({ length: 12 });

  protected readonly loading = signal(true);
  protected readonly errored = signal(false);
  protected readonly result = signal<PagedResult<ProductListItem> | null>(null);
  protected readonly categories = signal<Category[]>([]);

  protected readonly currentCategory = signal('');
  protected readonly currentQuery = signal('');
  protected readonly currentSort = signal<ProductSort>('newest');
  protected readonly currentPage = signal(1);

  protected readonly totalPages = computed(() => {
    const res = this.result();
    return res ? Math.max(1, Math.ceil(res.totalCount / res.pageSize)) : 1;
  });

  protected readonly pageTitle = computed(() => {
    const q = this.currentQuery();
    if (q) return `Rezultati pretrage: "${q}"`;

    const category = this.currentCategory();
    if (category === 'akcije') return 'Akcije';
    if (category) {
      const found = this.categories().find((c) => c.slug === category);
      return found?.name ?? 'Proizvodi';
    }
    return 'Svi proizvodi';
  });

  constructor() {
    this.productService.getCategories().subscribe({
      next: (cats) => this.categories.set(cats),
      error: () => {
      },
    });

    this.route.queryParamMap
      .pipe(
        tap((params) => this.syncStateFromParams(params)),
        switchMap((params) =>
          this.productService.getProducts(this.paramsToQuery(params)).pipe(
            catchError(() => {
              this.errored.set(true);
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((res) => {
        this.result.set(res);
        this.loading.set(false);
        this.titleService.setTitle(`${this.pageTitle()} – VetCare`);
      });
  }

  protected onSortChange(value: string): void {
    this.navigateWithParams({ sort: value === 'newest' ? null : value, page: null });
  }

  protected goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.navigateWithParams({ page: page === 1 ? null : page });
  }

  private syncStateFromParams(params: ParamMap): void {
    this.currentCategory.set(params.get('category') ?? '');
    this.currentQuery.set(params.get('q') ?? '');
    this.currentSort.set((params.get('sort') as ProductSort) || 'newest');
    this.currentPage.set(Number(params.get('page')) || 1);
    this.loading.set(true);
    this.errored.set(false);
  }

  private paramsToQuery(params: ParamMap): ProductQueryParams {
    const minPriceRaw = params.get('minPrice');
    const maxPriceRaw = params.get('maxPrice');
    return {
      category: params.get('category') || undefined,
      q: params.get('q') || undefined,
      sort: (params.get('sort') as ProductSort) || undefined,
      page: Number(params.get('page')) || 1,
      minPrice: minPriceRaw ? Number(minPriceRaw) : undefined,
      maxPrice: maxPriceRaw ? Number(maxPriceRaw) : undefined,
      pageSize: PAGE_SIZE,
    };
  }

  private navigateWithParams(patch: Record<string, string | number | null>): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: patch,
      queryParamsHandling: 'merge',
    });
  }
}
