import { NgFor, NgIf } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
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
import {
  fromIranDateInputValue,
  nowInIran,
  toIranDateInputValue,
} from "../../../utils/iran-datetime.util";

@Component({
  selector: "app-base-datepicker",
  standalone: true,
  imports: [NgFor, NgIf],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./base-datepicker.component.html",
  styleUrl: "./base-datepicker.component.scss",
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
  /** Enables historical/report ranges: past dates selectable, future dates blocked. */
  @Input() allowPastDates = false;
  /** When used with allowPastDates, also allows selecting future dates (calendar filters). */
  @Input() allowFutureDates: boolean | null = null;
  /** Report/filter calendars: all past and future dates stay selectable. */
  @Input() unrestrictedDates = false;
  /** Renders the calendar as a compact popover for dense filter toolbars. */
  @Input() compact = false;
  @Output() dateChange = new EventEmitter<Date>();

  calendarOpen = false;

  private activeMonthAnchor = new Date();
  private cachedDays: DatePickerDay[] = [];
  private daysCacheKey = "";

  constructor(
    private cdr: ChangeDetectorRef,
    private readonly elementRef: ElementRef<HTMLElement>,
  ) {
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
    const maxDate = this.maxSelectableDate;
    if (!maxDate) return true;
    return (
      this.monthStart.getTime() <
      this.findMonthStart(maxDate, this.calendarParts(maxDate)).getTime()
    );
  }

  get days(): DatePickerDay[] {
    return this.cachedDays;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["selectedDate"] && this.selectedDate) {
      this.activeMonthAnchor = this.selectedDate;
    } else if (
      (changes["maxDate"] ||
        changes["minDate"] ||
        changes["allowPastDates"] ||
        changes["allowFutureDates"] ||
        changes["unrestrictedDates"]) &&
      this.activeMonthAnchorOutsideSelectableRange()
    ) {
      this.activeMonthAnchor =
        this.maxSelectableDate ?? this.minSelectableDate;
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
    if (this.compact) this.calendarOpen = false;
    this.rebuildDaysCache();
    this.cdr.markForCheck();
  }

  toggleCalendar(): void {
    if (!this.compact) return;
    this.calendarOpen = !this.calendarOpen;
  }

  @HostListener("document:pointerdown", ["$event"])
  closeWhenClickingOutside(event: PointerEvent): void {
    if (
      this.compact &&
      this.calendarOpen &&
      !this.elementRef.nativeElement.contains(event.target as Node)
    ) {
      this.calendarOpen = false;
      this.cdr.markForCheck();
    }
  }

  @HostListener("document:keydown.escape")
  closeWithEscape(): void {
    if (!this.calendarOpen) return;
    this.calendarOpen = false;
    this.cdr.markForCheck();
  }

  private rebuildDaysCache(): void {
    const cacheKey = [
      this.language,
      this.activeMonthAnchor.getTime(),
      this.minDate?.getTime() ?? "none",
      this.maxDate?.getTime() ?? "none",
      this.allowToday,
      this.allowPastDates,
      this.effectiveAllowFutureDates,
      this.unrestrictedDates,
      this.selectedDate?.getTime() ?? "none",
    ].join("|");

    if (cacheKey === this.daysCacheKey) return;

    this.daysCacheKey = cacheKey;
    const minDate = this.minSelectableDate;
    const maxDate = this.maxSelectableDate;
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
    if (this.unrestrictedDates) return this.startOfDay(new Date(2000, 0, 1));
    if (this.minDate) return this.startOfDay(this.minDate);
    if (this.allowPastDates) return this.startOfDay(new Date(2000, 0, 1));

    const today = this.startOfDay(this.referenceToday());
    return this.allowToday ? today : this.addDays(today, 1);
  }

  private get effectiveAllowFutureDates(): boolean {
    if (this.allowFutureDates !== null) return this.allowFutureDates;
    return !this.allowPastDates;
  }

  private get maxSelectableDate(): Date | null {
    if (this.unrestrictedDates) return null;
    if (this.maxDate) return this.startOfDay(this.maxDate);
    if (this.allowPastDates && !this.effectiveAllowFutureDates) {
      return this.startOfDay(this.referenceToday());
    }

    return null;
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
    if (this.language === "fa") {
      return fromIranDateInputValue(value);
    }

    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  private toIsoDate(date: Date): string {
    if (this.language === "fa") {
      return toIranDateInputValue(date);
    }

    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  private referenceToday(): Date {
    return this.language === "fa" ? nowInIran() : new Date();
  }

  private activeMonthAnchorOutsideSelectableRange(): boolean {
    const monthStart = this.monthStart.getTime();
    if (monthStart < this.minMonthStart.getTime()) return true;
    const maxDate = this.maxSelectableDate;
    if (!maxDate) return false;

    const maxMonthStart = this.findMonthStart(
      maxDate,
      this.calendarParts(maxDate),
    ).getTime();
    return monthStart > maxMonthStart;
  }
}
