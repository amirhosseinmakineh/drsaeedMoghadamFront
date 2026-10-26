import { ChangeDetectionStrategy, } from "@angular/core";
@Component({
  selector: "app-base-skeleton",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div
    role="status"
    [attr.aria-label]="label"
    [style.height]="height"
  ></div>`,
  styles: [
    `
      :host {
        display: block;
      }
      div {
        width: 100%;
        min-height: 0.75rem;
        border-radius: 0.75rem;
        background: linear-gradient(
          90deg,
          var(--surface-soft),
          var(--line),
          var(--surface-soft)
        );
        background-size: 200% 100%;
        animation: pulse 1.5s infinite;
      }
      @keyframes pulse {
        to {
          background-position: -200% 0;
        }
      }
    `,
  ],
})
export class BaseSkeletonComponent {constructor() { BaseSkeletonComponent.prototype.__init.call(this);BaseSkeletonComponent.prototype.__init2.call(this); }
  Input() __init() {this.label = "در حال بارگذاری"}
  Input() __init2() {this.height = "4rem"}
}
