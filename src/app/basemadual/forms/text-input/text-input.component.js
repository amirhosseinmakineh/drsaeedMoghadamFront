import {
  ChangeDetectionStrategy,

  EventEmitter,


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
export class BaseTextInputComponent {constructor() { BaseTextInputComponent.prototype.__init.call(this);BaseTextInputComponent.prototype.__init2.call(this);BaseTextInputComponent.prototype.__init3.call(this);BaseTextInputComponent.prototype.__init4.call(this);BaseTextInputComponent.prototype.__init5.call(this);BaseTextInputComponent.prototype.__init6.call(this);BaseTextInputComponent.prototype.__init7.call(this);BaseTextInputComponent.prototype.__init8.call(this);BaseTextInputComponent.prototype.__init9.call(this);BaseTextInputComponent.prototype.__init10.call(this); }
  Input({ required: true }) __init() {this.inputId = ""}
  Input() __init2() {this.label = ""}
  Input() __init3() {this.value = ""}
  Input() __init4() {this.placeholder = ""}
  Input() __init5() {this.type = "text"}
  Input() __init6() {this.inputMode = "text"}
  Input() __init7() {this.disabled = false}
  Input() __init8() {this.required = false}
  Input() __init9() {this.error = ""}
  Output() __init10() {this.valueChange = new EventEmitter()}
  onInput(event) {
    this.valueChange.emit((event.target ).value);
  }
}
