import {
  ChangeDetectionStrategy,

  EventEmitter,


} from "@angular/core";
@Component({
  selector: "app-base-textarea-input",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<label [for]="inputId">{{ label }}</label
    ><textarea
      [id]="inputId"
      [rows]="rows"
      [value]="value"
      [placeholder]="placeholder"
      [disabled]="disabled"
      (input)="onInput($event)"
    ></textarea>
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
      textarea {
        min-height: 7rem;
      }
      small {
        color: var(--danger);
      }
    `,
  ],
})
export class BaseTextareaInputComponent {constructor() { BaseTextareaInputComponent.prototype.__init.call(this);BaseTextareaInputComponent.prototype.__init2.call(this);BaseTextareaInputComponent.prototype.__init3.call(this);BaseTextareaInputComponent.prototype.__init4.call(this);BaseTextareaInputComponent.prototype.__init5.call(this);BaseTextareaInputComponent.prototype.__init6.call(this);BaseTextareaInputComponent.prototype.__init7.call(this);BaseTextareaInputComponent.prototype.__init8.call(this); }
  Input({ required: true }) __init() {this.inputId = ""}
  Input() __init2() {this.label = ""}
  Input() __init3() {this.value = ""}
  Input() __init4() {this.placeholder = ""}
  Input() __init5() {this.rows = 4}
  Input() __init6() {this.disabled = false}
  Input() __init7() {this.error = ""}
  Output() __init8() {this.valueChange = new EventEmitter()}
  onInput(event) {
    this.valueChange.emit((event.target ).value);
  }
}
