import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RevealOnScrollDirective } from '../../../shared/directives/reveal-on-scroll/reveal-on-scroll';

@Component({
  selector: 'app-about-band',
  imports: [RouterLink, RevealOnScrollDirective],
  templateUrl: './about-band.html',
  styleUrl: './about-band.scss',
})
export class AboutBandComponent {}
