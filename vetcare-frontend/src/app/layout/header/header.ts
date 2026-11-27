import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { MobileSearchComponent } from '../../shared/components/mobile-search/mobile-search';
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_HREF } from '../../shared/data/contact';

@Component({
  selector: 'app-header',
  imports: [RouterLink, MobileSearchComponent],
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

  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);

  private scrollPending = false;

  protected readonly cartCount = this.cartService.count;
  protected readonly phoneDisplay = CONTACT_PHONE_DISPLAY;
  protected readonly phoneHref = CONTACT_PHONE_HREF;

  protected onSearchSubmit(input: HTMLInputElement): void {
    const q = input.value.trim();
    if (!q) return;
    this.router.navigate(['/proizvodi'], { queryParams: { q } });
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
