import { Component, ElementRef, EventEmitter, Input, Output, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { Subject, catchError, debounceTime, distinctUntilChanged, map, of, switchMap } from 'rxjs';
import { ProductListItem } from '../../../core/models/product';
import { SearchService } from '../../../core/services/search.service';
import { CONTACT_PHONE_DISPLAY } from '../../data/contact';
import { matchCategories } from '../../data/search-categories';
import { formatPrice } from '../../utils/format-price';
import { SuggestionRow } from './suggestion-row';

function productSubtitle(p: ProductListItem): string {
  const parts = [p.brand, p.packageSize].filter((v): v is string => !!v);
  if (parts.length > 0) return parts.join(' · ');
  if (p.priceOnRequest) return 'Pozovite za cijenu';
  return p.price != null ? formatPrice(p.price) : '';
}

@Component({
  selector: 'app-search-suggestions',
  imports: [RouterLink],
  templateUrl: './search-suggestions.html',
  styleUrl: './search-suggestions.scss',
})
export class SearchSuggestionsComponent {
  @Input() activeIndex = -1;
  @Input() showHistory = true;
  @Input() maxHeightVh = 60;

  @Output() readonly rowsChange = new EventEmitter<SuggestionRow[]>();

  private readonly searchService = inject(SearchService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  protected readonly phoneDisplay = CONTACT_PHONE_DISPLAY;

  private readonly queryInternal = signal('');
  private readonly categoryRowsInternal = signal<SuggestionRow[]>([]);
  protected readonly productRows = signal<SuggestionRow[]>([]);
  protected readonly loading = signal(false);
  protected readonly errored = signal(false);
  protected readonly historyRows = signal<SuggestionRow[]>([]);

  private readonly query$ = new Subject<string>();

  @Input()
  set query(value: string) {
    const raw = value ?? '';
    this.queryInternal.set(raw);
    const trimmed = raw.trim();
    this.categoryRowsInternal.set(trimmed ? this.buildCategoryRows(trimmed) : []);
    if (trimmed.length < 2) {
      this.productRows.set([]);
      this.loading.set(false);
      this.errored.set(false);
    }
    if (!trimmed) {
      this.refreshHistory();
    }
    this.query$.next(trimmed);
  }
  get query(): string {
    return this.queryInternal();
  }

  protected readonly hasQuery = computed(() => this.queryInternal().trim().length > 0);

  protected readonly rows = computed<SuggestionRow[]>(() => {
    if (!this.hasQuery()) return this.showHistory ? this.historyRows() : [];
    return [...this.categoryRowsInternal(), ...this.productRows()].slice(0, 6);
  });

  constructor() {
    this.refreshHistory();

    effect(() => this.rowsChange.emit(this.rows()));

    this.query$
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((q) => {
          if (q.length < 2) return of(null);
          this.loading.set(true);
          this.errored.set(false);
          return this.searchService.searchProducts(q).pipe(
            map((items) => ({ items, error: false })),
            catchError(() => of({ items: [] as ProductListItem[], error: true })),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((result) => {
        if (!result) return;
        this.loading.set(false);
        this.errored.set(result.error);
        this.productRows.set(
          result.error
            ? []
            : result.items.map((p) => ({
                kind: 'product' as const,
                id: `p-${p.id}`,
                title: p.name,
                subtitle: productSubtitle(p),
                thumbnail: p.mainImageUrl,
                routerLink: ['/proizvodi', p.slug],
              })),
        );
      });
  }

  private buildCategoryRows(query: string): SuggestionRow[] {
    return matchCategories(query).map((c) => ({
      kind: 'category' as const,
      id: `c-${c.slug}`,
      title: c.label,
      subtitle: c.subtitle,
      thumbnail: c.image,
      icon: !c.image,
      routerLink: ['/proizvodi'],
      queryParams: { category: c.slug },
    }));
  }

  private refreshHistory(): void {
    this.historyRows.set(
      this.searchService.getHistory().map((text, i) => ({
        kind: 'history' as const,
        id: `h-${i}-${text}`,
        title: text,
        routerLink: ['/proizvodi'],
        queryParams: { q: text },
      })),
    );
  }

  protected rowId(index: number): string {
    return `search-option-${index}`;
  }

  protected onRowClick(row: SuggestionRow): void {
    if (row.kind === 'history') {
      this.searchService.addToHistory(row.title);
      return;
    }
    const q = this.queryInternal().trim();
    if (q.length >= 2) {
      this.searchService.addToHistory(q);
    }
  }

  activateRow(index: number): void {
    const nodes = this.elementRef.nativeElement.querySelectorAll('.sg-row');
    const el = nodes[index] as HTMLElement | undefined;
    el?.click();
  }

  protected onViewAllClick(): void {
    const q = this.queryInternal().trim();
    if (q.length >= 2) {
      this.searchService.addToHistory(q);
    }
  }

  protected removeHistoryItem(text: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.searchService.removeFromHistory(text);
    this.refreshHistory();
  }

  protected clearHistory(): void {
    this.searchService.clearHistory();
    this.refreshHistory();
  }
}
