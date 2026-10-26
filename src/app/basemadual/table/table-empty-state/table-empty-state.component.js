import { ChangeDetectionStrategy, } from "@angular/core";
@Component({
  selector: "app-base-table-empty-state",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div role="status">
    <strong>{{ title }}</strong>
    @if (description) {
      <p>{{ description }}</p>
    }
    <ng-content />
  </div>`,
  styles: [
    `
      :host {
        display: block;
      }
      div {
        padding: 2rem 1rem;
        text-align: center;
      }
      p {
        margin: 0.25rem 0;
        color: var(--muted);
      }
    `,
  ],
})
export class BaseTableEmptyStateComponent {constructor() { BaseTableEmptyStateComponent.prototype.__init.call(this);BaseTableEmptyStateComponent.prototype.__init2.call(this); }
  Input() __init() {this.title = "موردی برای نمایش وجود ندارد"}
  Input() __init2() {this.description = ""}
}
