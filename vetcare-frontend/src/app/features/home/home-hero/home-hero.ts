import { Component, DestroyRef, HostListener, inject, signal } from '@angular/core';
import { AnimalPickerGridComponent } from '../animal-picker-grid/animal-picker-grid';
import { AnimalCarouselComponent } from '../animal-carousel/animal-carousel';
import { QuickSearchRowComponent } from '../quick-search-row/quick-search-row';

const ENTRANCE_FALLBACK_MS = 1200;

@Component({
  selector: 'app-home-hero',
  imports: [AnimalPickerGridComponent, AnimalCarouselComponent, QuickSearchRowComponent],
  templateUrl: './home-hero.html',
  styleUrl: './home-hero.scss',
})
export class HomeHeroComponent {
  private readonly desktopQuery = window.matchMedia('(min-width: 768px)');
  protected readonly isDesktop = signal(this.desktopQuery.matches);
  protected readonly entranceDone = signal(false);

  private entranceTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    const onChange = (event: MediaQueryListEvent) => this.isDesktop.set(event.matches);
    this.desktopQuery.addEventListener('change', onChange);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      this.entranceDone.set(true);
    } else {
      this.entranceTimeoutId = setTimeout(() => this.entranceDone.set(true), ENTRANCE_FALLBACK_MS);
    }

    inject(DestroyRef).onDestroy(() => {
      this.desktopQuery.removeEventListener('change', onChange);
      if (this.entranceTimeoutId) {
        clearTimeout(this.entranceTimeoutId);
      }
    });
  }

  @HostListener('animationend', ['$event'])
  protected onAnimationEnd(event: AnimationEvent): void {
    if (event.animationName === 'hero-pop-in') {
      if (this.entranceTimeoutId) {
        clearTimeout(this.entranceTimeoutId);
        this.entranceTimeoutId = null;
      }
      this.entranceDone.set(true);
    }
  }
}
