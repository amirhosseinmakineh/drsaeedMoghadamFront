import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from "@angular/core";
import { PersianDatePickerComponent } from "../../forms/persian-date-picker/persian-date-picker.component";
@Component({
  selector: "app-base-date-range-filter",
  standalone: true,
  imports: [PersianDatePickerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<fieldset>
    <legend>{{ label }}</legend>
    <app-base-persian-date-picker
      label="از تاریخ"
      [value]="from"
      (valueChange)="fromChange.emit($event)"
    /><app-base-persian-date-picker
      label="تا تاریخ"
      [value]="to"
      (valueChange)="toChange.emit($event)"
    />
  </fieldset>`,
  styles: [
    `
      :host {
        display: block;
      }
      fieldset {
        display: grid;
        gap: 0.75rem;
        margin: 0;
        padding: 0;
        border: 0;
      }
      legend {
        margin-block-end: 0.25rem;
        color: var(--muted);
        font-size: 0.875rem;
      }
      @media (min-width: 640px) {
        fieldset {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        legend {
          grid-column: 1/-1;
        }
      }
    `,
  ],
})
export class BaseDateRangeFilterComponent {
  @Input() label = "بازه تاریخ";
  @Input() from: Date | null = null;
  @Input() to: Date | null = null;
  @Output() fromChange = new EventEmitter<Date | null>();
  @Output() toChange = new EventEmitter<Date | null>();
}
