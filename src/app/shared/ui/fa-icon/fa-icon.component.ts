import { Component, Input } from '@angular/core';

const iconClasses: Record<string, string> = {
  tooth: 'fa-solid fa-tooth',
  home: 'fa-solid fa-house-chimney',
  doctor: 'fa-solid fa-user-doctor',
  user: 'fa-solid fa-user',
  mobile: 'fa-solid fa-mobile-screen-button',
  calendar: 'fa-solid fa-calendar-check',
  search: 'fa-solid fa-magnifying-glass',
  plus: 'fa-solid fa-plus',
  edit: 'fa-solid fa-pen-to-square',
  trash: 'fa-solid fa-trash-can',
  table: 'fa-solid fa-table-list',
  users: 'fa-solid fa-users',
  clipboard: 'fa-solid fa-clipboard-list',
  award: 'fa-solid fa-award',
  list: 'fa-solid fa-list-check',
  shield: 'fa-solid fa-shield-heart',
  star: 'fa-solid fa-star',
  heart: 'fa-solid fa-heart-pulse',
  leaf: 'fa-solid fa-leaf',
  phone: 'fa-solid fa-phone',
  location: 'fa-solid fa-location-dot',
  clock: 'fa-solid fa-clock',
  check: 'fa-solid fa-circle-check',
  brush: 'fa-solid fa-brush',
  align: 'fa-solid fa-teeth-open',
  sun: 'fa-solid fa-sun',
  moon: 'fa-solid fa-moon',
  menu: 'fa-solid fa-bars',
  close: 'fa-solid fa-xmark',
  dashboard: 'fa-solid fa-gauge-high',
  logout: 'fa-solid fa-right-from-bracket',
  arrowLeft: 'fa-solid fa-arrow-left',
  arrowRight: 'fa-solid fa-arrow-right',
  chevronLeft: 'fa-solid fa-chevron-left',
  chevronRight: 'fa-solid fa-chevron-right',
  chevronDown: 'fa-solid fa-chevron-down',
  quote: 'fa-solid fa-quote-right',
  sparkle: 'fa-solid fa-wand-magic-sparkles',
  gallery: 'fa-solid fa-images',
  smile: 'fa-solid fa-face-smile-beam'
};

@Component({
  selector: 'app-fa-icon',
  standalone: true,
  template: `<i class="fa-icon" [class]="iconClass" aria-hidden="true"></i>`,
  styles: [`.fa-icon{display:inline-block;width:1em;text-align:center;line-height:1}`]
})
export class FaIconComponent {
  @Input() name = 'star';

  get iconClass(): string {
    return `fa-icon ${iconClasses[this.name] ?? iconClasses['star']}`;
  }
}
