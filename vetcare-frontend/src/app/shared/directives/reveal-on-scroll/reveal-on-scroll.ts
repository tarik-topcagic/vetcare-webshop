import { Directive, ElementRef, HostListener, Input, OnChanges, OnDestroy, Renderer2, inject } from '@angular/core';

@Directive({
  selector: '[appRevealOnScroll]',
  standalone: true,
})
export class RevealOnScrollDirective implements OnChanges, OnDestroy {
  @Input('appRevealOnScroll') enabled = true;
  @Input() threshold = 0.15;
  @Input() rootMargin = '0px 0px -40px 0px';

  private readonly el = inject(ElementRef<HTMLElement>).nativeElement;
  private readonly renderer = inject(Renderer2);

  private observer: IntersectionObserver | null = null;
  private revealed = false;

  @HostListener('focusin')
  protected onFocusIn(): void {
    this.reveal();
  }

  ngOnChanges(): void {
    if (this.enabled) {
      this.activate();
    } else {
      this.deactivate();
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  private activate(): void {
    if (this.revealed || this.observer) {
      return;
    }
    this.renderer.addClass(this.el, 'reveal');

    if (typeof IntersectionObserver === 'undefined') {
      this.reveal();
      return;
    }

    try {
      this.observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            this.reveal();
          }
        },
        { threshold: this.threshold, rootMargin: this.rootMargin }
      );
      this.observer.observe(this.el);
    } catch {
      this.reveal();
    }
  }

  private deactivate(): void {
    this.disconnect();
    if (!this.revealed) {
      this.renderer.removeClass(this.el, 'reveal');
    }
  }

  private reveal(): void {
    if (this.revealed) {
      return;
    }
    this.revealed = true;
    this.renderer.addClass(this.el, 'revealed');
    this.disconnect();
  }

  private disconnect(): void {
    this.observer?.disconnect();
    this.observer = null;
  }
}
