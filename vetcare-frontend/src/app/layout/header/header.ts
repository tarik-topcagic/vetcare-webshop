import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_HREF } from '../../shared/data/contact';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  @Input() menuOpen = false;
  @Output() menuToggle = new EventEmitter<void>();

  @ViewChild('burgerBtn') private burgerBtnRef!: ElementRef<HTMLButtonElement>;

  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);

  protected readonly cartCount = this.cartService.count;
  protected readonly phoneDisplay = CONTACT_PHONE_DISPLAY;
  protected readonly phoneHref = CONTACT_PHONE_HREF;

  protected onSearchSubmit(input: HTMLInputElement): void {
    const q = input.value.trim();
    if (!q) return;
    this.router.navigate(['/proizvodi'], { queryParams: { q } });
  }

  focusBurger(): void {
    this.burgerBtnRef.nativeElement.focus();
  }
}
