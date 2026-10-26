 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { NgFor, NgIf } from "@angular/common";
import {
  ChangeDetectionStrategy,



  EventEmitter,





} from "@angular/core";
import {



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
export class BaseDatepickerComponent  {
  Input() __init() {this.language = "fa"}
  Input() 
  Input() __init2() {this.label = text(
    "تاریخ پیشنهادی تماس",
    "Preferred call date",
  )}
  Input() 
  Input() 
  Input() __init3() {this.allowToday = false}
  /** Enables historical/report ranges: past dates selectable, future dates blocked. */
  Input() __init4() {this.allowPastDates = false}
  /** When used with allowPastDates, also allows selecting future dates (calendar filters). */
  Input() __init5() {this.allowFutureDates = null}
  /** Report/filter calendars: all past and future dates stay selectable. */
  Input() __init6() {this.unrestrictedDates = false}
  /** Renders the calendar as a compact popover for dense filter toolbars. */
  Input() __init7() {this.compact = false}
  Output() __init8() {this.dateChange = new EventEmitter()}

  __init9() {this.calendarOpen = false}

   __init10() {this.activeMonthAnchor = new Date()}
   __init11() {this.cachedDays = []}
   __init12() {this.daysCacheKey = ""}

  constructor(
     cdr,
      elementRef,
  ) {;this.cdr = cdr;this.elementRef = elementRef;BaseDatepickerComponent.prototype.__init.call(this);BaseDatepickerComponent.prototype.__init2.call(this);BaseDatepickerComponent.prototype.__init3.call(this);BaseDatepickerComponent.prototype.__init4.call(this);BaseDatepickerComponent.prototype.__init5.call(this);BaseDatepickerComponent.prototype.__init6.call(this);BaseDatepickerComponent.prototype.__init7.call(this);BaseDatepickerComponent.prototype.__init8.call(this);BaseDatepickerComponent.prototype.__init9.call(this);BaseDatepickerComponent.prototype.__init10.call(this);BaseDatepickerComponent.prototype.__init11.call(this);BaseDatepickerComponent.prototype.__init12.call(this);
    this.rebuildDaysCache();
  }

  get labelText() {
    return pickText(this.label, this.language);
  }

  get weekDays() {
    return this.language === "fa"
      ? ["ش", "ی", "د", "س", "چ", "پ", "ج"]
      : ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
  }

  get monthLabel() {
    return new Intl.DateTimeFormat(this.locale, {
      month: "long",
      year: "numeric",
    }).format(this.monthStart);
  }

  get dateValue() {
    return this.selectedDate ? this.toIsoDate(this.selectedDate) : "";
  }

  get selectedDateLabel() {
    if (!this.selectedDate) return "";

    return new Intl.DateTimeFormat(this.locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(this.selectedDate);
  }

  get canMovePrevious() {
    return this.monthStart.getTime() > this.minMonthStart.getTime();
  }

  get canMoveNext() {
    const maxDate = this.maxSelectableDate;
    if (!maxDate) return true;
    return (
      this.monthStart.getTime() <
      this.findMonthStart(maxDate, this.calendarParts(maxDate)).getTime()
    );
  }

  get days() {
    return this.cachedDays;
  }

  ngOnChanges(changes) {
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
        _nullishCoalesce(this.maxSelectableDate, () => ( this.minSelectableDate));
    }

    this.rebuildDaysCache();
    this.cdr.markForCheck();
  }

  moveMonth(direction) {
    if (direction < 0 && !this.canMovePrevious) return;
    if (direction > 0 && !this.canMoveNext) return;

    const base = this.monthStart;
    this.activeMonthAnchor = this.addDays(base, direction > 0 ? 32 : -2);
    this.rebuildDaysCache();
    this.cdr.markForCheck();
  }

  select(value) {
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

  toggleCalendar() {
    if (!this.compact) return;
    this.calendarOpen = !this.calendarOpen;
  }

  @HostListener("document:pointerdown", ["$event"])
  closeWhenClickingOutside(event) {
    if (
      this.compact &&
      this.calendarOpen &&
      !this.elementRef.nativeElement.contains(event.target )
    ) {
      this.calendarOpen = false;
      this.cdr.markForCheck();
    }
  }

  @HostListener("document:keydown.escape")
  closeWithEscape() {
    if (!this.calendarOpen) return;
    this.calendarOpen = false;
    this.cdr.markForCheck();
  }

   rebuildDaysCache() {
    const cacheKey = [
      this.language,
      this.activeMonthAnchor.getTime(),
      _nullishCoalesce(_optionalChain([this, 'access', _2 => _2.minDate, 'optionalAccess', _3 => _3.getTime, 'call', _4 => _4()]), () => ( "none")),
      _nullishCoalesce(_optionalChain([this, 'access', _5 => _5.maxDate, 'optionalAccess', _6 => _6.getTime, 'call', _7 => _7()]), () => ( "none")),
      this.allowToday,
      this.allowPastDates,
      this.effectiveAllowFutureDates,
      this.unrestrictedDates,
      _nullishCoalesce(_optionalChain([this, 'access', _8 => _8.selectedDate, 'optionalAccess', _9 => _9.getTime, 'call', _10 => _10()]), () => ( "none")),
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

   get monthStart() {
    return this.findMonthStart(
      this.activeMonthAnchor,
      this.calendarParts(this.activeMonthAnchor),
    );
  }

   get currentMonthStart() {
    const today = new Date();
    return this.findMonthStart(today, this.calendarParts(today));
  }

   get minMonthStart() {
    return this.findMonthStart(
      this.minSelectableDate,
      this.calendarParts(this.minSelectableDate),
    );
  }

   get minSelectableDate() {
    if (this.unrestrictedDates) return this.startOfDay(new Date(2000, 0, 1));
    if (this.minDate) return this.startOfDay(this.minDate);
    if (this.allowPastDates) return this.startOfDay(new Date(2000, 0, 1));

    const today = this.startOfDay(this.referenceToday());
    return this.allowToday ? today : this.addDays(today, 1);
  }

   get effectiveAllowFutureDates() {
    if (this.allowFutureDates !== null) return this.allowFutureDates;
    return !this.allowPastDates;
  }

   get maxSelectableDate() {
    if (this.unrestrictedDates) return null;
    if (this.maxDate) return this.startOfDay(this.maxDate);
    if (this.allowPastDates && !this.effectiveAllowFutureDates) {
      return this.startOfDay(this.referenceToday());
    }

    return null;
  }

   get locale() {
    return this.language === "fa" ? "fa-IR-u-ca-persian" : "en-US";
  }

   calendarParts(date)



 {
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
      year: Number(_optionalChain([parts, 'access', _11 => _11.find, 'call', _12 => _12((part) => part.type === "year"), 'optionalAccess', _13 => _13.value])),
      month: Number(_optionalChain([parts, 'access', _14 => _14.find, 'call', _15 => _15((part) => part.type === "month"), 'optionalAccess', _16 => _16.value])),
      day: Number(_optionalChain([parts, 'access', _17 => _17.find, 'call', _18 => _18((part) => part.type === "day"), 'optionalAccess', _19 => _19.value])),
    };
  }

   findMonthStart(
    anchor,
    target,
  ) {
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

   weekOffset(date) {
    return (date.getDay() + 1) % 7;
  }

   addDays(date, days) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return this.startOfDay(next);
  }

   startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

   fromIsoDate(value) {
    if (this.language === "fa") {
      return fromIranDateInputValue(value);
    }

    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

   toIsoDate(date) {
    if (this.language === "fa") {
      return toIranDateInputValue(date);
    }

    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

   referenceToday() {
    return this.language === "fa" ? nowInIran() : new Date();
  }

   activeMonthAnchorOutsideSelectableRange() {
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
