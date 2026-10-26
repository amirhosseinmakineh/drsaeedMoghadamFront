import {
  ChangeDetectionStrategy,

  EventEmitter,


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
export class BaseErrorStateComponent {constructor() { BaseErrorStateComponent.prototype.__init.call(this);BaseErrorStateComponent.prototype.__init2.call(this);BaseErrorStateComponent.prototype.__init3.call(this);BaseErrorStateComponent.prototype.__init4.call(this); }
  Input() __init() {this.title = "خطایی رخ داد"}
  Input() __init2() {this.description = "لطفاً دوباره تلاش کنید."}
  Input() __init3() {this.retryLabel = "تلاش دوباره"}
  Output() __init4() {this.retry = new EventEmitter()}
}
