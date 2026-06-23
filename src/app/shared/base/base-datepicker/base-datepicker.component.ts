import { NgFor } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePickerDay, LanguageCode, LocalizedText, pickText, text } from '../../../models/clinic.model';

@Component({
  selector: 'app-base-datepicker',
  standalone: true,
  imports: [NgFor],
  template: `
    <section class="base-datepicker" [attr.dir]="language === 'fa' ? 'rtl' : 'ltr'">
      <header>
        <span>{{ labelText }}</span>
        <strong>{{ monthLabel }}</strong>
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
          (click)="select(day.iso)"
        >
          <small>{{ day.weekday }}</small>
          <b>{{ day.label }}</b>
        </button>
      </div>

      <label class="native-date">
        {{ language === 'fa' ? 'انتخاب دقیق با تقویم دستگاه' : 'Pick exact date from device calendar' }}
        <input type="date" [value]="dateValue" (change)="select($any($event.target).value)" />
      </label>
    </section>
  `,
  styles: [`
    .base-datepicker{display:grid;gap:14px;padding:16px;border:1px solid color-mix(in srgb,var(--brand,#a8793f) 18%,transparent);border-radius:26px;background:color-mix(in srgb,var(--surface,#fff) 82%,transparent);box-shadow:0 18px 48px rgba(91,64,38,.08)}
    header{display:flex;align-items:center;justify-content:space-between;gap:12px}header span{color:var(--brand,#a8793f);font-weight:900}header strong{color:var(--text,#2c241b)}
    .week-row,.day-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:7px}.week-row span{text-align:center;color:var(--muted,#64748b);font-size:.74rem;font-weight:800}
    .day-grid button{display:grid;place-items:center;gap:2px;min-height:58px;border:0;border-radius:17px;background:var(--surface-muted,#efe2d0);color:var(--text,#2c241b);font:inherit;cursor:pointer;transition:transform .2s ease,background .2s ease,color .2s ease}.day-grid button:hover:not(:disabled){transform:translateY(-2px)}.day-grid button.active{background:linear-gradient(135deg,var(--brand,#a8793f),var(--brand-2,#d7b16d));color:#fff;box-shadow:0 16px 32px color-mix(in srgb,var(--brand,#a8793f) 24%,transparent)}.day-grid button:disabled{opacity:.36;cursor:not-allowed}.day-grid small{font-size:.66rem}.day-grid b{font-size:1rem}
    .native-date{display:grid;gap:8px;color:var(--muted,#64748b);font-size:.88rem;font-weight:800}input{width:100%;border:1px solid color-mix(in srgb,var(--line,#dbe6ee) 92%,transparent);border-radius:16px;padding:12px;background:var(--surface,#fff);color:var(--text,#14222e);font:inherit}
  `]
})
export class BaseDatepickerComponent {
  @Input() language: LanguageCode = 'fa';
  @Input() selectedDate?: Date;
  @Input() label: LocalizedText = text('تاریخ پیشنهادی تماس', 'Preferred call date');
  @Output() dateChange = new EventEmitter<Date>();

  get labelText(): string {
    return pickText(this.label, this.language);
  }

  get weekDays(): string[] {
    return this.language === 'fa'
      ? ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']
      : ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  }

  get monthLabel(): string {
    return new Intl.DateTimeFormat(this.locale, { month: 'long', year: 'numeric' }).format(this.selectedDate ?? new Date());
  }

  get dateValue(): string {
    return this.selectedDate ? this.toIsoDate(this.selectedDate) : '';
  }

  get days(): DatePickerDay[] {
    const today = new Date();
    return Array.from({ length: 14 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);

      return {
        label: new Intl.DateTimeFormat(this.locale, { day: 'numeric' }).format(date),
        weekday: new Intl.DateTimeFormat(this.locale, { weekday: 'short' }).format(date),
        iso: this.toIsoDate(date),
        disabled: index === 0
      };
    });
  }

  select(value: string): void {
    if (!value) return;

    const selected = new Date(`${value}T00:00:00`);
    this.selectedDate = selected;
    this.dateChange.emit(selected);
  }

  private get locale(): string {
    return this.language === 'fa' ? 'fa-IR' : 'en-US';
  }

  private toIsoDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
