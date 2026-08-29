import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
@Component({
  selector: "app-base-info-card",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<article>
    @if (title) {
      <h3>{{ title }}</h3>
    }
    @if (description) {
      <p>{{ description }}</p>
    }
    <ng-content />
  </article>`,
  styles: [
    `
      :host {
        display: block;
      }
      article {
        padding: 1rem;
        border-radius: 1rem;
        background: var(--surface-soft);
        border: 1px solid var(--line);
      }
      h3 {
        margin: 0 0 0.5rem;
      }
      p {
        margin: 0;
        color: var(--muted);
      }
    `,
  ],
})
export class BaseInfoCardComponent {
  @Input() title = "";
  @Input() description = "";
}
