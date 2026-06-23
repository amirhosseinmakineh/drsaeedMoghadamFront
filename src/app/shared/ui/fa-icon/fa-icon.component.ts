import { Component, Input } from '@angular/core';

const paths: Record<string, string> = {
  tooth: 'M8 2c-2.2 0-4 1.8-4 4 0 1.4.5 2.5 1.2 3.7.5.8.8 1.7.8 2.7 0 3.4 1.2 6.6 2.8 6.6 1.1 0 1.1-2.4 1.9-5 .3-1 .7-1.6 1.3-1.6s1 .6 1.3 1.6c.8 2.6.8 5 1.9 5 1.6 0 2.8-3.2 2.8-6.6 0-1 .3-1.9.8-2.7.7-1.2 1.2-2.3 1.2-3.7 0-2.2-1.8-4-4-4-1 0-1.9.4-2.7 1C9.9 2.4 9 2 8 2Z',
  home: 'M3 10.8 12 3l9 7.8V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.8Z',
  doctor: 'M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm7 10a7 7 0 0 0-14 0Zm-7-7v4m-2-2h4',
  user: 'M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z',
  mobile: 'M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm3 17h2',
  calendar: 'M7 2v3m10-3v3M4 8h16M5 4h14a1 1 0 0 1 1 1v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a1 1 0 0 1 1-1Zm4 10 2 2 4-4',
  shield: 'M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Zm-3 10 2 2 4-5',
  star: 'm12 2 3 6 7 .9-5 4.8 1.2 6.8L12 17.3 5.8 20.5 7 13.7 2 8.9 9 8l3-6Z',
  heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z',
  leaf: 'M5 21c8 0 14-6 14-14V3h-4C7 3 3 8 3 14c0 2.3.8 4.6 2 7Zm0 0c1.7-4.5 5-8 10-10',
  phone: 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.3 19.3 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z',
  location: 'M12 22s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-15v6l4 2',
  check: 'M20 6 9 17l-5-5',
  brush: 'M14 4 20 10l-8 8H6v-6l8-8Zm-1 15c-2 2-5 2-7 0-1.3 1.7-2.7 2.5-4 2.5 1.6-1.8 2.1-3.5 1.5-5.1 1.9-1.5 4.4-1.4 6.1.3',
  align: 'M4 6h16M7 12h10M10 18h4',
  sun: 'M12 4V2m0 20v-2M4.9 4.9 3.5 3.5m17 17-1.4-1.4M4 12H2m20 0h-2M4.9 19.1l-1.4 1.4m17-17-1.4 1.4M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z',
  moon: 'M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5Z',
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'M18 6 6 18M6 6l12 12',
  arrowLeft: 'M19 12H5m7-7-7 7 7 7',
  arrowRight: 'M5 12h14m-7-7 7 7-7 7',
  chevronLeft: 'm15 18-6-6 6-6',
  chevronRight: 'm9 18 6-6-6-6',
  chevronDown: 'm6 9 6 6 6-6',
  quote: 'M10 7H6a4 4 0 0 0-4 4v6h8v-8H6a2 2 0 0 1 2-2h2Zm12 0h-4a4 4 0 0 0-4 4v6h8v-8h-4a2 2 0 0 1 2-2h2Z',
  sparkle: 'M12 2l1.5 5L18 9l-4.5 2L12 16l-1.5-5L6 9l4.5-2L12 2Zm6 12 .8 2.7L22 18l-3.2 1.3L18 22l-.8-2.7L14 18l3.2-1.3L18 14Z'
};

@Component({
  selector: 'app-fa-icon',
  standalone: true,
  template: `<svg class="fa-svg" viewBox="0 0 24 24" aria-hidden="true"><path [attr.d]="paths[name] || paths['star']" /></svg>`,
  styles: [`.fa-svg{width:1em;height:1em;display:inline-block;vertical-align:-.15em;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}`]
})
export class FaIconComponent { @Input() name = 'star'; paths = paths; }
