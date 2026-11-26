import { Component, DestroyRef, ElementRef, Input, OnChanges, ViewChild, inject, signal } from '@angular/core';
import { AnimalPickerCardComponent } from '../animal-picker-card/animal-picker-card';
import { Animal, ANIMALS } from '../data/animals';

const AUTOPLAY_MS = 3000;
const TRANSITION_MS = 500;
const GAP_PX = 12;
const SWIPE_DISTANCE_RATIO = 0.2;
const SWIPE_VELOCITY_PX_MS = 0.5;
const TAP_TOLERANCE_PX = 8;

@Component({
  selector: 'app-animal-carousel',
  imports: [AnimalPickerCardComponent],
  templateUrl: './animal-carousel.html',
  styleUrl: './animal-carousel.scss',
})
export class AnimalCarouselComponent implements OnChanges {
  @Input() entranceDone = false;

  @ViewChild('viewport', { static: true }) private viewportRef!: ElementRef<HTMLElement>;

  protected readonly animals: Animal[] = ANIMALS;
  protected readonly animalsCount = ANIMALS.length;
  protected readonly renderAnimals: Animal[] = [ANIMALS[ANIMALS.length - 1], ...ANIMALS, ANIMALS[0]];

  protected readonly active = signal(0);
  protected readonly renderIndex = signal(1);
  protected readonly dragPx = signal(0);
  protected readonly transitionEnabled = signal(true);
  protected readonly autoplaying = signal(false);

  private readonly reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  protected readonly reducedMotion = signal(this.reducedMotionQuery.matches);

  private hoverPaused = false;
  private pointerPaused = false;
  private timer: ReturnType<typeof setInterval> | null = null;
  private wrapSettleTimeoutId: ReturnType<typeof setTimeout> | null = null;

  private isPointerDown = false;
  private pointerStartX = 0;
  private lastPointerX = 0;
  private lastPointerTime = 0;
  private velocityPxMs = 0;
  private suppressNextClick = false;

  constructor() {
    const onChange = (event: MediaQueryListEvent) => {
      this.reducedMotion.set(event.matches);
      this.syncAutoplay();
    };
    this.reducedMotionQuery.addEventListener('change', onChange);
    inject(DestroyRef).onDestroy(() => {
      this.reducedMotionQuery.removeEventListener('change', onChange);
      this.stopAutoplay();
      if (this.wrapSettleTimeoutId) {
        clearTimeout(this.wrapSettleTimeoutId);
      }
    });

    this.syncAutoplay();
  }

  ngOnChanges(): void {
    this.syncAutoplay();
  }

  protected trackTransform(): string {
    const offset = -(this.renderIndex() * this.stepPx()) + this.dragPx();
    return `translate3d(${offset}px, 0, 0)`;
  }

  protected trackTransition(): string {
    if (this.reducedMotion() || !this.transitionEnabled()) {
      return 'none';
    }
    return `transform ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`;
  }

  protected isInteractive(renderIdx: number): boolean {
    return renderIdx === this.active() + 1;
  }

  protected ariaLabelFor(renderIdx: number): string {
    const animal = this.renderAnimals[renderIdx];
    const logicalPos = ((((renderIdx - 1) % this.animalsCount) + this.animalsCount) % this.animalsCount) + 1;
    return `${logicalPos} od ${this.animalsCount}: ${animal.name}`;
  }

  protected goTo(index: number): void {
    this.active.set(index);
    this.renderIndex.set(index + 1);
    this.dragPx.set(0);
    this.transitionEnabled.set(true);
    this.stopAutoplay();
    this.syncAutoplay();
  }

  protected step(direction: 1 | -1, resetTimer = true): void {
    const count = this.animalsCount;
    const currentActive = this.active();
    const nextActive = ((currentActive + direction) % count + count) % count;
    const isForwardWrap = direction === 1 && currentActive === count - 1;
    const isBackwardWrap = direction === -1 && currentActive === 0;

    this.active.set(nextActive);
    this.dragPx.set(0);
    this.transitionEnabled.set(true);

    if (isForwardWrap) {
      this.renderIndex.set(count + 1);
      this.scheduleWrapSettle(1);
    } else if (isBackwardWrap) {
      this.renderIndex.set(0);
      this.scheduleWrapSettle(count);
    } else {
      this.renderIndex.set(nextActive + 1);
    }

    if (resetTimer) {
      this.stopAutoplay();
      this.syncAutoplay();
    }
  }

  protected onPointerEnter(): void {
    this.hoverPaused = true;
    this.syncAutoplay();
  }

  protected onPointerLeave(): void {
    this.hoverPaused = false;
    this.syncAutoplay();
  }

  protected onPointerDown(event: PointerEvent): void {
    event.preventDefault();
    this.isPointerDown = true;
    this.pointerPaused = true;
    this.pointerStartX = event.clientX;
    this.lastPointerX = event.clientX;
    this.lastPointerTime = performance.now();
    this.velocityPxMs = 0;
    this.transitionEnabled.set(false);
    this.syncAutoplay();
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this.isPointerDown) {
      return;
    }
    const now = performance.now();
    const dt = now - this.lastPointerTime;
    if (dt > 0) {
      this.velocityPxMs = (event.clientX - this.lastPointerX) / dt;
    }
    this.lastPointerX = event.clientX;
    this.lastPointerTime = now;
    this.dragPx.set(event.clientX - this.pointerStartX);
  }

  protected onPointerUp(): void {
    if (!this.isPointerDown) {
      return;
    }
    this.isPointerDown = false;
    this.pointerPaused = false;
    this.transitionEnabled.set(true);

    const totalDrag = this.dragPx();
    if (Math.abs(totalDrag) > TAP_TOLERANCE_PX) {
      this.suppressNextClick = true;
    }

    const cardWidth = this.viewportRef.nativeElement.clientWidth;
    const distanceRatio = cardWidth > 0 ? Math.abs(totalDrag) / cardWidth : 0;
    const fastSwipe = Math.abs(this.velocityPxMs) > SWIPE_VELOCITY_PX_MS;

    if (totalDrag !== 0 && (distanceRatio > SWIPE_DISTANCE_RATIO || fastSwipe)) {
      this.step(totalDrag < 0 ? 1 : -1);
    } else {
      this.dragPx.set(0);
      this.syncAutoplay();
    }
  }

  protected onSlideClick(event: MouseEvent): void {
    if (this.suppressNextClick) {
      event.preventDefault();
      this.suppressNextClick = false;
    }
  }

  private scheduleWrapSettle(settledRenderIndex: number): void {
    if (this.wrapSettleTimeoutId) {
      clearTimeout(this.wrapSettleTimeoutId);
    }
    const delay = this.reducedMotion() ? 0 : TRANSITION_MS;
    this.wrapSettleTimeoutId = setTimeout(() => {
      this.transitionEnabled.set(false);
      this.renderIndex.set(settledRenderIndex);
      requestAnimationFrame(() => this.transitionEnabled.set(true));
    }, delay);
  }

  private stepPx(): number {
    const el = this.viewportRef?.nativeElement;
    return (el ? el.clientWidth : 0) + GAP_PX;
  }

  private syncAutoplay(): void {
    const shouldRun = this.entranceDone && !this.reducedMotion() && !this.hoverPaused && !this.pointerPaused;
    if (!shouldRun) {
      this.stopAutoplay();
      return;
    }
    if (this.timer) {
      return;
    }
    this.timer = setInterval(() => this.step(1, false), AUTOPLAY_MS);
    this.autoplaying.set(true);
  }

  private stopAutoplay(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.autoplaying.set(false);
  }
}
