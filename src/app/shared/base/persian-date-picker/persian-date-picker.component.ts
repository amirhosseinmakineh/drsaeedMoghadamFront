import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-persian-date-picker',
  standalone: true,
  template: `
    <input
      type="date"
      [value]="dateValue"
      (change)="onDateInput($any($event.target).value)"
      aria-label="Select date"
    />
  `
})
export class PersianDatePickerComponent {
  @Input() selectedDate?: Date;

  @Output() dateChange = new EventEmitter<Date>();

  get dateValue(): string {
    if (!this.selectedDate) {
      return '';
    }

    return this.selectedDate.toISOString().slice(0, 10);
  }

  onDateInput(value: string): void {
    if (!value) {
      return;
    }

    const selected = new Date(`${value}T00:00:00`);
    this.selectedDate = selected;
    this.dateChange.emit(selected);
  }
}
