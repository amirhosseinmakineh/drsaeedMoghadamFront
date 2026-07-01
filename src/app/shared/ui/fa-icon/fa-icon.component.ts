import { Component, Input } from "@angular/core";

const iconPaths: Record<string, string> = {
  tooth:
    "M12 2c-2.8 0-4 2.4-4 5.1 0 1.2.4 2.8.9 4.6.6 2.3 1 4.7 1.2 6.8.2 1.8 2.4 1.8 2.6 0 .2-.7 1.2-2.3 1.2-2.6 0-.3 0-.8-.1-1.3-.2-.7-.2-1.6-1.1-1.6-1.1 0-.9.5-1.4 1.1-1.6.5-.1 1-.2 1.3-.2 1.8 0 2.6.9 2.6 1.2 0 .2 1.4 0 2.4-1.8 2.7-5.1.2-2.1.6-4.5 1.2-6.8.5-1.8.9-3.4.9-4.6C20 4.4 18.8 2 16 2c-1.4 0-2.3.6-3 1.1C12.3 2.6 11.4 2 10 2h2z",
  home: "M3 10.5 12 3l9 7.5v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-10z",
  doctor:
    "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 9c.7-4 3.4-6 7-6s6.3 2 7 6H5zm7-5v4m-2-2h4",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 9c.7-4 3.4-6 7-6s6.3 2 7 6H5z",
  mobile:
    "M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm2 3h4M11 19h2",
  calendar:
    "M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 5h14M8 2v4m8-4v4m-8 8 2 2 5-5",
  search:
    "M10.5 18a7.5 7.5 0 1 1 5.3-2.2L21 21l-1.8 1.8-5.2-5.2A7.4 7.4 0 0 1 10.5 18z",
  plus: "M12 5v14M5 12h14",
  edit: "M4 17.5V21h3.5L18.8 9.7l-3.5-3.5L4 17.5zM17 4.5 19.5 7",
  trash: "M5 7h14m-2 0-.8 13H7.8L7 7m3 0V4h4v3m-2 4v6m-3-6 .4 6m5.6-6-.4 6",
  table: "M4 5h16v14H4V5zm0 5h16M9 5v14",
  download: "M12 3v12m0 0 4-4m-4 4-4-4M5 21h14",
  users:
    "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm6 10H3c.5-4 2.8-6 6-6s5.5 2 6 6zm2-9a3 3 0 1 0 0-6m4 15c-.3-2.6-1.6-4.3-3.8-5",
  clipboard: "M8 4h8l1 2h2v16H5V6h2l1-2zm1 6h6m-6 4h6m-6 4h4",
  award: "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zm-3 0-1 7 4-2 4 2-1-7",
  list: "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01",
  shield: "M12 2 20 5v6c0 5-3.4 8.7-8 11-4.6-2.3-8-6-8-11V5l8-3zm-3 10 2 2 4-5",
  star: "m12 2.5 2.9 6 6.6 1-4.8 4.7 1.1 6.6L12 17.7l-5.8 3.1 1.1-6.6-4.8-4.7 6.6-1L12 2.5z",
  heart:
    "M12 21S4 16.5 4 9.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 8 3.5C20 16.5 12 21 12 21z",
  leaf: "M20 4c-8 0-14 5-14 12 0 2.2 1.2 4 3.2 4C16 20 20 12 20 4zm-9 10c-2 1-3.5 2.5-5 5",
  phone:
    "M6.5 3 10 6.5 8 9c1.2 2.3 2.7 3.8 5 5l2.5-2 3.5 3.5-2 4c-.3.6-1 .9-1.7.7C8.5 18.2 4.8 14.5 2.8 7.7 2.6 7 2.9 6.3 3.5 6l3-3z",
  location:
    "M12 22s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0-16v6l4 2",
  check: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm-4-10 3 3 5-6",
  brush:
    "M4 20c2 0 3-.8 3-3l9-9-3-3-9 9c-2.2 0-3 1-3 3 0 1.7 1.3 3 3 3zm11-17 2-2 3 3-2 2",
  align: "M5 6c3-2 6-2 14 0M4 11h16M5 16c3 2 6 2 14 0",
  sun: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0-15v3m0 14v3M4.2 4.2l2.1 2.1m11.4 11.4 2.1 2.1M2 12h3m14 0h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1",
  moon: "M21 15.5A8.5 8.5 0 0 1 8.5 3 7 7 0 1 0 21 15.5z",
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "M6 6l12 12M18 6 6 18",
  dashboard: "M4 13a8 8 0 1 1 16 0v6H4v-6zm8 1 4-5M7 16h10",
  logout: "M10 4H5v16h5m3-4 4-4-4-4m4 4H9",
  arrowLeft: "M19 12H5m6-6-6 6 6 6",
  arrowRight: "M5 12h14m-6-6 6 6-6 6",
  chevronLeft: "m15 6-6 6 6 6",
  chevronRight: "m9 6 6 6-6 6",
  chevronDown: "m6 9 6 6 6-6",
  quote: "M8 6H4v7h3c0 2-1 3.5-3 4.5M18 6h-4v7h3c0 2-1 3.5-3 4.5",
  sparkle:
    "M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2zm6 13 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z",
  gallery: "M4 5h16v14H4V5zm3 10 3-3 2 2 3-4 3 5",
  smile:
    "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM8 9h.01M16 9h.01M8 14c1 2 2.4 3 4 3s3-1 4-3",
};

@Component({
  selector: "app-fa-icon",
  standalone: true,
  template: `
    <svg class="fa-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path [attr.d]="iconPath"></path>
    </svg>
  `,
  styles: [
    `
      .fa-icon {
        display: inline-block;
        width: 1em;
        height: 1em;
        fill: none;
        stroke: currentColor;
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke-width: 2;
        vertical-align: -0.12em;
      }
    `,
  ],
})
export class FaIconComponent {
  @Input() name = "star";

  get iconPath(): string {
    return iconPaths[this.name] ?? iconPaths["star"];
  }
}
