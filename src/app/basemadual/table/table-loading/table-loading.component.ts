import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
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
export class BaseTableLoadingComponent {
  @Input() label = "در حال بارگذاری";
  @Input() rows = [1, 2, 3, 4];
}
