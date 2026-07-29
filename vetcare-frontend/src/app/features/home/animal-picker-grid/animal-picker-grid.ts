import { Component, Input } from '@angular/core';
import { AnimalPickerCardComponent } from '../animal-picker-card/animal-picker-card';
import { Animal, ANIMALS } from '../data/animals';

@Component({
  selector: 'app-animal-picker-grid',
  imports: [AnimalPickerCardComponent],
  templateUrl: './animal-picker-grid.html',
  styleUrl: './animal-picker-grid.scss',
})
export class AnimalPickerGridComponent {
  @Input() animals: Animal[] = ANIMALS;
}
