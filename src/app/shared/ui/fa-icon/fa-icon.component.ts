import { Component, Input } from '@angular/core';

const iconClasses: Record<string, string> = {
  align: 'fa-solid fa-align-center',
  arrowLeft: 'fa-solid fa-arrow-left',
  arrowRight: 'fa-solid fa-arrow-right',
  brush: 'fa-solid fa-brush',
  calendar: 'fa-regular fa-calendar-check',
  check: 'fa-solid fa-check',
  chevronDown: 'fa-solid fa-chevron-down',
  chevronLeft: 'fa-solid fa-chevron-left',
  chevronRight: 'fa-solid fa-chevron-right',
  clock: 'fa-regular fa-clock',
  close: 'fa-solid fa-xmark',
  doctor: 'fa-solid fa-user-doctor',
  heart: 'fa-regular fa-heart',
  home: 'fa-solid fa-house-chimney',
  leaf: 'fa-solid fa-leaf',
  location: 'fa-solid fa-location-dot',
  menu: 'fa-solid fa-bars',
  mobile: 'fa-solid fa-mobile-screen-button',
  moon: 'fa-regular fa-moon',
  phone: 'fa-solid fa-phone',
  quote: 'fa-solid fa-quote-right',
  shield: 'fa-solid fa-shield-heart',
  sparkle: 'fa-solid fa-wand-magic-sparkles',
  star: 'fa-solid fa-star',
  sun: 'fa-regular fa-sun',
  tooth: 'fa-solid fa-tooth',
  user: 'fa-regular fa-user'
};

@Component({
  selector: 'app-fa-icon',
  standalone: true,
  template: `<i [attr.class]="'app-fa-icon ' + iconClass" aria-hidden="true"></i>`,
  styles: [`.app-fa-icon{display:inline-block;font-size:1em;line-height:1}`]
})
export class FaIconComponent {
  @Input() name = 'star';

  get iconClass(): string {
    return iconClasses[this.name] ?? iconClasses['star'];
  }
}
