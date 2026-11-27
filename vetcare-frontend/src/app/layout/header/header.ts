import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { CartService } from '../../core/services/cart.service';
import { MobileSearchComponent } from '../../shared/components/mobile-search/mobile-search';
import { SearchSuggestionsComponent } from '../../shared/components/search-suggestions/search-suggestions';
import { SuggestionRow } from '../../shared/components/search-suggestions/suggestion-row';
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_HREF } from '../../shared/data/contact';

const DESKTOP_BREAKPOINT = 920;

@Component({
  selector: 'app-header',
  imports: [RouterLink, MobileSearchComponent, SearchSuggestionsComponent],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  @Input() menuOpen = false;
  @Input() searchOpen = false;
  @Output() menuToggle = new EventEmitter<void>();
  @Output() searchToggle = new EventEmitter<void>();
  @Output() searchClosed = new EventEmitter<void>();

  @ViewChild('burgerBtn') private burgerBtnRef!: ElementRef<HTMLButtonElement>;
  @ViewChild('magnifierBtn') private magnifierBtnRef!: ElementRef<HTMLButtonElement>;
  @ViewChild('searchwrapEl') private searchwrapRef!: ElementRef<HTMLElement>;
  @ViewChild('desktopSuggestions') private desktopSuggestionsRef?: SearchSuggestionsComponent;

  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);

  private scrollPending = false;

  protected readonly cartCount = this.cartService.count;
  protected readonly phoneDisplay = CONTACT_PHONE_DISPLAY;
  protected readonly phoneHref = CONTACT_PHONE_HREF;

  protected readonly desktopInteracted = signal(false);
  protected readonly desktopPanelOpen = signal(false);
  protected readonly desktopQuery = signal('');
  protected readonly desktopActiveIndex = signal(-1);
  protected readonly desktopRows = signal<SuggestionRow[]>([]);

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        if (this.desktopPanelOpen()) {
          this.desktopPanelOpen.set(false);
        }
      });
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClickDesktop(event: MouseEvent): void {
    if (
      this.desktopPanelOpen() &&
      this.searchwrapRef &&
      !this.searchwrapRef.nativeElement.contains(event.target as Node)
    ) {
      this.desktopPanelOpen.set(false);
    }
  }

  @HostListener('window:resize')
  protected onResizeDesktop(): void {
    if (this.desktopPanelOpen() && window.innerWidth < DESKTOP_BREAKPOINT) {
      this.desktopPanelOpen.set(false);
    }
  }

  protected onSearchSubmit(input: HTMLInputElement): void {
    const q = input.value.trim();
    if (!q) return;
    this.router.navigate(['/proizvodi'], { queryParams: { q } });
  }

  protected onDesktopFocus(): void {
    this.desktopInteracted.set(true);
    this.desktopPanelOpen.set(true);
  }

  protected onDesktopInput(value: string): void {
    this.desktopInteracted.set(true);
    this.desktopQuery.set(value);
    this.desktopActiveIndex.set(-1);
    this.desktopPanelOpen.set(true);
  }

  protected onDesktopRowsChange(rows: SuggestionRow[]): void {
    this.desktopRows.set(rows);
    if (this.desktopActiveIndex() >= rows.length) {
      this.desktopActiveIndex.set(-1);
    }
  }

  protected onDesktopKeydown(event: KeyboardEvent, input: HTMLInputElement): void {
    const count = this.desktopRows().length;
    switch (event.key) {
      case 'ArrowDown':
        if (count > 0) {
          event.preventDefault();
          this.desktopActiveIndex.set((this.desktopActiveIndex() + 1) % count);
        }
        break;
      case 'ArrowUp':
        if (count > 0) {
          event.preventDefault();
          this.desktopActiveIndex.set((this.desktopActiveIndex() - 1 + count) % count);
        }
        break;
      case 'Enter': {
        event.preventDefault();
        const idx = this.desktopActiveIndex();
        if (idx >= 0 && idx < count) {
          this.desktopSuggestionsRef?.activateRow(idx);
        } else {
          this.onSearchSubmit(input);
        }
        break;
      }
      case 'Escape':
        event.preventDefault();
        this.desktopPanelOpen.set(false);
        break;
    }
  }

  protected get desktopActiveOptionId(): string | null {
    return this.desktopActiveIndex() >= 0 ? `search-option-${this.desktopActiveIndex()}` : null;
  }

  protected get desktopLiveMessage(): string {
    const q = this.desktopQuery().trim();
    if (!q) return '';
    const n = this.desktopRows().length;
    return n > 0 ? `${n} rezultata` : 'Nema rezultata';
  }

  protected onMagnifierClick(): void {
    if (this.searchOpen || this.scrollPending) {
      this.searchToggle.emit();
      return;
    }
    if (window.scrollY > 0) {
      this.scrollPending = true;
      const finish = () => {
        window.removeEventListener('scrollend', finish);
        this.scrollPending = false;
        this.searchToggle.emit();
      };
      if ('onscrollend' in window) {
        window.addEventListener('scrollend', finish, { once: true });
      } else {
        setTimeout(finish, 400);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      this.searchToggle.emit();
    }
  }

  protected onSearchClosedInternally(): void {
    this.searchClosed.emit();
    this.magnifierBtnRef.nativeElement.focus();
  }

  focusBurger(): void {
    this.burgerBtnRef.nativeElement.focus();
  }
}
