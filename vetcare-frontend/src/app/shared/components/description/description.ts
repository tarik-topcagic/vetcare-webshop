import { Component, Input } from '@angular/core';
import { DescriptionBlock, parseDescription } from './description-parser';

@Component({
  selector: 'app-description',
  templateUrl: './description.html',
  styleUrl: './description.scss',
})
export class DescriptionComponent {
  protected blocks: DescriptionBlock[] = [];

  @Input({ required: true })
  set text(value: string) {
    this.blocks = parseDescription(value ?? '');
  }
}
