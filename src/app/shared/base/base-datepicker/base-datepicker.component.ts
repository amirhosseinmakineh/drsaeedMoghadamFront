import { NgFor, NgIf } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from "@angular/core";
import {
  DatePickerDay,
  LanguageCode,
  LocalizedText,
  pickText,
  text,
} from "../../../models/clinic.model";

@Component({
  selector: "app-base-datepicker",
  standalone: true,
  imports: [NgFor, NgIf],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="base-datepicker"
      [attr.dir]="language === 'fa' ? 'rtl' : 'ltr'"
    >
      <header>
        <div>
          <span>{{ labelText }}</span>
          <strong>{{ monthLabel }}</strong>
        </div>
        <div
          class="month-nav"
          [attr.aria-label]="
            language === 'fa' ? 'تغییر ماه تقویم' : 'Change calendar month'
          "
        >
          <button
            type="button"
            (click)="moveMonth(-1)"
            [disabled]="!canMovePrevious"
          >
            {{ language === "fa" ? "ماه قبل" : "Prev" }}
          </button>
          <button
            type="button"
            (click)="moveMonth(1)"
            [disabled]="!canMoveNext"
          >
            {{ language === "fa" ? "ماه بعد" : "Next" }}
          </button>
        </div>
      </header>

      <div class="week-row" aria-hidden="true">
        <span *ngFor="let day of weekDays">{{ day }}</span>
      </div>

      <div class="day-grid">
        <button
          *ngFor="let day of days"
          type="button"
          [disabled]="day.disabled"
          [class.active]="day.iso === dateValue"
          [class.outside]="day.outsideMonth"
          [attr.aria-label]="day.ariaLabel"
          (click)="select(day)"
        >
          <small>{{ day.weekday }}</small>
          <b>{{ day.label }}</b>
        </button>
      </div>

      <p *ngIf="language === 'fa' && selectedDate" class="calendar-note">
        {{ "تاریخ انتخاب‌شده: " + selectedDateLabel }}
      </p>

      <label *ngIf="language !== 'fa'" class="native-date">
        Pick exact date from device calendar
        <input
          type="date"
          [value]="dateValue"
          (change)="select($any($event.target).value)"
        />
      </label>
    </section>
  `,
  styles: [
    `
      .base-datepicker {
        display: grid;
        gap: 14px;
        padding: 16px;
        border: 1px solid
          color-mix(in srgb, var(--brand, #a8793f) 18%, transparent);
        border-radius: 26px;
        background: color-mix(in srgb, var(--surface, #fff) 82%, transparent);
        box-shadow: 0 18px 48px rgba(91, 64, 38, 0.08);
      }
      header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      header > div:first-child {
        display: grid;
        gap: 4px;
      }
      header span {
        color: var(--brand, #a8793f);
        font-weight: 900;
      }
      header strong {
        color: var(--text, #2c241b);
      }
      .month-nav {
        display: flex;
        gap: 6px;
      }
      .month-nav button {
        border: 1px solid
          color-mix(in srgb, var(--brand, #a8793f) 20%, transparent);
        border-radius: 999px;
        padding: 8px 10px;
        background: var(--surface, #fff);
        color: var(--brand, #a8793f);
        font: inherit;
        font-size: 0.76rem;
        font-weight: 900;
        cursor: pointer;
      }
      .month-nav button:disabled {
        opacity: 0.38;
        cursor: not-allowed;
      }
      .week-row,
      .day-grid {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: 7px;
      }
      .week-row span {
        text-align: center;
        color: var(--muted, #64748b);
        font-size: 0.74rem;
        font-weight: 800;
      }
      .day-grid button {
        display: grid;
        place-items: center;
        gap: 2px;
        min-height: 58px;
        border: 0;
        border-radius: 17px;
        background: var(--surface-muted, #efe2d0);
        color: var(--text, #2c241b);
        font: inherit;
        cursor: pointer;
      }
      .day-grid button:hover:not(:disabled) {
        box-shadow: 0 10px 22px rgba(93, 64, 32, 0.1);
      }
      .day-grid button.active {
        background: linear-gradient(
          135deg,
          var(--brand, #a8793f),
          var(--brand-2, #d7b16d)
        );
        color: #1b1712;
        box-shadow: 0 16px 32px
          color-mix(in srgb, var(--brand, #a8793f) 24%, transparent);
      }
      .day-grid button:disabled {
        opacity: 0.36;
        cursor: not-allowed;
      }
      .day-grid button.outside {
        background: color-mix(in srgb, var(--surface, #fff) 72%, transparent);
        color: var(--muted, #64748b);
      }
      .day-grid small {
        font-size: 0.66rem;
      }
      .day-grid b {
        font-size: 1rem;
      }
      .calendar-note {
        margin: 0;
        color: var(--muted, #64748b);
        font-size: 0.88rem;
        font-weight: 800;
      }
      .native-date {
        display: grid;
        gap: 8px;
        color: var(--muted, #64748b);
        font-size: 0.88rem;
        font-weight: 800;
      }
      input {
        width: 100%;
        border: 1px solid
          color-mix(in srgb, var(--line, #dbe6ee) 92%, transparent);
        border-radius: 16px;
        padding: 12px;
        background: var(--surface, #fff);
        color: var(--text, #14222e);
        font: inherit;
      }
      @media (max-width: 560px) {
        header {
          align-items: flex-start;
          flex-direction: column;
        }
        .month-nav {
          width: 100%;
        }
        .month-nav button {
          flex: 1;
        }
      }
    `,
  ],
})
export class BaseDatepickerComponent implements OnChanges {
  @Input() language: LanguageCode = "fa";
  @Input() selectedDate?: Date;
  @Input() label: LocalizedText = text(
    "تاریخ پیشنهادی تماس",
    "Preferred call date",
  );
  @Input() minDate?: Date | null;
  @Input() maxDate?: Date | null;
  @Input() allowToday = false;
  @Output() dateChange = new EventEmitter<Date>();

  private activeMonthAnchor = new Date();
  private cachedDays: DatePickerDay[] = [];
  private daysCacheKey = "";

  constructor(private cdr: ChangeDetectorRef) {
    this.rebuildDaysCache();
  }

  get labelText(): string {
    return pickText(this.label, this.language);
  }

  get weekDays(): string[] {
    return this.language === "fa"
      ? ["ش", "ی", "د", "س", "چ", "پ", "ج"]
      : ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
  }

  get monthLabel(): string {
    return new Intl.DateTimeFormat(this.locale, {
      month: "long",
      year: "numeric",
    }).format(this.monthStart);
  }

  get dateValue(): string {
    return this.selectedDate ? this.toIsoDate(this.selectedDate) : "";
  }

  get selectedDateLabel(): string {
    if (!this.selectedDate) return "";

    return new Intl.DateTimeFormat(this.locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(this.selectedDate);
  }

  get canMovePrevious(): boolean {
    return this.monthStart.getTime() > this.minMonthStart.getTime();
  }

  get canMoveNext(): boolean {
    if (!this.maxDate) return true;
    return (
      this.monthStart.getTime() <
      this.findMonthStart(
        this.maxDate,
        this.calendarParts(this.maxDate),
      ).getTime()
    );
  }

  get days(): DatePickerDay[] {
    return this.cachedDays;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["selectedDate"] && this.selectedDate) {
      this.activeMonthAnchor = this.selectedDate;
    } else if (
      (changes["maxDate"] || changes["minDate"]) &&
      this.activeMonthAnchorOutsideSelectableRange()
    ) {
      this.activeMonthAnchor = this.maxDate ?? this.minSelectableDate;
    }

    this.rebuildDaysCache();
    this.cdr.markForCheck();
  }

  moveMonth(direction: number): void {
    if (direction < 0 && !this.canMovePrevious) return;
    if (direction > 0 && !this.canMoveNext) return;

    const base = this.monthStart;
    this.activeMonthAnchor = this.addDays(base, direction > 0 ? 32 : -2);
    this.rebuildDaysCache();
    this.cdr.markForCheck();
  }

  select(value: DatePickerDay | string): void {
    if (!value) return;
    if (typeof value !== "string" && value.disabled) return;

    const isoValue = typeof value === "string" ? value : value.iso;
    const selected = this.fromIsoDate(isoValue);
    this.selectedDate = selected;
    this.dateChange.emit(selected);
    this.rebuildDaysCache();
    this.cdr.markForCheck();
  }

  private rebuildDaysCache(): void {
    const cacheKey = [
      this.language,
      this.activeMonthAnchor.getTime(),
      this.minDate?.getTime() ?? "none",
      this.maxDate?.getTime() ?? "none",
      this.allowToday,
      this.selectedDate?.getTime() ?? "none",
    ].join("|");

    if (cacheKey === this.daysCacheKey) return;

    this.daysCacheKey = cacheKey;
    const minDate = this.minSelectableDate;
    const maxDate = this.maxDate ? this.startOfDay(this.maxDate) : null;
    const currentMonth = this.calendarParts(this.activeMonthAnchor);
    const gridStart = this.addDays(
      this.monthStart,
      -this.weekOffset(this.monthStart),
    );
    const dayFormatter = new Intl.DateTimeFormat(this.locale, {
      day: "numeric",
    });
    const weekdayFormatter = new Intl.DateTimeFormat(this.locale, {
      weekday: "short",
    });
    const ariaFormatter = new Intl.DateTimeFormat(this.locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    this.cachedDays = Array.from({ length: 42 }, (_, index) => {
      const date = this.addDays(gridStart, index);
      const parts = this.calendarParts(date);
      const outsideMonth =
        parts.year !== currentMonth.year || parts.month !== currentMonth.month;

      return {
        label: dayFormatter.format(date),
        weekday: weekdayFormatter.format(date),
        iso: this.toIsoDate(date),
        disabled:
          outsideMonth ||
          this.startOfDay(date).getTime() < minDate.getTime() ||
          (maxDate !== null &&
            this.startOfDay(date).getTime() > maxDate.getTime()),
        outsideMonth,
        ariaLabel: ariaFormatter.format(date),
      };
    });
  }

  private get monthStart(): Date {
    return this.findMonthStart(
      this.activeMonthAnchor,
      this.calendarParts(this.activeMonthAnchor),
    );
  }

  private get currentMonthStart(): Date {
    const today = new Date();
    return this.findMonthStart(today, this.calendarParts(today));
  }

  private get minMonthStart(): Date {
    return this.findMonthStart(
      this.minSelectableDate,
      this.calendarParts(this.minSelectableDate),
    );
  }

  private get minSelectableDate(): Date {
    if (this.minDate) return this.startOfDay(this.minDate);

    const today = this.startOfDay(new Date());
    return this.allowToday ? today : this.addDays(today, 1);
  }

  private get locale(): string {
    return this.language === "fa" ? "fa-IR-u-ca-persian" : "en-US";
  }

  private calendarParts(date: Date): {
    year: number;
    month: number;
    day: number;
  } {
    if (this.language !== "fa") {
      return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
      };
    }

    const parts = new Intl.DateTimeFormat("en-US-u-ca-persian", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).formatToParts(date);

    return {
      year: Number(parts.find((part) => part.type === "year")?.value),
      month: Number(parts.find((part) => part.type === "month")?.value),
      day: Number(parts.find((part) => part.type === "day")?.value),
    };
  }

  private findMonthStart(
    anchor: Date,
    target: { year: number; month: number },
  ): Date {
    for (let offset = -40; offset <= 40; offset += 1) {
      const date = this.addDays(anchor, offset);
      const parts = this.calendarParts(date);

      if (
        parts.year === target.year &&
        parts.month === target.month &&
        parts.day === 1
      ) {
        return this.startOfDay(date);
      }
    }

    return this.startOfDay(anchor);
  }

  private weekOffset(date: Date): number {
    return (date.getDay() + 1) % 7;
  }

  private addDays(date: Date, days: number): Date {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return this.startOfDay(next);
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private fromIsoDate(value: string): Date {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  private activeMonthAnchorOutsideSelectableRange(): boolean {
    const monthStart = this.monthStart.getTime();
    if (monthStart < this.minMonthStart.getTime()) return true;
    if (!this.maxDate) return false;

    const maxMonthStart = this.findMonthStart(
      this.maxDate,
      this.calendarParts(this.maxDate),
    ).getTime();
    return monthStart > maxMonthStart;
  }
}
