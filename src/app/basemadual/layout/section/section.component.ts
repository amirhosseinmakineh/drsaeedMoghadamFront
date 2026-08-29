import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
@Component({
  selector: "app-base-section",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section>
    <header>
      <div>
        <h2>{{ title }}</h2>
        @if (description) {
          <p>{{ description }}</p>
        }
      </div>
      <ng-content select="[baseSectionAction]" />
    </header>
    <div class="content"><ng-content /></div>
  </section>`,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }
      section {
        display: grid;
        gap: 1rem;
      }
      header {
        display: flex;
        align-items: start;
        justify-content: space-between;
        gap: 0.75rem;
        flex-wrap: wrap;
      }
      h2,
      p {
        margin: 0;
      }
      p {
        color: var(--muted);
        font-size: 0.875rem;
      }
      .content {
        min-width: 0;
      }
    `,
  ],
})
export class BaseSectionComponent {
  @Input({ required: true }) title = "";
  @Input() description = "";
}
