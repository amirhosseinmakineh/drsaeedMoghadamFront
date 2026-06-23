import { NgFor } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

interface CalendarDay { label: string; iso: string; disabled: boolean; }

@Component({
  selector: 'app-persian-date-picker',
  standalone: true,
  imports: [NgFor],
  template: `
    <div class="date-card" dir="rtl">
      <div class="date-head">
        <span>انتخاب تاریخ تماس</span>
        <strong>{{ monthLabel }}</strong>
      </div>
      <div class="week"><span *ngFor="let day of weekDays">{{ day }}</span></div>
      <div class="days">
        <button *ngFor="let day of days" type="button" [disabled]="day.disabled" [class.active]="day.iso === dateValue" (click)="select(day.iso)">{{ day.label }}</button>
      </div>
      <input type="date" [value]="dateValue" (change)="select($any($event.target).value)" aria-label="Select date" />
    </div>
  `,
  styles: [`
    .date-card{display:grid;gap:12px;padding:16px;border:1px solid rgba(14,124,134,.14);border-radius:24px;background:rgba(255,255,255,.72)}.date-head{display:flex;justify-content:space-between;gap:10px;color:#6b5a45}.date-head span{font-weight:900;color:#0e7c86}.week,.days{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}.week span{text-align:center;font-size:.78rem;color:#9a8060}.days button{aspect-ratio:1;border:0;border-radius:13px;background:#f7efe4;color:#3a2f25;font-weight:900;cursor:pointer}.days button.active{background:#0e7c86;color:#fff}.days button:disabled{opacity:.35;cursor:not-allowed}input{border:1px solid #eadfce;border-radius:14px;padding:10px;background:#fff;font:inherit}
  `]
})
export class PersianDatePickerComponent {
  @Input() selectedDate?: Date;
  @Output() dateChange = new EventEmitter<Date>();
  weekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
  get monthLabel(): string { return new Intl.DateTimeFormat('fa-IR', { month: 'long', year: 'numeric' }).format(this.selectedDate ?? new Date()); }
  get dateValue(): string { return this.selectedDate ? this.selectedDate.toISOString().slice(0, 10) : ''; }
  get days(): CalendarDay[] {
    const base = new Date();
    return Array.from({ length: 14 }, (_, index) => {
      const date = new Date(base); date.setDate(base.getDate() + index);
      return { label: new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(date), iso: date.toISOString().slice(0, 10), disabled: index === 0 };
    });
  }
  select(value: string): void { if (!value) return; const selected = new Date(`${value}T00:00:00`); this.selectedDate = selected; this.dateChange.emit(selected); }
}
