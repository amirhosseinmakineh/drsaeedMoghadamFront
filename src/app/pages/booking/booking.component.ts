import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { ClinicDataService } from '../../services/clinic-data.service';
import { Service, BookingStep } from '../../models/clinic.model';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(16px)' }),
        animate('0.4s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('stepTransition', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('0.3s ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        style({ opacity: 1, transform: 'translateX(0)' }),
        animate('0.2s ease-in', style({ opacity: 0, transform: 'translateX(20px)' }))
      ])
    ])
  ],
  template: `
    <div class="booking-page" @fadeIn>
      <div class="page-hero">
        <span class="page-label">رزرو نوبت</span>
        <h1 class="page-title">رزرو نوبت آنلاین</h1>
        <p class="page-desc">در چند مرحله ساده، نوبت مشاوره خود را رزرو کنید. مشاوره اولیه رایگان است.</p>
      </div>

      <div class="wizard">
        <div class="wizard-steps">
          <div class="step-indicator" *ngFor="let s of steps; let i = index" [class.active]="i + 1 === currentStep" [class.completed]="i + 1 < currentStep">
            <span class="step-num">{{ i + 1 < currentStep ? '&#10003;' : i + 1 }}</span>
            <span class="step-title">{{ s.title }}</span>
          </div>
        </div>

        <div class="wizard-content">
          <!-- Step 1: Service -->
          <div class="step-panel" *ngIf="currentStep === 1" @stepTransition>
            <h2>انتخاب خدمت</h2>
            <p class="step-hint">سرویس مورد نظر خود را انتخاب کنید.</p>
            <div class="service-options">
              <div class="service-option" *ngFor="let s of services" [class.selected]="selectedService?.id === s.id" (click)="selectedService = s">
                <div class="option-image">
                  <img [src]="s.image" [alt]="s.title" loading="lazy" />
                </div>
                <div class="option-info">
                  <span class="option-title">{{ s.title }}</span>
                  <span class="option-price">{{ s.price }}</span>
                </div>
                <div class="option-check" *ngIf="selectedService?.id === s.id">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2: Date & Time -->
          <div class="step-panel" *ngIf="currentStep === 2" @stepTransition>
            <h2>انتخاب تاریخ</h2>
            <p class="step-hint">روز مورد نظر برای ویزیت را انتخاب کنید.</p>
            <div class="calendar">
              <div class="calendar-header">
                <span class="calendar-month">{{ currentMonth }}</span>
              </div>
              <div class="calendar-grid">
                <div class="calendar-day-header" *ngFor="let d of dayHeaders">{{ d }}</div>
                <div class="calendar-cell" *ngFor="let d of calendarDays" [class.empty]="!d" [class.selected]="selectedDate === d" [class.past]="d && isPastDate(d)" [class.disabled]="d && isWeekend(d)" (click)="selectDate(d)">
                  <span *ngIf="d">{{ d }}</span>
                </div>
              </div>
            </div>
            <div class="time-slots" *ngIf="selectedDate">
              <h3>ساعت‌های موجود</h3>
              <div class="time-grid">
                <button class="time-btn" *ngFor="let t of timeSlots" [class.selected]="selectedTime === t" (click)="selectedTime = t">{{ t }}</button>
              </div>
            </div>
          </div>

          <!-- Step 3: Details -->
          <div class="step-panel" *ngIf="currentStep === 3" @stepTransition>
            <h2>اطلاعات شما</h2>
            <p class="step-hint">مشخصات تماس خود را وارد کنید.</p>
            <div class="form-grid">
              <div class="form-field">
                <label>نام</label>
                <input type="text" [(ngModel)]="firstName" placeholder="علی" />
              </div>
              <div class="form-field">
                <label>نام خانوادگی</label>
                <input type="text" [(ngModel)]="lastName" placeholder="احمدی" />
              </div>
              <div class="form-field full">
                <label>ایمیل</label>
                <input type="email" [(ngModel)]="email" placeholder="ali@example.com" />
              </div>
              <div class="form-field full">
                <label>شماره تماس</label>
                <input type="tel" [(ngModel)]="phone" placeholder="۰۹۱۲۳۴۵۶۷۸۹" />
              </div>
              <div class="form-field full">
                <label>توضیحات (اختیاری)</label>
                <textarea [(ngModel)]="notes" rows="3" placeholder="هرگونه نکته یا سوال خاص..."></textarea>
              </div>
            </div>
          </div>

          <!-- Step 4: Confirm -->
          <div class="step-panel" *ngIf="currentStep === 4" @stepTransition>
            <h2>تایید نهایی</h2>
            <p class="step-hint">اطلاعات نوبت خود را بررسی و تایید کنید.</p>
            <div class="summary-card">
              <div class="summary-row">
                <span class="summary-label">خدمت</span>
                <span class="summary-value">{{ selectedService?.title }}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">تاریخ</span>
                <span class="summary-value">{{ selectedDate ? (currentMonth + ' ' + selectedDate) : '-' }}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">ساعت</span>
                <span class="summary-value">{{ selectedTime || '-' }}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">نام</span>
                <span class="summary-value">{{ firstName }} {{ lastName }}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">ایمیل</span>
                <span class="summary-value">{{ email }}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">تماس</span>
                <span class="summary-value">{{ phone }}</span>
              </div>
              <div class="summary-row" *ngIf="notes">
                <span class="summary-label">توضیحات</span>
                <span class="summary-value">{{ notes }}</span>
              </div>
            </div>
            <div class="success-message" *ngIf="submitted">
              <div class="success-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <h3>درخواست شما ثبت شد</h3>
              <p>کارشناسان ما در اولین فرصت با شما تماس خواهند گرفت. با تشکر از اعتماد شما به کلینیک دکتر مقدم.</p>
            </div>
          </div>
        </div>

        <div class="wizard-actions" *ngIf="!submitted">
          <button class="btn-ghost" (click)="prevStep()" *ngIf="currentStep > 1">بازگشت</button>
          <button class="btn-primary" (click)="nextStep()" [disabled]="!canProceed()">
            {{ currentStep === 4 ? 'تایید و ثبت' : 'ادامه' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .booking-page {
      max-width: 720px;
      margin: 0 auto;
      padding: 48px 24px 80px;
    }
    .page-hero {
      text-align: center;
      margin-bottom: 40px;
    }
    .page-label {
      display: block;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #a08b6d;
      margin-bottom: 12px;
    }
    .page-title {
      font-size: clamp(32px, 5vw, 42px);
      font-weight: 800;
      color: #2c2c2c;
      margin: 0 0 10px;
      line-height: 1.15;
    }
    .page-desc {
      font-size: 16px;
      color: #888;
      margin: 0;
    }
    .wizard {
      background: #fff;
      border-radius: 24px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.06);
      overflow: hidden;
    }
    .wizard-steps {
      display: flex;
      padding: 24px;
      gap: 8px;
      border-bottom: 1px solid #f5f5f5;
    }
    .step-indicator {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      position: relative;
    }
    .step-indicator:not(:last-child)::after {
      content: '';
      position: absolute;
      top: 14px;
      left: -50%;
      width: 100%;
      height: 2px;
      background: #eee;
      z-index: 0;
    }
    .step-indicator.completed:not(:last-child)::after {
      background: #0066cc;
    }
    .step-num {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: #f5f5f5;
      color: #888;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      z-index: 1;
      transition: all 0.3s ease;
    }
    .step-indicator.active .step-num {
      background: #0066cc;
      color: #fff;
    }
    .step-indicator.completed .step-num {
      background: #0066cc;
      color: #fff;
    }
    .step-title {
      font-size: 11px;
      font-weight: 500;
      color: #888;
      text-align: center;
    }
    .step-indicator.active .step-title {
      color: #2c2c2c;
      font-weight: 700;
    }
    .wizard-content {
      padding: 32px;
      min-height: 320px;
    }
    .step-panel h2 {
      font-size: 22px;
      font-weight: 800;
      color: #2c2c2c;
      margin: 0 0 6px;
    }
    .step-hint {
      font-size: 14px;
      color: #888;
      margin: 0 0 24px;
    }
    .service-options {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .service-option {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 14px;
      border-radius: 16px;
      border: 1.5px solid #f0f0f0;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .service-option:hover {
      border-color: #ddd;
      background: #fafafa;
    }
    .service-option.selected {
      border-color: #0066cc;
      background: #f0f5ff;
    }
    .option-image {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      overflow: hidden;
      flex-shrink: 0;
    }
    .option-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .option-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .option-title {
      font-size: 15px;
      font-weight: 700;
      color: #2c2c2c;
    }
    .option-price {
      font-size: 13px;
      color: #888;
    }
    .option-check {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #0066cc;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .option-check svg {
      width: 14px;
      height: 14px;
      color: #fff;
    }
    .calendar {
      border: 1px solid #f0f0f0;
      border-radius: 16px;
      padding: 20px;
      background: #fafafa;
    }
    .calendar-header {
      text-align: center;
      margin-bottom: 16px;
    }
    .calendar-month {
      font-size: 16px;
      font-weight: 700;
      color: #2c2c2c;
    }
    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 6px;
    }
    .calendar-day-header {
      text-align: center;
      font-size: 11px;
      font-weight: 700;
      color: #aaa;
      padding: 6px 0;
    }
    .calendar-cell {
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      font-size: 14px;
      color: #555;
      cursor: pointer;
      transition: all 0.15s ease;
      background: #fff;
    }
    .calendar-cell:hover:not(.empty):not(.past):not(.disabled) {
      background: #f0f0f0;
    }
    .calendar-cell.selected {
      background: #0066cc;
      color: #fff;
      font-weight: 700;
    }
    .calendar-cell.past, .calendar-cell.disabled {
      color: #ccc;
      cursor: not-allowed;
      background: #f5f5f5;
    }
    .calendar-cell.empty {
      background: transparent;
      cursor: default;
    }
    .time-slots {
      margin-top: 24px;
    }
    .time-slots h3 {
      font-size: 14px;
      font-weight: 700;
      color: #2c2c2c;
      margin: 0 0 12px;
    }
    .time-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 10px;
    }
    .time-btn {
      padding: 10px;
      border-radius: 10px;
      border: 1.5px solid #eee;
      background: #fff;
      font-size: 13px;
      font-weight: 500;
      color: #555;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }
    .time-btn:hover {
      border-color: #ccc;
    }
    .time-btn.selected {
      background: #0066cc;
      color: #fff;
      border-color: #0066cc;
      font-weight: 700;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .form-field.full {
      grid-column: 1 / -1;
    }
    .form-field label {
      display: block;
      font-size: 13px;
      font-weight: 700;
      color: #444;
      margin-bottom: 6px;
    }
    .form-field input, .form-field textarea {
      width: 100%;
      padding: 12px 14px;
      border-radius: 12px;
      border: 1.5px solid #eee;
      font-size: 15px;
      font-family: inherit;
      color: #2c2c2c;
      background: #fff;
      transition: border-color 0.2s ease;
      box-sizing: border-box;
    }
    .form-field input:focus, .form-field textarea:focus {
      outline: none;
      border-color: #0066cc;
    }
    .form-field input::placeholder, .form-field textarea::placeholder {
      color: #bbb;
    }
    .summary-card {
      background: #fafafa;
      border-radius: 16px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #eee;
    }
    .summary-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .summary-label {
      font-size: 13px;
      color: #888;
      flex-shrink: 0;
    }
    .summary-value {
      font-size: 14px;
      font-weight: 700;
      color: #2c2c2c;
      text-align: left;
    }
    .success-message {
      text-align: center;
      padding: 32px 20px;
    }
    .success-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #e8f5e9;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
    }
    .success-icon svg {
      width: 28px;
      height: 28px;
      color: #4a8b5a;
    }
    .success-message h3 {
      font-size: 20px;
      font-weight: 700;
      color: #2c2c2c;
      margin: 0 0 8px;
    }
    .success-message p {
      font-size: 14px;
      color: #777;
      line-height: 1.7;
      max-width: 400px;
      margin: 0 auto;
    }
    .wizard-actions {
      display: flex;
      justify-content: space-between;
      padding: 20px 32px 32px;
      gap: 12px;
    }
    .btn-ghost {
      background: #f5f5f5;
      color: #555;
      padding: 12px 24px;
      border-radius: 12px;
      border: none;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }
    .btn-ghost:hover {
      background: #eee;
    }
    .btn-primary {
      background: #0066cc;
      color: #fff;
      padding: 12px 28px;
      border-radius: 12px;
      border: none;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.25s ease;
      font-family: inherit;
      margin-left: auto;
    }
    .btn-primary:hover:not(:disabled) {
      background: #0055aa;
      transform: translateY(-1px);
    }
    .btn-primary:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    @media (max-width: 768px) {
      .booking-page { padding: 32px 16px 80px; }
      .wizard-content { padding: 24px; }
      .wizard-actions { padding: 16px 24px 24px; }
      .form-grid { grid-template-columns: 1fr; }
      .calendar-grid { gap: 4px; }
      .calendar-cell { font-size: 12px; }
      .step-indicator:not(:last-child)::after { display: none; }
      .step-title { font-size: 10px; }
    }
  `]
})
export class BookingComponent {
  steps: BookingStep[];
  currentStep = 1;
  services: Service[];

