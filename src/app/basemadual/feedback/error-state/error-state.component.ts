import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from "@angular/core";
@Component({
  selector: "app-base-error-state",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section role="alert">
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
    @if (retryLabel) {
      <button type="button" (click)="retry.emit()">{{ retryLabel }}</button>
    }
  </section>`,
  styles: [
    `
      section {
        display: grid;
        place-items: center;
        gap: 0.75rem;
        padding: 2rem 1rem;
        text-align: center;
      }
      h3,
      p {
        margin: 0;
      }
      p {
        color: var(--muted);
      }
      button {
        min-height: 44px;
        padding-inline: 1rem;
        border: 1px solid var(--line);
        border-radius: 0.75rem;
        background: var(--surface);
        color: var(--brand);
      }
    `,
  ],
})
export class BaseErrorStateComponent {
  @Input() title = "خطایی رخ داد";
  @Input() description = "لطفاً دوباره تلاش کنید.";
  @Input() retryLabel = "تلاش دوباره";
  @Output() retry = new EventEmitter<void>();
}
