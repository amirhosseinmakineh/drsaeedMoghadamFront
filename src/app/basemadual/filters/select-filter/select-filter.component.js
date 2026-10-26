import {
  ChangeDetectionStrategy,

  EventEmitter,


} from "@angular/core";

@Component({
  selector: "app-base-select-filter",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<label
    ><span>{{ label }}</span
    ><select [disabled]="disabled" (change)="onChange($event)">
      <option value="">{{ placeholder }}</option>
      @for (option of options; track option.value) {
        <option
          [value]="option.value"
          [selected]="option.value === value"
          [disabled]="option.disabled"
        >
          {{ option.label }}
        </option>
      }
    </select></label
  >`,
  styles: [
    `
      :host {
        display: block;
      }
      label {
        display: grid;
        gap: 0.25rem;
        color: var(--muted);
        font-size: 0.875rem;
      }
      select {
        min-height: 44px;
      }
    `,
  ],
})
export class BaseSelectFilterComponent {constructor() { BaseSelectFilterComponent.prototype.__init.call(this);BaseSelectFilterComponent.prototype.__init2.call(this);BaseSelectFilterComponent.prototype.__init3.call(this);BaseSelectFilterComponent.prototype.__init4.call(this);BaseSelectFilterComponent.prototype.__init5.call(this);BaseSelectFilterComponent.prototype.__init6.call(this); }
  Input() __init() {this.label = "فیلتر"}
  Input() __init2() {this.placeholder = "همه"}
  Input() __init3() {this.options = []}
  Input() __init4() {this.value = null}
  Input() __init5() {this.disabled = false}
  Output() __init6() {this.valueChange = new EventEmitter()}
  onChange(event) {
    this.valueChange.emit((event.target ).value);
  }
}
