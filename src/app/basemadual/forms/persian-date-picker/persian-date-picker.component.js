import { ChangeDetectionStrategy, EventEmitter, } from "@angular/core";

import { BaseDatepickerComponent } from "../../../shared/base/base-datepicker/base-datepicker.component";

/** Base-module adapter for the system's full Persian calendar. */
@Component({
  selector: "app-base-persian-date-picker",
  standalone: true,
  imports: [BaseDatepickerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class.disabled]="disabled">
      <app-base-datepicker
        language="fa"
        [label]="localizedLabel"
        [selectedDate]="value ?? undefined"
        [minDate]="minDate"
        [allowToday]="!!minDate"
        [unrestrictedDates]="!minDate"
        [compact]="true"
        (dateChange)="valueChange.emit($event)"
      />
      @if (required) { <span class="required" aria-hidden="true">*</span> }
    </div>
    @if (error) { <small role="alert">{{ error }}</small> }
  `,
  styleUrl: "./persian-date-picker.component.scss",
})
export class PersianDatePickerComponent {constructor() { PersianDatePickerComponent.prototype.__init.call(this);PersianDatePickerComponent.prototype.__init2.call(this);PersianDatePickerComponent.prototype.__init3.call(this);PersianDatePickerComponent.prototype.__init4.call(this);PersianDatePickerComponent.prototype.__init5.call(this);PersianDatePickerComponent.prototype.__init6.call(this);PersianDatePickerComponent.prototype.__init7.call(this); }
  Input() __init() {this.label = "تاریخ"}
  Input() __init2() {this.value = null}
  Input() __init3() {this.required = false}
  Input() __init4() {this.disabled = false}
  Input() __init5() {this.minDate = null}
  Input() __init6() {this.error = ""}
  Output() __init7() {this.valueChange = new EventEmitter()}

  get localizedLabel() {
    return { fa: this.label, en: this.label };
  }
}
