import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CATEGORIES, categoryHref } from '../../shared/data/categories';

const DESKTOP_BREAKPOINT = 920;

@Component({
  selector: 'app-mobile-drawer',
  templateUrl: './mobile-drawer.html',
  styleUrl: './mobile-drawer.scss',
})
export class MobileDrawerComponent implements OnChanges {
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();

  @ViewChild('root', { static: true }) private rootRef!: ElementRef<HTMLDivElement>;
  @ViewChild('closeBtn') private closeBtnRef!: ElementRef<HTMLButtonElement>;

  protected readonly categories = CATEGORIES;
  protected readonly categoryHref = categoryHref;
  protected skipTransition = false;

  private previousOverflow = '';
  private previousPaddingRight = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['open']) {
      return;
    }
    if (this.open) {
      this.lockScroll();
      queueMicrotask(() => this.closeBtnRef?.nativeElement.focus());
    } else {
      this.unlockScroll();
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.open) {
      this.closed.emit();
    }
  }

  @HostListener('window:resize')
  protected onResize(): void {
    if (this.open && window.innerWidth >= DESKTOP_BREAKPOINT) {
      this.skipTransition = true;
      this.closed.emit();
      requestAnimationFrame(() => requestAnimationFrame(() => {
        this.skipTransition = false;
      }));
    }
  }

  protected onKeydownTrap(event: KeyboardEvent): void {
    if (event.key !== 'Tab' || !this.open) {
      return;
    }
    const focusables = this.rootRef.nativeElement.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
    if (focusables.length === 0) {
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const activeEl = document.activeElement;

    if (event.shiftKey && activeEl === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && activeEl === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private lockScroll(): void {
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    this.previousOverflow = document.documentElement.style.overflow;
    this.previousPaddingRight = document.documentElement.style.paddingRight;
    document.documentElement.style.overflow = 'hidden';
    if (scrollBarWidth > 0) {
      document.documentElement.style.paddingRight = `${scrollBarWidth}px`;
    }
  }

  private unlockScroll(): void {
    document.documentElement.style.overflow = this.previousOverflow;
    document.documentElement.style.paddingRight = this.previousPaddingRight;
  }
}