  selectedService: Service | null = null;
  selectedDate: number | null = null;
  selectedTime: string | null = null;
  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  notes = '';
  submitted = false;

  currentMonth = 'تیر ۱۴۰۵';
  dayHeaders = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
  calendarDays: (number | null)[] = [];
  timeSlots = ['۹:۰۰', '۱۰:۰۰', '۱۱:۰۰', '۱۳:۰۰', '۱۴:۰۰', '۱۵:۰۰', '۱۶:۰۰'];

  constructor(private data: ClinicDataService) {
    this.steps = this.data.getBookingSteps();
    this.services = this.data.getServices();
    this.generateCalendar();
  }

  private generateCalendar() {
    const daysInMonth = 30;
    const startDay = 2; // شنبه = 0
    this.calendarDays = [];
    for (let i = 0; i < startDay; i++) {
      this.calendarDays.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      this.calendarDays.push(i);
    }
  }

  isPastDate(day: number): boolean {
    return day < 21;
  }

  isWeekend(day: number): boolean {
    const idx = this.calendarDays.indexOf(day);
    return idx % 7 === 5;
  }

  selectDate(day: number | null) {
    if (!day || this.isPastDate(day) || this.isWeekend(day)) return;
    this.selectedDate = day;
  }

  canProceed(): boolean {
    switch (this.currentStep) {
      case 1: return !!this.selectedService;
      case 2: return !!this.selectedDate && !!this.selectedTime;
      case 3: return !!this.firstName.trim() && !!this.lastName.trim() && !!this.email.trim() && !!this.phone.trim();
      case 4: return true;
      default: return false;
    }
  }

  nextStep() {
    if (this.currentStep === 4) {
      this.submitted = true;
      return;
    }
    if (this.canProceed()) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }
}
