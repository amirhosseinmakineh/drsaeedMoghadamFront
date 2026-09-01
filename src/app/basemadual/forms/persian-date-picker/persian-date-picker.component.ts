import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { LocalizedText } from "../../../models/clinic.model";
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
export class PersianDatePickerComponent {
  @Input() label = "تاریخ";
  @Input() value: Date | null = null;
  @Input() required = false;
  @Input() disabled = false;
  @Input() minDate: Date | null = null;
  @Input() error = "";
  @Output() valueChange = new EventEmitter<Date | null>();

  get localizedLabel(): LocalizedText {
    return { fa: this.label, en: this.label };
  }
}
