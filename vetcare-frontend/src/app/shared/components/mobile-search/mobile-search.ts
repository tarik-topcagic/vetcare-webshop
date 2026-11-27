import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { SearchService } from '../../../core/services/search.service';
import { SearchSuggestionsComponent } from '../search-suggestions/search-suggestions';
import { SuggestionRow } from '../search-suggestions/suggestion-row';

const DESKTOP_BREAKPOINT = 920;

@Component({
  selector: 'app-mobile-search',
  imports: [SearchSuggestionsComponent],
  templateUrl: './mobile-search.html',
  styleUrl: './mobile-search.scss',
})
export class MobileSearchComponent implements OnChanges {
  @Input() open = false;
  @Output() readonly closed = new EventEmitter<void>();

  @ViewChild('searchInput') private readonly inputRef?: ElementRef<HTMLInputElement>;
  @ViewChild('root', { static: true }) private readonly rootRef!: ElementRef<HTMLElement>;
  @ViewChild(SearchSuggestionsComponent) private readonly suggestionsRef?: SearchSuggestionsComponent;

  private readonly router = inject(Router);
  private readonly searchService = inject(SearchService);

  protected readonly query = signal('');
  protected readonly activeIndex = signal(-1);
  protected readonly rows = signal<SuggestionRow[]>([]);

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        if (this.open) {
          this.closed.emit();
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open) {
      this.query.set('');
      this.activeIndex.set(-1);
      this.rows.set([]);
      queueMicrotask(() => this.inputRef?.nativeElement.focus());
    }
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (this.open && !this.rootRef.nativeElement.contains(event.target as Node)) {
      this.closed.emit();
    }
  }

  @HostListener('window:resize')
  protected onResize(): void {
    if (this.open && window.innerWidth >= DESKTOP_BREAKPOINT) {
      this.closed.emit();
    }
  }

  protected onInput(value: string): void {
    this.query.set(value);
    this.activeIndex.set(-1);
  }

  protected onClear(): void {
    if (this.query()) {
      this.query.set('');
      this.activeIndex.set(-1);
      this.inputRef?.nativeElement.focus();
    } else {
      this.closed.emit();
    }
  }

  protected submit(): void {
    const text = this.query().trim();
    if (text.length < 2) return;
    this.searchService.addToHistory(text);
    this.router.navigate(['/proizvodi'], { queryParams: { q: text } });
  }

  protected onRowsChange(rows: SuggestionRow[]): void {
    this.rows.set(rows);
    if (this.activeIndex() >= rows.length) {
      this.activeIndex.set(-1);
    }
  }

  protected onInputKeydown(event: KeyboardEvent): void {
    const count = this.rows().length;
    switch (event.key) {
      case 'ArrowDown':
        if (count > 0) {
          event.preventDefault();
          this.activeIndex.set((this.activeIndex() + 1) % count);
        }
        break;
      case 'ArrowUp':
        if (count > 0) {
          event.preventDefault();
          this.activeIndex.set((this.activeIndex() - 1 + count) % count);
        }
        break;
      case 'Enter': {
        event.preventDefault();
        const idx = this.activeIndex();
        if (idx >= 0 && idx < count) {
          this.suggestionsRef?.activateRow(idx);
        } else {
          this.submit();
        }
        break;
      }
      case 'Escape':
        event.preventDefault();
        this.closed.emit();
        break;
    }
  }

  protected get activeOptionId(): string | null {
    return this.activeIndex() >= 0 ? `mobile-search-option-${this.activeIndex()}` : null;
  }

  protected get liveMessage(): string {
    const q = this.query().trim();
    if (!q) return '';
    const n = this.rows().length;
    return n > 0 ? `${n} rezultata` : 'Nema rezultata';
  }
}
