import { ChangeDetectionStrategy, Component } from "@angular/core";
@Component({
  selector: "app-base-content-container",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div><ng-content /></div>`,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }
      div {
        width: min(100%, 80rem);
        margin-inline: auto;
        padding-inline: 0.5rem;
      }
      @media (min-width: 640px) {
        div {
          padding-inline: 1rem;
        }
      }
    `,
  ],
})
export class BaseContentContainerComponent {}
