import { ChangeDetectionStrategy, } from "@angular/core";
@Component({
  selector: "app-base-form-error",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@if (message) {
    <small role="alert">{{ message }}</small>
  }`,
  styles: [
    `
      small {
        display: block;
        color: var(--danger);
        font-size: 0.75rem;
      }
    `,
  ],
})
export class BaseFormErrorComponent {constructor() { BaseFormErrorComponent.prototype.__init.call(this); }
  Input() __init() {this.message = ""}
}
