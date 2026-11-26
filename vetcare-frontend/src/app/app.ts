import { Component, ViewChild, signal } from '@angular/core';
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

  protected readonly mobileMenuOpen = signal(false);

  protected onDrawerClosed(): void {
    this.mobileMenuOpen.set(false);
    this.headerRef.focusBurger();
  }
}
