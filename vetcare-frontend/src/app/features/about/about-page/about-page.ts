import { Component } from '@angular/core';

const OFFERINGS = ['Pse', 'Mačke', 'Goveda', 'Ovce i koze', 'Konje', 'Perad', 'Pčelarstvo'];

const WHY_CHOOSE = [
  'Stručni savjeti doktora veterinarske medicine',
  'Pažljivo odabrani kvalitetni proizvodi',
  'Širok asortiman za kućne ljubimce i farmske životinje',
  'Brza i pouzdana isporuka širom Bosne i Hercegovine',
  'Ljubazna i profesionalna podrška kupcima',
  'Posvećenost zdravlju i dobrobiti životinja',
];

@Component({
  selector: 'app-about-page',
  templateUrl: './about-page.html',
  styleUrl: './about-page.scss',
})
export class AboutPageComponent {
  protected readonly offerings = OFFERINGS;
  protected readonly whyChoose = WHY_CHOOSE;
}
