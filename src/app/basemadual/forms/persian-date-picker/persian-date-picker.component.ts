import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from "@angular/core";
import { PersianDateParts } from "../../date/persian-date.models";
import { PersianDateService } from "../../date/persian-date.service";
@Component({
  selector: "app-base-persian-date-picker",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<fieldset [disabled]="disabled">
    <legend>
      {{ label }}
      @if (required) {
        <span aria-hidden="true"> *</span>
      }
    </legend>
    <div>
      <label
        ><span>روز</span
        ><select [value]="day" (change)="setDay($event)">
          @for (item of days; track item) {
            <option [value]="item">{{ item }}</option>
          }
        </select></label
      ><label
        ><span>ماه</span
        ><select [value]="month" (change)="setMonth($event)">
          @for (item of months; track item) {
            <option [value]="item">{{ item }}</option>
          }
        </select></label
      ><label
        ><span>سال</span
        ><select [value]="year" (change)="setYear($event)">
          @for (item of years; track item) {
            <option [value]="item">{{ item }}</option>
          }
        </select></label
      >
    </div>
    @if (error) {
      <small>{{ error }}</small>
    }
  </fieldset>`,
  styleUrl: "./persian-date-picker.component.scss",
})
export class PersianDatePickerComponent implements OnChanges {
  @Input() label = "تاریخ";
  @Input() value: Date | null = null;
  @Input() required = false;
  @Input() disabled = false;
  @Input() error = "";
  @Output() valueChange = new EventEmitter<Date | null>();
  readonly months = Array.from({ length: 12 }, (_, index) => index + 1);
  readonly days = Array.from({ length: 31 }, (_, index) => index + 1);
  readonly years = Array.from({ length: 101 }, (_, index) => 1350 + index);
  year = 1400;
  month = 1;
  day = 1;
  constructor(private readonly persianDate: PersianDateService) {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes["value"] && this.value) {
      const parts = this.persianDate.toPersianParts(this.value);
      if (parts) {
        this.applyParts(parts);
      }
    }
  }
  setDay(event: Event): void {
    this.day = this.selectNumber(event);
    this.emitDate();
  }
  setMonth(event: Event): void {
    this.month = this.selectNumber(event);
    this.emitDate();
  }
  setYear(event: Event): void {
    this.year = this.selectNumber(event);
    this.emitDate();
  }
  private emitDate(): void {
    this.valueChange.emit(
      this.persianDate.toGregorian({
        year: this.year,
        month: this.month,
        day: this.day,
      }),
    );
  }
  private applyParts(parts: PersianDateParts): void {
    this.year = parts.year;
    this.month = parts.month;
    this.day = parts.day;
  }
  private selectNumber(event: Event): number {
    return Number((event.target as HTMLSelectElement).value);
  }
}
