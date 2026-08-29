import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
@Component({
  selector: "app-base-empty-state",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section>
    <span aria-hidden="true">{{ icon }}</span>
    <h3>{{ title }}</h3>
    @if (description) {
      <p>{{ description }}</p>
    }
    <ng-content />
  </section>`,
  styles: [
    `
      :host {
        display: block;
      }
      section {
        display: grid;
        place-items: center;
        gap: 0.5rem;
        padding: 2rem 1rem;
        text-align: center;
      }
      span {
        font-size: 2rem;
      }
      h3,
      p {
        margin: 0;
      }
      p {
        color: var(--muted);
        max-width: 32rem;
      }
    `,
  ],
})
export class BaseEmptyStateComponent {
  @Input() icon = "○";
  @Input() title = "موردی وجود ندارد";
  @Input() description = "";
}
