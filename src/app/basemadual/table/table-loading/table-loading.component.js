import { ChangeDetectionStrategy, } from "@angular/core";
@Component({
  selector: "app-base-table-loading",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div role="status" [attr.aria-label]="label">
    @for (row of rows; track row) {
      <span></span>
    }
  </div>`,
  styles: [
    `
      :host {
        display: block;
      }
      div {
        display: grid;
        gap: 0.75rem;
        padding: 1rem;
      }
      span {
        height: 2.75rem;
        border-radius: 0.75rem;
        background: var(--surface-soft);
      }
    `,
  ],
})
export class BaseTableLoadingComponent {constructor() { BaseTableLoadingComponent.prototype.__init.call(this);BaseTableLoadingComponent.prototype.__init2.call(this); }
  Input() __init() {this.label = "در حال بارگذاری"}
  Input() __init2() {this.rows = [1, 2, 3, 4]}
}
