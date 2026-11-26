import { Component, ViewChild, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouteConfigLoadStart, RouteConfigLoadEnd } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header';
import { CategoryNavComponent } from './layout/category-nav/category-nav';
import { MobileDrawerComponent } from './layout/mobile-drawer/mobile-drawer';
import { FooterComponent } from './layout/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, CategoryNavComponent, MobileDrawerComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  @ViewChild(HeaderComponent) private headerRef!: HeaderComponent;

  private readonly router = inject(Router);

  protected readonly mobileMenuOpen = signal(false);
  protected readonly lazyRouteLoading = signal(false);

  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof RouteConfigLoadStart) {
        this.lazyRouteLoading.set(true);
      } else if (event instanceof RouteConfigLoadEnd) {
        this.lazyRouteLoading.set(false);
      }
    });
  }

  protected onDrawerClosed(): void {
    this.mobileMenuOpen.set(false);
    this.headerRef.focusBurger();
  }
}
