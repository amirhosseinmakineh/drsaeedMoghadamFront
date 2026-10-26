import {
  ChangeDetectionStrategy,

  EventEmitter,


} from "@angular/core";

@Component({
  selector: "app-base-select-input",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<label [for]="inputId">{{ label }}</label
    ><select [id]="inputId" [disabled]="disabled" (change)="onChange($event)">
      <option value="">{{ placeholder }}</option>
      @for (option of options; track option.value) {
        <option
          [value]="option.value"
          [disabled]="option.disabled"
          [selected]="option.value === value"
        >
          {{ option.label }}
        </option>
      }
    </select>
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
      select {
        min-height: 44px;
      }
      small {
        color: var(--danger);
      }
    `,
  ],
})
export class BaseSelectInputComponent {constructor() { BaseSelectInputComponent.prototype.__init.call(this);BaseSelectInputComponent.prototype.__init2.call(this);BaseSelectInputComponent.prototype.__init3.call(this);BaseSelectInputComponent.prototype.__init4.call(this);BaseSelectInputComponent.prototype.__init5.call(this);BaseSelectInputComponent.prototype.__init6.call(this);BaseSelectInputComponent.prototype.__init7.call(this);BaseSelectInputComponent.prototype.__init8.call(this); }
  Input({ required: true }) __init() {this.inputId = ""}
  Input() __init2() {this.label = ""}
  Input() __init3() {this.placeholder = "انتخاب کنید"}
  Input() __init4() {this.options = []}
  Input() __init5() {this.value = null}
  Input() __init6() {this.disabled = false}
  Input() __init7() {this.error = ""}
  Output() __init8() {this.valueChange = new EventEmitter()}
  onChange(event) {
    this.valueChange.emit((event.target ).value);
  }
}
