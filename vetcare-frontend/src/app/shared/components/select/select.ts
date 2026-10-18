import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
  inject,
  signal,
} from '@angular/core';

export interface SelectOption {
  value: string;
  label: string;
}

let nextSelectId = 0;

@Component({
  selector: 'app-select',
  templateUrl: './select.html',
  styleUrl: './select.scss',
})
export class SelectComponent {
  @Input({ required: true }) options: SelectOption[] = [];
  @Input({ required: true }) value!: string;
  @Input() labelledBy?: string;

  @Output() readonly valueChange = new EventEmitter<string>();

  @ViewChild('trigger') private readonly triggerRef?: ElementRef<HTMLButtonElement>;
  @ViewChild('listbox') private readonly listboxRef?: ElementRef<HTMLUListElement>;

  private readonly elementRef = inject(ElementRef<HTMLElement>);

  protected readonly uid = `app-select-${nextSelectId++}`;
  protected readonly open = signal(false);
  protected readonly activeIndex = signal(-1);

  protected get selectedLabel(): string {
    return this.options.find((o) => o.value === this.value)?.label ?? '';
  }

  protected get triggerId(): string {
    return `${this.uid}-trigger`;
  }

  protected get listboxId(): string {
    return `${this.uid}-listbox`;
  }

  protected optionId(index: number): string {
    return `${this.uid}-option-${index}`;
  }

  protected get activeOptionId(): string | null {
    return this.activeIndex() >= 0 ? this.optionId(this.activeIndex()) : null;
  }

  protected get triggerLabelledBy(): string | null {
    return this.labelledBy ? `${this.labelledBy} ${this.triggerId}` : null;
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.elementRef.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  protected toggleOpen(): void {
    if (this.open()) {
      this.close(false);
    } else {
      this.openPanel();
    }
  }

  protected openPanel(): void {
    const selectedIndex = this.options.findIndex((o) => o.value === this.value);
    this.activeIndex.set(selectedIndex >= 0 ? selectedIndex : 0);
    this.open.set(true);
    setTimeout(() => this.listboxRef?.nativeElement.focus());
  }

  protected close(refocusTrigger: boolean): void {
    this.open.set(false);
    if (refocusTrigger) {
      this.triggerRef?.nativeElement.focus();
    }
  }

  protected selectOption(opt: SelectOption): void {
    if (opt.value !== this.value) {
      this.valueChange.emit(opt.value);
    }
    this.close(true);
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        this.openPanel();
        break;
    }
  }

  protected onPanelKeydown(event: KeyboardEvent): void {
    const count = this.options.length;
    if (count === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex.set((this.activeIndex() + 1 + count) % count);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.set((this.activeIndex() - 1 + count) % count);
        break;
      case 'Home':
        event.preventDefault();
        this.activeIndex.set(0);
        break;
      case 'End':
        event.preventDefault();
        this.activeIndex.set(count - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.activeIndex() >= 0) {
          this.selectOption(this.options[this.activeIndex()]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.close(true);
        break;
      case 'Tab':
        this.close(false);
        break;
    }
  }
}
