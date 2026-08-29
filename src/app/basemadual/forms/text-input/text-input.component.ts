import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from "@angular/core";
@Component({
  selector: "app-base-text-input",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<label [for]="inputId"
      >{{ label }}
      @if (required) {
        <span> *</span>
      }</label
    ><input
      [id]="inputId"
      [type]="type"
      [inputMode]="inputMode"
      [value]="value"
      [placeholder]="placeholder"
      [disabled]="disabled"
      [required]="required"
      [attr.aria-invalid]="error ? true : null"
      (input)="onInput($event)"
    />
    @if (error) {
      <small role="alert">{{ error }}</small>
    }`,
  styles: [
    `
      :host {
        display: grid;
        gap: 0.25rem;
      }
      label {
        color: var(--muted);
        font-size: 0.875rem;
      }
      input {
        min-height: 44px;
      }
      small {
        color: var(--danger);
      }
    `,
  ],
})
export class BaseTextInputComponent {
  @Input({ required: true }) inputId = "";
  @Input() label = "";
  @Input() value = "";
  @Input() placeholder = "";
  @Input() type: "text" | "email" | "tel" | "url" | "password" = "text";
  @Input() inputMode: "text" | "email" | "tel" | "url" | "search" = "text";
  @Input() disabled = false;
  @Input() required = false;
  @Input() error = "";
  @Output() valueChange = new EventEmitter<string>();
  onInput(event: Event): void {
    this.valueChange.emit((event.target as HTMLInputElement).value);
  }
}
