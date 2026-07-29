import { Component } from '@angular/core';
import { AnimalPickerGridComponent } from '../animal-picker-grid/animal-picker-grid';
import { QuickSearchRowComponent } from '../quick-search-row/quick-search-row';

@Component({
  selector: 'app-home-hero',
  imports: [AnimalPickerGridComponent, QuickSearchRowComponent],
  templateUrl: './home-hero.html',
  styleUrl: './home-hero.scss',
})
export class HomeHeroComponent {}
