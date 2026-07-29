import { Component, Input } from '@angular/core';
import { categoryHref } from '../../../shared/data/categories';

@Component({
  selector: 'app-animal-picker-card',
  templateUrl: './animal-picker-card.html',
  styleUrl: './animal-picker-card.scss',
})
export class AnimalPickerCardComponent {
  @Input({ required: true }) name!: string;
  @Input({ required: true }) slug!: string;
  @Input({ required: true }) image!: string;

  protected get href(): string {
    return categoryHref(this.slug);
  }
}
