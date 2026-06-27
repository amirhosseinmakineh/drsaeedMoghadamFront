import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription, finalize } from 'rxjs';
import { AuthService, RegisterRequest } from '../../core/auth/auth.service';
import {
  ConsultantDashboardService,
  ConsultantDashboardStatus,
  ConsultantLead,
  ConsultantReservation,
  CreateReservationRequest,
  ConfirmAttendanceRequest,
  SubmitLeadCallReportRequest
} from '../../core/consultant/consultant-dashboard.service';
import { BaseDialogComponent } from '../../shared/base/base-dialog/base-dialog.component';
import { BaseDatepickerComponent } from '../../shared/base/base-datepicker/base-datepicker.component';
import { FaIconComponent } from '../../shared/ui/fa-icon/fa-icon.component';

const LEAD_STATE = {
  New: 1,
  Assigned: 2,
  Contacted: 3,
  Pending: 4,
  Converted: 5,
  Expired: 6,
  Rejected: 7
} as const;

const LEAD_TYPE = {
  RealTime: 1,
  OfflineQueue: 2
} as const;

const THREE_MINUTES_MS = 3 * 60 * 1000;

const CALL_RESULT_DEFAULT_DESCRIPTIONS: Record<number, string> = {
  1: 'تماس برقرار شد',
  2: 'تبدیل/موفق شد',
  3: 'رد شد',
  4: 'پاسخ نداد',
  5: 'شماره اشتباه بود',
  6: 'نیاز به پیگیری دارد'
};

interface ConsultantProfileForm {
  nationalityCode: string;
  address: string;
}

interface LeadReportForm {
  callResult: number;
  reportDescription: string;
}

interface ReservationForm {
  reservationDate: Date | null;
  reservationTime: string;
  patientCity: string;
  attendanceProbabilityPercent: number;
  attendancePrediction: string;
  description: string;
}

interface PatientProfileForm {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
  gender: number;
}

interface ConsultantStatusUpdate {
  isAvailable: boolean | null;
  isOnline: boolean | null;
}

type ConsultantDashboardSection = 'overview' | 'profile' | 'leads' | 'reservations';

interface ConsultantDashboardLink {
  id: ConsultantDashboardSection;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-consultant-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BaseDialogComponent, BaseDatepickerComponent, FaIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="dashboard-layout consultant-mode">
      <aside class="dashboard-sidebar mobile-app-nav">
        <a class="dashboard-brand" routerLink="/">
          <span class="brand-mark"><app-fa-icon name="tooth"></app-fa-icon></span>
          <strong>کلینیک دکتر سعید مقدم</strong>
        </a>

        <div class="dashboard-user-card">
          <span class="avatar"><app-fa-icon name="doctor"></app-fa-icon></span>
          <div>
            <small>کاربر وارد شده</small>
            <h1>{{ displayName() }}</h1>
            <b>{{ roleLabel() }}</b>
          </div>
        </div>

        <nav class="dashboard-nav" aria-label="داشبورد مشاور">
          <button
            *ngFor="let item of visibleDashboardLinks; trackBy: trackDashboardLink"
            type="button"
            [class.active]="activeSection === item.id"
            (click)="setSection(item.id)"
          >
            <app-fa-icon [name]="item.icon"></app-fa-icon>
            <span>{{ item.label }}</span>
          </button>
        </nav>

        <button class="secondary-btn logout-btn" type="button" (click)="logout()">
          <app-fa-icon name="logout"></app-fa-icon>
          خروج از حساب کاربری
        </button>
      </aside>

      <main class="dashboard-content">
        <section class="consultant-shell">
          <header class="dashboard-hero consultant-hero">
            <span>داشبورد مشاور</span>
            <h2>مدیریت مشاوره، {{ displayName() }}</h2>
            <p>پروفایل، حضور، وضعیت آنلاین، لیدها و رزروهای مشاور از همین فضای مشابه داشبورد ادمین مدیریت می‌شوند.</p>
          </header>

          @if (feedbackMessage) {
            <p class="feedback" [class.error]="feedbackType === 'error'" [class.success]="feedbackType === 'success'">
              {{ feedbackMessage }}
            </p>
          }

          @if (activeSection === 'overview') {
            <section class="consultant-overview">
              @if (!isProfileReady()) {
                <button type="button" (click)="setSection('profile')">
                  <span><app-fa-icon name="shield"></app-fa-icon></span>
                  <strong>تکمیل پروفایل</strong>
                  <small>برای فعال شدن لیدها، تکمیل یک‌باره پروفایل ضروری است.</small>
                </button>
              }
              <button type="button" (click)="setSection('leads')">
                <span><app-fa-icon name="clipboard"></app-fa-icon></span>
                <strong>لیدهای من</strong>
                <small>{{ leadTotalCount }} لید قابل نمایش؛ تماس، گزارش و رزرو از این بخش انجام می‌شود.</small>
              </button>
            </section>

            @if (!isProfileReady()) {
              <section class="consultant-panel locked-panel">
                <span class="lock-icon"><app-fa-icon name="shield"></app-fa-icon></span>
                <div>
                  <h2>داشبورد برای دریافت لید آماده نیست</h2>
                  <p>ابتدا اطلاعات پروفایل مشاور را تکمیل کنید تا حضور، آنلاین شدن، لیدها و رزروها فعال شوند.</p>
                </div>
                <button class="primary-action compact" type="button" (click)="setSection('profile')">تکمیل پروفایل</button>
              </section>
            } @else {
              <section class="status-card">
                <div class="status-summary">
                  <div>
                    <span>شناسه پروفایل</span>
                    <strong>{{ currentProfileId() }}</strong>
                  </div>
                  <div>
                    <span>حضور</span>
                    <strong [class.good]="isAvailable" [class.bad]="!isAvailable">{{ isAvailable ? 'حاضر' : 'ثبت نشده' }}</strong>
                  </div>
                  <div>
                    <span>وضعیت دریافت لید</span>
                    <strong [class.good]="isOnline" [class.bad]="!isOnline">{{ isOnline ? 'آنلاین' : 'آفلاین' }}</strong>
                  </div>
                </div>
                <div class="action-grid">
                  <button class="primary-action" type="button" [disabled]="availabilitySaving || isAvailable" (click)="setAvailability(true)">
                    <app-fa-icon name="check"></app-fa-icon>
                    ثبت حضور
                  </button>
                  <button class="secondary-action danger" type="button" [disabled]="availabilitySaving || !isAvailable || isOnline" (click)="setAvailability(false)">
                    <app-fa-icon name="moon"></app-fa-icon>
                    عدم حضور
                  </button>
                  <button class="primary-action" type="button" [disabled]="onlineSaving || !canGoOnline()" (click)="setOnlineStatus(true)">
                    <app-fa-icon name="mobile"></app-fa-icon>
                    آنلاین
                  </button>
                  <button class="secondary-action" type="button" [disabled]="onlineSaving || !isOnline" (click)="setOnlineStatus(false)">
                    <app-fa-icon name="close"></app-fa-icon>
                    آفلاین
                  </button>
                </div>

                @if (pendingOfflineCount > 0) {
                  <p class="queue-warning">
                    {{ pendingOfflineCount }} لید صف آفلاین تعیین‌تکلیف‌نشده دارید؛ تا ثبت گزارش آن‌ها امکان آنلاین شدن ندارید.
                  </p>
                }
              </section>
            }
          }

          @if (activeSection === 'profile') {
            @if (!isProfileReady()) {
              <section class="profile-lock-card">
                <span class="lock-icon"><app-fa-icon name="shield"></app-fa-icon></span>
                <h2>تکمیل پروفایل مشاور</h2>
                <p>
                  تا زمانی که پروفایل مشاور کامل نباشد، دسترسی به حضور، آنلاین شدن و لیدها قفل می‌ماند.
                  اطلاعات زیر طبق قرارداد API مشاور ثبت می‌شود.
                </p>

                <form class="profile-form" (ngSubmit)="submitProfile()">
                  <label>
                    کد ملی
                    <input
                      [(ngModel)]="profileForm.nationalityCode"
                      name="nationalityCode"
                      inputmode="numeric"
                      maxlength="10"
                      placeholder="0012345678"
                    />
                  </label>
                  <label>
                    آدرس
                    <textarea [(ngModel)]="profileForm.address" name="consultantAddress" rows="4" placeholder="آدرس کامل محل سکونت"></textarea>
                  </label>
                  <button class="primary-action full" type="submit" [disabled]="profileSaving">
                    {{ profileSaving ? 'در حال ثبت...' : 'تکمیل پروفایل و ورود به داشبورد' }}
                  </button>
                </form>
              </section>
            } @else {
              <section class="status-card">
                <header class="panel-heading">
                  <div>
                    <span>پروفایل و وضعیت</span>
                    <h2>حضور و دریافت لید</h2>
                    <p>برای دریافت لیدهای لحظه‌ای، ابتدا حضور را ثبت و سپس وضعیت آنلاین را فعال کنید.</p>
                  </div>
                </header>

                <div class="status-summary">
                  <div>
                    <span>شناسه پروفایل</span>
                    <strong>{{ currentProfileId() }}</strong>
                  </div>
                  <div>
                    <span>حضور</span>
                    <strong [class.good]="isAvailable" [class.bad]="!isAvailable">{{ isAvailable ? 'حاضر' : 'ثبت نشده' }}</strong>
                  </div>
                  <div>
                    <span>وضعیت دریافت لید</span>
                    <strong [class.good]="isOnline" [class.bad]="!isOnline">{{ isOnline ? 'آنلاین' : 'آفلاین' }}</strong>
                  </div>
                </div>

                <div class="action-grid">
                  <button class="primary-action" type="button" [disabled]="availabilitySaving || isAvailable" (click)="setAvailability(true)">
                    <app-fa-icon name="check"></app-fa-icon>
                    ثبت حضور
                  </button>
                  <button class="secondary-action danger" type="button" [disabled]="availabilitySaving || !isAvailable || isOnline" (click)="setAvailability(false)">
                    <app-fa-icon name="moon"></app-fa-icon>
                    عدم حضور
                  </button>
                  <button class="primary-action" type="button" [disabled]="onlineSaving || !canGoOnline()" (click)="setOnlineStatus(true)">
                    <app-fa-icon name="mobile"></app-fa-icon>
                    آنلاین
                  </button>
                  <button class="secondary-action" type="button" [disabled]="onlineSaving || !isOnline" (click)="setOnlineStatus(false)">
                    <app-fa-icon name="close"></app-fa-icon>
                    آفلاین
                  </button>
                </div>

                @if (pendingOfflineCount > 0) {
                  <p class="queue-warning">
                    {{ pendingOfflineCount }} لید صف آفلاین تعیین‌تکلیف‌نشده دارید؛ تا ثبت گزارش آن‌ها امکان آنلاین شدن ندارید.
                  </p>
                }
              </section>
            }
          }

          @if (activeSection === 'leads') {
            @if (!isProfileReady()) {
              <section class="consultant-panel locked-panel">
                <span class="lock-icon"><app-fa-icon name="shield"></app-fa-icon></span>
                <div>
                  <h2>لیدها قفل هستند</h2>
                  <p>برای مشاهده و تعیین‌تکلیف لیدها ابتدا پروفایل مشاور را کامل کنید.</p>
                </div>
                <button class="primary-action compact" type="button" (click)="setSection('profile')">تکمیل پروفایل</button>
              </section>
            } @else {
              <section class="lead-panel">
                @if (dueConfirmations.length) {
                  <div class="queue-warning attendance-lock">
                    <strong>برای مشاهده لید لحظه‌ای ابتدا حضورهای موعددار را تعیین تکلیف کنید.</strong>
                    <div class="reservation-list">
                      @for (reservation of dueConfirmations; track reservationId(reservation)) {
                        <article>
                          <strong>{{ reservationPatientName(reservation) }}</strong>
                          <span>{{ reservationPatientPhone(reservation) }} - {{ reservationPatientCity(reservation) }}</span>
                          <time>{{ formatDateTime(reservationDateTime(reservation)) }}</time>
                          <div class="dialog-actions">
                            <button class="primary-action compact" type="button" [disabled]="attendanceSavingId === reservationId(reservation)" (click)="confirmAttendance(reservation, true)">بیمار آمد</button>
                            <button class="secondary-action compact danger" type="button" [disabled]="attendanceSavingId === reservationId(reservation)" (click)="confirmAttendance(reservation, false)">بیمار نیامد</button>
                          </div>
                        </article>
                      }
                    </div>
                  </div>
                }
                @if (!dueConfirmations.length && realtimeBlockedByOfflineQueue()) {
                  <p class="queue-warning">ابتدا لیدهای آفلاین خود را تعیین تکلیف کنید.</p>
                }
                <header class="panel-heading">
                  <div>
                    <span>لیدهای من</span>
                    <h2>تماس، گزارش و رزرو لیدها</h2>
                    <p>روی شماره هر لید بزنید تا صفحه تماس گوشی باز شود، سپس نتیجه تماس را ثبت کنید.</p>
                  </div>
                  <button class="secondary-action compact" type="button" [disabled]="leadsLoading" (click)="refreshDashboard()">
                    بروزرسانی
                  </button>
                </header>

                <form class="lead-filters" (ngSubmit)="applyLeadFilters()">
                  <label>
                    وضعیت
                    <select [(ngModel)]="leadStateFilter" name="consultantLeadState">
                      <option [ngValue]="null">همه</option>
                      <option [ngValue]="1">جدید</option>
                      <option [ngValue]="3">تماس گرفته شده</option>
                      <option [ngValue]="4">در انتظار تعیین تکلیف</option>
                      <option [ngValue]="7">رد شده</option>
                    </select>
                  </label>
                  <label>
                    نوع
                    <select [(ngModel)]="leadTypeFilter" name="consultantLeadType">
                      <option [ngValue]="null">همه</option>
                      <option [ngValue]="1">لحظه‌ای</option>
                      <option [ngValue]="2">صف آفلاین</option>
                    </select>
                  </label>
                  <button class="primary-action compact" type="submit" [disabled]="leadsLoading">
                    {{ leadsLoading ? 'در حال اعمال...' : 'اعمال' }}
                  </button>
                </form>

                @if (leadsLoading) {
                  <p class="loading-copy">در حال دریافت لیدها...</p>
                } @else if (!leads.length) {
                  <p class="empty-copy">فعلاً لیدی برای نمایش وجود ندارد.</p>
                } @else {
                  <div class="lead-list">
                    @for (lead of leads; track leadId(lead)) {
                      <article class="lead-card" [class.realtime]="leadType(lead) === 1" [class.expired]="isLeadExpired(lead)">
                        <header>
                          <div>
                            <span>{{ leadTypeLabel(leadType(lead)) }}</span>
                            <h3>{{ leadName(lead) }}</h3>
                          </div>
                          <b [class]="stateBadgeClass(leadState(lead))">{{ stateLabel(leadState(lead)) }}</b>
                        </header>

                        @if (isRealtimeTimedLead(lead)) {
                          <div class="timer-row" [class.danger]="leadRemainingMs(lead) <= 30000">
                            <span>مهلت تماس لحظه‌ای</span>
                            <strong>{{ realtimeCountdown(lead) }}</strong>
                          </div>
                        }

                        <div class="lead-actions">
                          <a
                            class="call-action"
                            [class.disabled]="isLeadPhoneDisabled(lead)"
                            [attr.href]="isLeadPhoneDisabled(lead) ? null : 'tel:' + leadPhone(lead)"
                            [attr.aria-label]="'تماس با ' + leadName(lead)"
                            (click)="handleCallClick($event, lead)"
                          >
                            <span class="call-icon"><app-fa-icon name="phone"></app-fa-icon></span>
                            <span>
                              <small>تماس با لید</small>
                              <b>{{ leadPhone(lead) }}</b>
                            </span>
                          </a>
                          <button class="secondary-action compact" type="button" [disabled]="isReportDisabled(lead)" (click)="openReportDialog(lead)">
                            ثبت گزارش
                          </button>
                        </div>
                      </article>
                    }
                  </div>

                  <nav class="pager" aria-label="صفحه بندی لیدهای مشاور">
                    <button type="button" [disabled]="leadPageNumber <= 1 || leadsLoading" (click)="changeLeadPage(leadPageNumber - 1)">قبلی</button>
                    <span>صفحه {{ leadPageNumber }} از {{ leadTotalPages }}</span>
                    <button type="button" [disabled]="leadPageNumber >= leadTotalPages || leadsLoading" (click)="changeLeadPage(leadPageNumber + 1)">بعدی</button>
                  </nav>
                }
              </section>
            }
          }

          @if (activeSection === 'reservations') {
            @if (!isProfileReady()) {
              <section class="consultant-panel locked-panel">
                <span class="lock-icon"><app-fa-icon name="shield"></app-fa-icon></span>
                <div>
                  <h2>رزروها قفل هستند</h2>
                  <p>رزروهای مشاور پس از تکمیل پروفایل و ثبت گزارش تماس‌های موفق نمایش داده می‌شوند.</p>
                </div>
                <button class="primary-action compact" type="button" (click)="setSection('profile')">تکمیل پروفایل</button>
              </section>
            } @else {
              <section class="reservation-panel">
                <header class="panel-heading">
                  <div>
                    <span>رزروها</span>
                    <h2>رزروهای آینده مشاور</h2>
                  </div>
                </header>

                @if (reservationsLoading) {
                  <p class="loading-copy">در حال دریافت رزروها...</p>
                } @else if (!reservations.length) {
                  <p class="empty-copy">رزرو فعالی برای نمایش وجود ندارد.</p>
                } @else {
                  <div class="reservation-list">
                    @for (reservation of reservations; track reservationId(reservation)) {
                      <article>
                        <strong>{{ reservationPatientName(reservation) }}</strong>
                        <span>{{ reservationPatientPhone(reservation) }} - {{ reservationPatientCity(reservation) }}</span>
                        <time>{{ formatDateTime(reservationDateTime(reservation)) }}</time>
                        <small>احتمال حضور: {{ reservationAttendanceProbability(reservation) }}٪</small>
                        <small>پیش‌بینی حضور: {{ reservationAttendancePrediction(reservation) }}</small>
                        <b [class]="reservationStatusClass(reservation)">{{ reservationAttendanceStatusLabel(reservation) }}</b>
                        @if (canCompletePatientProfile(reservation)) {
                          <button class="secondary-action compact" type="button" (click)="openPatientProfileFromReservation(reservation)">
                            تکمیل پرونده
                          </button>
                        }
                      </article>
                    }
                  </div>
                }
              </section>
            }
          }
        </section>
      </main>

      <app-base-dialog
        [open]="reportDialogOpen"
        [showFooter]="false"
        [title]="selectedLead ? 'ثبت گزارش برای ' + leadName(selectedLead) : 'ثبت گزارش تماس'"
        subtitle="بعد از تماس با لید، نتیجه و توضیحات را ثبت کنید."
        (closed)="closeReportDialog()"
      >
        <form class="dialog-form" (ngSubmit)="submitLeadReport()">
          <label>
            نتیجه تماس
            <select [(ngModel)]="reportForm.callResult" name="leadCallResult">
              <option [ngValue]="1">تماس برقرار شد</option>
              <option [ngValue]="2">تبدیل/موفق شد</option>
              <option [ngValue]="3">رد شد</option>
              <option [ngValue]="4">پاسخ نداد</option>
              <option [ngValue]="5">شماره اشتباه بود</option>
              <option [ngValue]="6">نیاز به پیگیری دارد</option>
            </select>
          </label>
          <label>
            توضیحات گزارش
            <textarea [(ngModel)]="reportForm.reportDescription" name="leadReportDescription" rows="4"></textarea>
          </label>
          <div class="dialog-actions">
            <button class="secondary-action" type="button" (click)="closeReportDialog()">انصراف</button>
            <button class="primary-action" type="submit" [disabled]="reportSaving">{{ reportSaving ? 'در حال ثبت...' : 'ثبت گزارش' }}</button>
          </div>
        </form>
      </app-base-dialog>

      <app-base-dialog
        [open]="reservationDialogOpen"
        [showFooter]="false"
        [title]="selectedReservationLead ? 'رزرو برای ' + leadName(selectedReservationLead) : 'ثبت رزرو'"
        subtitle="برای تماس‌های موفق، ثبت رزرو مرحله بعدی اجباری است."
        [closable]="!reservationRequired && !reservationSaving"
        (closed)="closeReservationDialog()"
      >
        <form class="dialog-form" (ngSubmit)="submitReservation()">
          <label>
            تاریخ رزرو
            <app-base-datepicker
              [label]="reservationDatePickerLabel"
              [selectedDate]="reservationForm.reservationDate ?? undefined"
              [minDate]="minimumReservationDate()"
              [allowToday]="true"
              (dateChange)="setReservationDate($event)"
            ></app-base-datepicker>
          </label>
          <label>
            ساعت رزرو
            <input [(ngModel)]="reservationForm.reservationTime" name="reservationTime" type="time" />
          </label>
          <div class="two-col">
            <label>
              شهر بیمار
              <input [(ngModel)]="reservationForm.patientCity" name="reservationPatientCity" maxlength="80" placeholder="تهران" />
            </label>
            <label>
              درصد احتمال حضور
              <input [(ngModel)]="reservationForm.attendanceProbabilityPercent" name="reservationAttendanceProbability" type="number" min="0" max="100" />
            </label>
          </div>
          <label>
            پیش‌بینی حضور
            <textarea [(ngModel)]="reservationForm.attendancePrediction" name="reservationAttendancePrediction" rows="3" placeholder="بیمار گفت روز و ساعت رزرو شده داخل مطب حاضر می‌شود."></textarea>
          </label>
          <label>
            توضیحات
            <textarea [(ngModel)]="reservationForm.description" name="reservationDescription" rows="3"></textarea>
          </label>
          <div class="dialog-actions">
            @if (!reservationRequired) {
              <button class="secondary-action" type="button" (click)="closeReservationDialog()">بعداً</button>
            } @else {
              <p class="required-step-note">ثبت رزرو بعد از تماس موفق الزامی است و این پنجره تا ثبت رزرو بسته نمی‌شود.</p>
            }
            <button class="primary-action" type="submit" [disabled]="reservationSaving">{{ reservationSaving ? 'در حال ثبت...' : 'ثبت رزرو' }}</button>
          </div>
        </form>
      </app-base-dialog>

      <app-base-dialog
        [open]="patientProfileDialogOpen"
        [showFooter]="false"
        size="wide"
        title="تشکیل پرونده بیمار"
        subtitle="برای تکمیل رزرو، اطلاعات ثبت‌نام و پرونده بیمار را وارد کنید."
        [closable]="!patientProfileRequired && !patientProfileSaving"
        (closed)="closePatientProfileDialog()"
      >
        <form class="dialog-form patient-profile-form" (ngSubmit)="submitPatientProfile()">
          <section class="form-section">
            <h3>اطلاعات کاربر بیمار</h3>
            <div class="two-col">
              <label>
                نام
                <input [(ngModel)]="patientProfileForm.firstName" name="patientFirstName" autocomplete="given-name" maxlength="100" />
              </label>
              <label>
                نام خانوادگی
                <input [(ngModel)]="patientProfileForm.lastName" name="patientLastName" autocomplete="family-name" maxlength="100" />
              </label>
            </div>

            <div class="two-col">
              <label>
                شماره موبایل
                <input
                  [(ngModel)]="patientProfileForm.phoneNumber"
                  name="patientPhoneNumber"
                  inputmode="tel"
                  autocomplete="tel"
                  readonly
                />
                <small class="field-note">شماره باید با شماره لید رزرو شده یکسان باشد.</small>
              </label>
              <label>
                رمز عبور
                <input
                  [(ngModel)]="patientProfileForm.password"
                  name="patientPassword"
                  type="password"
                  autocomplete="new-password"
                  minlength="6"
                  maxlength="100"
                />
              </label>
            </div>

            <label>
              جنسیت
              <select [(ngModel)]="patientProfileForm.gender" name="patientGender">
                <option [ngValue]="1">مرد</option>
                <option [ngValue]="2">زن</option>
              </select>
            </label>
          </section>

          <div class="dialog-actions">
            @if (!patientProfileRequired) {
              <button class="secondary-action" type="button" (click)="closePatientProfileDialog()">بعداً</button>
            } @else {
              <p class="required-step-note">تشکیل پرونده بیمار برای تکمیل رزرو الزامی است و این پنجره تا ثبت بیمار بسته نمی‌شود.</p>
            }
            <button class="primary-action" type="submit" [disabled]="patientProfileSaving">
              {{ patientProfileSaving ? 'در حال ثبت...' : 'ثبت پرونده' }}
            </button>
          </div>
        </form>
      </app-base-dialog>
    </section>
  `,
  styles: [`
    .dashboard-layout{display:grid;grid-template-columns:300px minmax(0,1fr);gap:18px;width:min(1180px,calc(100% - 36px));margin:0 auto;padding:36px 0 86px}
    .dashboard-sidebar,.dashboard-hero,.profile-lock-card,.status-card,.lead-panel,.reservation-panel,.consultant-panel{border:1px solid var(--line);background:color-mix(in srgb,var(--surface) 86%,transparent);box-shadow:var(--shadow)}
    .dashboard-sidebar{position:sticky;top:18px;display:grid;align-content:start;gap:18px;min-height:calc(100vh - 72px);padding:20px;border-radius:34px}
    .dashboard-brand{display:flex;align-items:center;gap:10px;color:var(--text);font-weight:950}
    .dashboard-user-card{display:grid;gap:12px;padding:18px;border:1px solid var(--line);border-radius:28px;background:linear-gradient(135deg,color-mix(in srgb,var(--brand) 12%,transparent),color-mix(in srgb,var(--surface-muted) 84%,transparent))}
    .avatar{display:grid;place-items:center;width:62px;height:62px;border-radius:24px;background:color-mix(in srgb,var(--brand) 18%,transparent);color:var(--brand);font-size:1.45rem}
    .dashboard-user-card small{display:block;color:var(--muted);font-weight:900}.dashboard-user-card h1{margin:4px 0;font-size:1.35rem}.dashboard-user-card b{color:var(--brand)}
    .dashboard-nav{display:grid;gap:10px}.dashboard-nav button{display:flex;align-items:center;gap:10px;width:100%;border:0;padding:12px 14px;border-radius:18px;background:var(--surface-muted);color:var(--muted);font:inherit;font-weight:900;text-align:start}.dashboard-nav button.active{color:var(--text);background:color-mix(in srgb,var(--brand) 16%,var(--surface-muted))}
    .logout-btn{width:100%;margin-top:auto}
    .dashboard-content{display:grid;align-content:start;gap:18px}.consultant-shell{display:grid;gap:18px}
    .dashboard-hero{padding:clamp(24px,4vw,42px);border-radius:36px;background:radial-gradient(circle at 10% 0,color-mix(in srgb,var(--brand-2) 24%,transparent),transparent 36%),linear-gradient(135deg,color-mix(in srgb,var(--surface) 88%,transparent),var(--cream))}
    .dashboard-hero span,.panel-heading span{display:inline-flex;margin-bottom:12px;padding:6px 14px;border-radius:999px;background:color-mix(in srgb,var(--brand) 18%,transparent);color:var(--brand);font-weight:950}.dashboard-hero h2{margin:0 0 10px;font-size:clamp(1.65rem,4vw,2.45rem)}.dashboard-hero p{max-width:720px;margin:0}
    .feedback{margin:0;padding:12px 14px;border-radius:20px;font-weight:950}.feedback.success{background:color-mix(in srgb,#22c55e 16%,var(--surface));color:#166534}.feedback.error{background:color-mix(in srgb,var(--danger) 12%,var(--surface));color:#991b1b}
    .consultant-overview{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.consultant-overview button{display:grid;gap:12px;text-align:start;border:1px solid var(--line);border-radius:30px;padding:22px;background:color-mix(in srgb,var(--surface) 86%,transparent);color:var(--text);box-shadow:0 18px 54px rgba(0,0,0,.18)}.consultant-overview span{display:grid;place-items:center;width:52px;height:52px;border-radius:20px;background:color-mix(in srgb,var(--brand) 16%,transparent);color:var(--brand);font-size:1.25rem}.consultant-overview strong{font-size:1.1rem}.consultant-overview small{color:var(--muted);font-weight:900;line-height:1.8}
    .profile-lock-card,.status-card,.lead-panel,.reservation-panel,.consultant-panel{display:grid;gap:16px;padding:18px;border-radius:30px}.lock-icon{display:grid;place-items:center;width:58px;height:58px;border-radius:22px;background:color-mix(in srgb,var(--brand) 16%,transparent);color:var(--brand);font-size:1.35rem}.profile-lock-card h2,.panel-heading h2,.locked-panel h2{margin:0;font-size:1.35rem}.profile-lock-card p,.panel-heading p,.locked-panel p{margin:0;color:var(--muted)}
    .locked-panel{grid-template-columns:auto minmax(0,1fr) auto;align-items:center}
    .profile-form,.dialog-form{display:grid;gap:14px}.patient-profile-form{gap:16px}.form-section{display:grid;gap:12px;padding:14px;border:1px solid var(--line);border-radius:22px;background:color-mix(in srgb,var(--surface-muted) 44%,transparent)}.form-section h3{margin:0;color:var(--text);font-size:1rem}.two-col{display:grid;grid-template-columns:1fr 1fr;gap:10px}label{display:grid;gap:8px;color:var(--muted);font-weight:950}.required-step-note{margin:0;padding:10px 12px;border-radius:16px;background:color-mix(in srgb,#f59e0b 16%,var(--surface));color:#92400e;font-weight:950;line-height:1.8}.field-note{color:var(--muted);font-weight:800;line-height:1.7}input[readonly]{opacity:.78;background:color-mix(in srgb,var(--surface-muted) 72%,transparent)}.primary-action,.secondary-action{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;border:0;border-radius:18px;padding:12px 16px;font:inherit;font-weight:950}.primary-action{background:linear-gradient(135deg,var(--brand),var(--brand-2));color:#1b1712}.secondary-action{border:1px solid var(--line);background:var(--surface-muted);color:var(--text)}.secondary-action.danger{background:color-mix(in srgb,var(--danger) 10%,var(--surface-muted));color:#991b1b}.primary-action:disabled,.secondary-action:disabled{cursor:not-allowed;opacity:.55}.full{width:100%}.compact{min-height:40px;border-radius:999px;padding:9px 13px;font-size:.86rem}
    .status-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.status-summary div{padding:14px;border:1px solid var(--line);border-radius:22px;background:color-mix(in srgb,var(--surface-muted) 70%,transparent)}.status-summary span{display:block;color:var(--muted);font-size:.82rem;font-weight:900}.status-summary strong{display:block;color:var(--text);font-size:1.05rem}.status-summary .good{color:#166534}.status-summary .bad{color:#991b1b}
    .action-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.queue-warning{margin:0;padding:12px 14px;border-radius:18px;background:color-mix(in srgb,#f59e0b 16%,var(--surface));color:#92400e;font-weight:950}
    .panel-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.lead-filters{display:grid;grid-template-columns:1fr 1fr auto;gap:10px;align-items:end}.loading-copy,.empty-copy{margin:0;padding:18px;border:1px dashed var(--line);border-radius:22px;color:var(--muted);text-align:center;font-weight:900}
    .lead-list{display:grid;gap:12px}.lead-card{display:grid;gap:12px;padding:14px;border:1px solid var(--line);border-radius:24px;background:color-mix(in srgb,var(--surface-muted) 56%,transparent)}.lead-card.realtime{border-color:color-mix(in srgb,var(--brand) 44%,var(--line))}.lead-card.expired{opacity:.72}.lead-card header{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.lead-card h3{margin:0;font-size:1.1rem}.lead-card header span{color:var(--brand);font-weight:950;font-size:.82rem}
    .badge{display:inline-flex;align-items:center;justify-content:center;min-height:30px;border-radius:999px;padding:5px 10px;font-size:.8rem;font-weight:950}.badge.info{background:color-mix(in srgb,var(--brand) 16%,transparent);color:var(--brand)}.badge.success{background:color-mix(in srgb,#22c55e 16%,var(--surface));color:#166534}.badge.warn{background:color-mix(in srgb,#f59e0b 16%,var(--surface));color:#92400e}.badge.danger{background:color-mix(in srgb,var(--danger) 12%,var(--surface));color:#991b1b}
    .timer-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border-radius:18px;background:color-mix(in srgb,var(--brand) 10%,transparent);color:var(--brand);font-weight:950}.timer-row.danger{background:color-mix(in srgb,var(--danger) 12%,var(--surface));color:#991b1b}.lead-actions{display:grid;grid-template-columns:1fr auto;gap:10px}.call-action{display:inline-flex;align-items:center;justify-content:flex-start;gap:10px;min-height:52px;border-radius:20px;padding:8px 12px;background:color-mix(in srgb,#22c55e 18%,var(--surface-muted));color:#bbf7d0;font-weight:950}.call-action small,.call-action b{display:block}.call-action small{color:color-mix(in srgb,#bbf7d0 78%,var(--muted));font-size:.76rem}.call-action b{direction:ltr;text-align:right;font-size:1rem}.call-icon{display:grid;place-items:center;flex:0 0 38px;width:38px;height:38px;border-radius:15px;background:color-mix(in srgb,#22c55e 22%,transparent);font-size:1.1rem}.call-action.disabled{pointer-events:none;opacity:.5}
    .pager{display:flex;align-items:center;justify-content:center;gap:10px}.pager button{border:1px solid var(--line);border-radius:999px;padding:9px 16px;background:var(--surface-muted);color:var(--text);font:inherit;font-weight:950}.pager button:disabled{opacity:.45;cursor:not-allowed}.pager span{color:var(--muted);font-weight:950}
    .reservation-list{display:grid;gap:10px}.reservation-list article{display:grid;gap:3px;padding:12px;border:1px solid var(--line);border-radius:20px;background:color-mix(in srgb,var(--surface-muted) 58%,transparent)}.reservation-list strong{color:var(--text)}.reservation-list span,.reservation-list time{color:var(--muted);font-weight:900}
    .dialog-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    @media (max-width:980px){.dashboard-layout{grid-template-columns:1fr;width:min(100% - 24px,760px);padding-top:14px}.dashboard-sidebar{position:relative;top:0;min-height:0}.consultant-overview{grid-template-columns:1fr}.lead-filters{grid-template-columns:1fr 1fr auto}.locked-panel{grid-template-columns:1fr}}
    @media (max-width:760px){
      .dashboard-layout.consultant-mode{width:100%;padding:0 10px 96px}.dashboard-layout.consultant-mode .dashboard-sidebar{position:fixed;z-index:80;inset-inline:10px;bottom:10px;top:auto;min-height:0;padding:8px;border-radius:28px}.consultant-mode .dashboard-brand,.consultant-mode .dashboard-user-card,.consultant-mode .logout-btn{display:none}.consultant-mode .dashboard-nav{grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}.consultant-mode .dashboard-nav button{display:grid;place-items:center;gap:3px;min-height:58px;padding:7px;border-radius:20px;text-align:center;font-size:.72rem}.consultant-mode .dashboard-nav app-fa-icon{font-size:1.1rem;color:var(--brand)}
      .dashboard-content{padding-top:10px}.dashboard-hero,.profile-lock-card,.status-card,.lead-panel,.reservation-panel,.consultant-panel{border-radius:24px;padding:14px}.status-summary,.action-grid,.lead-filters,.lead-actions,.two-col{grid-template-columns:1fr}.panel-heading{display:grid}.dialog-actions{grid-template-columns:1fr 1fr}
    }
    @media (max-width:560px){.form-section{padding:12px;border-radius:18px}.dialog-actions{grid-template-columns:1fr}}
  `]
})
export class ConsultantDashboardComponent implements OnInit, OnDestroy {
  readonly user = this.auth.user;
  activeSection: ConsultantDashboardSection = 'overview';

  readonly dashboardLinks: ConsultantDashboardLink[] = [
    { id: 'overview', label: 'نمای کلی', icon: 'dashboard' },
    { id: 'profile', label: 'پروفایل', icon: 'shield' },
    { id: 'leads', label: 'لیدها', icon: 'clipboard' },
    { id: 'reservations', label: 'رزروها', icon: 'calendar' }
  ];

  readonly displayName = computed(() => {
    const user = this.user();
    const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
    return name || 'مشاور';
  });
  readonly roleLabel = computed(() => {
    const user = this.user();
    return user ? this.auth.roleLabel(user.role, 'fa') : 'مشاور';
  });

  profileForm: ConsultantProfileForm = {
    nationalityCode: '',
    address: ''
  };
  profileSaving = false;
  profileId: number | null = null;

  isAvailable = false;
  isOnline = false;
  availabilitySaving = false;
  onlineSaving = false;
  pendingOfflineCount = 0;
  currentScore = 0;
  canGoOnlineFromStatus = false;
  dashboardStatusLoaded = false;
  onlineStatusBlockReason: string | null = null;

  leads: ConsultantLead[] = [];
  leadsLoading = false;
  leadStateFilter: number | null = null;
  leadTypeFilter: number | null = null;
  leadPageNumber = 1;
  leadPageSize = 10;
  leadTotalPages = 1;
  leadTotalCount = 0;

  reportDialogOpen = false;
  reportSaving = false;
  selectedLead: ConsultantLead | null = null;
  reportForm: LeadReportForm = {
    callResult: 1,
    reportDescription: ''
  };

  reservationDialogOpen = false;
  reservationSaving = false;
  reservationRequired = false;
  selectedReservationLead: ConsultantLead | null = null;
  reservationForm: ReservationForm = {
    reservationDate: null,
    reservationTime: '',
    patientCity: '',
    attendanceProbabilityPercent: 80,
    attendancePrediction: '',
    description: ''
  };
  reservations: ConsultantReservation[] = [];
  dueConfirmations: ConsultantReservation[] = [];
  attendanceSavingId: number | null = null;
  reservationsLoading = false;
  readonly reservationDatePickerLabel = { fa: 'تاریخ رزرو', en: 'Reservation date' };

  patientProfileDialogOpen = false;
  patientProfileSaving = false;
  patientProfileRequired = false;
  selectedPatientProfileReservation: ConsultantReservation | null = null;
  patientProfileForm: PatientProfileForm = this.emptyPatientProfileForm();

  feedbackMessage = '';
  feedbackType: 'success' | 'error' = 'success';

  private currentTime = Date.now();
  private timerId: ReturnType<typeof setInterval> | null = null;
  private pollId: ReturnType<typeof setInterval> | null = null;
  private readonly expiringLeadIds = new Set<number>();
  private readonly reportedLeadIds = new Set<number>();
  private readonly expirationRetryAfter = new Map<number, number>();
  private timerStarts: Record<string, number> = {};
  private notifiedRealtimeLeadIds = new Set<number>();
  private notifiedAssignedLeadIds = new Set<number>();
  private leadRequestId = 0;
  private pendingOfflineRequestId = 0;
  private reservationRequestId = 0;
  private dueConfirmationRequestId = 0;
  private visibleLeadLoadingRequestId = 0;
  private pendingOfflineLoadSubscription: Subscription | null = null;
  private leadLoadSubscription: Subscription | null = null;
  private reservationLoadSubscription: Subscription | null = null;
  private dueConfirmationLoadSubscription: Subscription | null = null;
  private dashboardStatusSubscription: Subscription | null = null;
  private destroyed = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private consultantApi: ConsultantDashboardService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  get visibleDashboardLinks(): ConsultantDashboardLink[] {
    return this.isProfileReady()
      ? this.dashboardLinks.filter(item => item.id !== 'profile' && item.id !== 'reservations')
      : this.dashboardLinks.filter(item => item.id !== 'reservations');
  }

  trackDashboardLink(_: number, item: ConsultantDashboardLink): ConsultantDashboardSection {
    return item.id;
  }

  ngOnInit(): void {
    this.profileId = this.currentProfileId();
    this.timerStarts = this.readJson<Record<string, number>>(this.timerStorageKey(), {});
    this.notifiedRealtimeLeadIds = new Set(this.readJson<number[]>(this.notificationStorageKey(), []));
    this.notifiedAssignedLeadIds = new Set(this.readJson<number[]>(this.assignmentNotificationStorageKey(), []));

    if (this.isProfileReady()) {
      this.refreshDashboard();
      this.startTimers();
    } else {
      this.activeSection = 'profile';
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    if (this.timerId) clearInterval(this.timerId);
    if (this.pollId) clearInterval(this.pollId);
    this.pendingOfflineLoadSubscription?.unsubscribe();
    this.leadLoadSubscription?.unsubscribe();
    this.reservationLoadSubscription?.unsubscribe();
    this.dueConfirmationLoadSubscription?.unsubscribe();
    this.dashboardStatusSubscription?.unsubscribe();
  }

  currentProfileId(): number | null {
    const user = this.user();
    return this.profileId ?? user?.consultantProfileId ?? user?.profileId ?? null;
  }

  isProfileReady(): boolean {
    const user = this.user();
    const profileId = this.currentProfileId();
    if (!profileId) return false;
    return user?.isCompleteProfile !== false;
  }

  canGoOnline(): boolean {
    if (!this.isAvailable || this.pendingOfflineCount > 0) return false;
    return this.dashboardStatusLoaded ? this.canGoOnlineFromStatus || !this.onlineStatusBlockReason : true;
  }

  setSection(section: ConsultantDashboardSection): void {
    if (section === 'reservations') {
      this.activeSection = 'overview';
      return;
    }

    if (section === 'profile' && this.isProfileReady()) {
      this.activeSection = 'overview';
      return;
    }

    this.activeSection = section;
  }

  submitProfile(): void {
    const validationError = this.validateProfileForm();
    if (validationError) {
      this.showFeedback(validationError, 'error');
      return;
    }

    this.profileSaving = true;
    this.clearFeedback();

    this.consultantApi.completeProfile({
      profileId: this.currentProfileId() ?? 0,
      nationalityCode: this.profileForm.nationalityCode.trim(),
      address: this.profileForm.address.trim(),
      isCompleteProfile: true
    }).pipe(finalize(() => {
      this.profileSaving = false;
      this.markViewDirty();
    })).subscribe({
      next: response => {
        const profileId = this.resolveProfileId(response.data) ?? this.currentProfileId() ?? 0;
        if (profileId > 0) {
          this.profileId = profileId;
          this.auth.updateConsultantProfile(profileId, true);
        }

        this.showFeedback(response.message || 'پروفایل مشاور کامل شد', 'success');
        this.activeSection = 'overview';
        this.refreshDashboard();
        this.startTimers();
      },
      error: error => this.showFeedback(this.errorMessage(error, 'تکمیل پروفایل انجام نشد'), 'error')
    });
  }

  setAvailability(isAvailable: boolean): void {
    const profileId = this.requireProfileId();
    if (!profileId) return;

    if (!isAvailable && this.isOnline) {
      this.showFeedback('برای ثبت عدم حضور، ابتدا وضعیت دریافت لید را آفلاین کنید', 'error');
      return;
    }

    this.availabilitySaving = true;
    this.clearFeedback();

    this.consultantApi.setAvailability({ profileId, isAvailable })
      .pipe(finalize(() => {
        this.availabilitySaving = false;
        this.markViewDirty();
      }))
      .subscribe({
        next: response => {
          const status = this.applyConsultantStatusFrom(response, response.data);
          if (status.isAvailable === null) this.isAvailable = isAvailable;
          if (!isAvailable && status.isOnline === null) this.isOnline = false;
          this.showFeedback(response.message || (isAvailable ? 'حضور شما ثبت شد' : 'عدم حضور شما ثبت شد'), 'success');
          this.requestNotificationPermission();
          this.refreshDashboard();
        },
        error: error => this.showFeedback(this.errorMessage(error, 'ثبت حضور انجام نشد'), 'error')
      });
  }

  setOnlineStatus(isOnline: boolean): void {
    const profileId = this.requireProfileId();
    if (!profileId) return;

    if (isOnline && !this.canGoOnline()) {
      const message = this.onlineStatusBlockReason
        || (this.pendingOfflineCount > 0
          ? 'ابتدا لیدهای آفلاین خود را تعیین تکلیف کنید'
          : 'ابتدا حضور خود را ثبت کنید');
      this.showFeedback(message, 'error');
      return;
    }

    this.onlineSaving = true;
    this.clearFeedback();

    this.consultantApi.setOnlineStatus({ profileId, isOnline, isOffline: !isOnline })
      .pipe(finalize(() => {
        this.onlineSaving = false;
        this.markViewDirty();
      }))
      .subscribe({
        next: response => {
          const status = this.applyConsultantStatusFrom(response, response.data);
          if (status.isOnline === null) this.isOnline = isOnline;
          if (isOnline && status.isAvailable === null) this.isAvailable = true;
          this.showFeedback(response.message || (isOnline ? 'شما آنلاین شدید' : 'شما آفلاین شدید'), 'success');
          this.requestNotificationPermission();
          this.refreshDashboard();
        },
        error: error => {
          this.showFeedback(this.errorMessage(error, 'تغییر وضعیت آنلاین انجام نشد'), 'error');
          this.loadPendingOfflineLeads();
        }
      });
  }

  refreshDashboard(): void {
    if (!this.isProfileReady()) return;
    this.loadDashboardStatus(() => {
      this.loadDueConfirmations();
      this.loadPendingOfflineLeads();
      this.loadLeads();
      this.loadReservations();
    });
  }

  applyLeadFilters(): void {
    this.leadPageNumber = 1;
    this.loadLeads();
  }

  changeLeadPage(page: number): void {
    this.leadPageNumber = Math.min(Math.max(1, page), Math.max(1, this.leadTotalPages));
    this.loadLeads();
  }

  openReportDialog(lead: ConsultantLead): void {
    if (this.isReportDisabled(lead)) return;
    this.forceOfflineForReport();
    this.selectedLead = lead;
    this.reportForm = {
      callResult: 1,
      reportDescription: ''
    };
    this.reportDialogOpen = true;
  }

  closeReportDialog(): void {
    this.reportDialogOpen = false;
    this.reportSaving = false;
    this.selectedLead = null;
  }

  submitLeadReport(): void {
    const profileId = this.requireProfileId();
    const lead = this.selectedLead;
    const leadAssignmentId = lead ? this.leadId(lead) : null;
    if (!profileId || !lead || !leadAssignmentId) return;

    this.reportSaving = true;
    this.clearFeedback();

    const payload: SubmitLeadCallReportRequest = {
      leadAssignmentId,
      consultantProfileId: profileId,
      callResult: Number(this.reportForm.callResult),
      reportDescription: this.normalizedReportDescription(Number(this.reportForm.callResult))
    };

    this.consultantApi.submitLeadCallReport(payload)
      .pipe(finalize(() => {
        this.reportSaving = false;
        this.markViewDirty();
      }))
      .subscribe({
        next: response => {
          const wasBlockingOfflineLead = this.leadType(lead) === LEAD_TYPE.OfflineQueue && this.leadState(lead) === LEAD_STATE.Pending;
          this.reportedLeadIds.add(leadAssignmentId);
          const status = this.applyConsultantStatusFrom(response, response.data);
          if (status.isOnline === null && typeof response.data?.isConsultantOnline === 'boolean') {
            this.isOnline = response.data.isConsultantOnline;
          }
          this.markLeadReported(leadAssignmentId, response.data?.leadAssignmentState ?? LEAD_STATE.Contacted);
          if (wasBlockingOfflineLead) this.updatePendingOfflineCount(Math.max(0, this.pendingOfflineCount - 1));
          const shouldOpenReservation = response.data?.shouldOpenReservationPage === true;
          this.closeReportDialog();
          this.showFeedback(response.message || 'گزارش تماس ثبت شد', 'success');
          if (shouldOpenReservation) {
            this.openReservationDialog(lead, true);
          } else {
            this.restoreOnlineAfterRequiredAction();
          }
          this.refreshDashboard();
        },
        error: error => this.showFeedback(this.errorMessage(error, 'ثبت گزارش تماس انجام نشد'), 'error')
      });
  }


  private normalizedReportDescription(callResult: number): string {
    return this.reportForm.reportDescription.trim() || CALL_RESULT_DEFAULT_DESCRIPTIONS[callResult] || 'گزارش تماس ثبت شد';
  }

  closeReservationDialog(): void {
    const wasRequired = this.reservationRequired;
    this.reservationDialogOpen = false;
    this.reservationSaving = false;
    this.reservationRequired = false;
    this.selectedReservationLead = null;

    if (wasRequired) {
      this.showFeedback('برای تماس موفق، ثبت رزرو مرحله بعدی الزامی است', 'error');
    }
  }

  setReservationDate(date: Date): void {
    this.reservationForm.reservationDate = date;
  }

  reservationId(reservation: ConsultantReservation): number | null {
    return this.numberOrNull(reservation.id ?? reservation.Id ?? reservation.reservationId ?? reservation.ReservationId ?? null);
  }

  reservationPatientName(reservation: ConsultantReservation): string {
    return reservation.patientName || reservation.PatientName || 'بدون نام';
  }

  reservationPatientPhone(reservation: ConsultantReservation): string {
    return reservation.patientPhoneNumber || reservation.PatientPhoneNumber || '-';
  }

  reservationDateTime(reservation: ConsultantReservation): string {
    return reservation.reservationAt || reservation.ReservationAt || '';
  }

  reservationPatientCity(reservation: ConsultantReservation): string {
    return reservation.patientCity || reservation.PatientCity || 'شهر ثبت نشده';
  }

  reservationAttendanceProbability(reservation: ConsultantReservation): number | string {
    return reservation.attendanceProbabilityPercent ?? reservation.AttendanceProbabilityPercent ?? '-';
  }

  reservationAttendancePrediction(reservation: ConsultantReservation): string {
    return reservation.attendancePrediction || reservation.AttendancePrediction || 'ثبت نشده';
  }

  reservationAttendanceStatusLabel(reservation: ConsultantReservation): string {
    switch (reservation.attendanceConfirmationStatus ?? reservation.AttendanceConfirmationStatus) {
      case 1: return 'منتظر تایید مشاور';
      case 2: return 'مشاور: بیمار آمد';
      case 3: return 'مشاور: بیمار نیامد';
      case 4: return 'تایید نهایی منشی';
      case 5: return 'رد شده توسط منشی';
      default: return 'نامشخص';
    }
  }

  reservationStatusClass(reservation: ConsultantReservation): string {
    const status = reservation.attendanceConfirmationStatus ?? reservation.AttendanceConfirmationStatus;
    if (status === 4) return 'badge success';
    if (status === 5) return 'badge danger';
    if (status === 2 || status === 3) return 'badge warn';
    return 'badge info';
  }

  realtimeBlockedByOfflineQueue(): boolean {
    return this.pendingOfflineCount > 0 && this.leadTypeFilter === LEAD_TYPE.RealTime;
  }

  confirmAttendance(reservation: ConsultantReservation, patientAttended: boolean): void {
    const profileId = this.requireProfileId();
    const reservationId = this.reservationId(reservation);
    if (!profileId || !reservationId) return;

    const payload: ConfirmAttendanceRequest = {
      reservationId,
      consultantProfileId: profileId,
      patientAttended,
      note: patientAttended ? 'بیمار در مطب حاضر شد.' : 'بیمار در زمان رزرو حاضر نشد.'
    };

    this.attendanceSavingId = reservationId;
    this.consultantApi.confirmAttendance(payload).pipe(finalize(() => {
      this.attendanceSavingId = null;
      this.markViewDirty();
    })).subscribe({
      next: response => {
        this.showFeedback(response.message || 'وضعیت حضور بیمار ثبت شد و منتظر بررسی منشی است', 'success');
        this.loadDueConfirmations();
        this.loadLeads();
      },
      error: error => this.showFeedback(this.errorMessage(error, 'ثبت تایید حضور انجام نشد'), 'error')
    });
  }

  canCompletePatientProfile(reservation: ConsultantReservation): boolean {
    return (reservation.requiresPatientProfile ?? reservation.RequiresPatientProfile) === true
      && !(reservation.patientUserId ?? reservation.PatientUserId)
      && (reservation.isCanceled ?? reservation.IsCanceled) !== true
      && Boolean(this.reservationId(reservation));
  }

  openPatientProfileFromReservation(reservation: ConsultantReservation): void {
    if (!this.canCompletePatientProfile(reservation)) return;
    this.openPatientProfileDialog(reservation);
  }

  submitReservation(): void {
    const profileId = this.requireProfileId();
    const lead = this.selectedReservationLead;
    const leadAssignmentId = lead ? this.leadId(lead) : null;
    if (!profileId || !leadAssignmentId) return;

    const reservationAt = this.selectedReservationDateTime();
    if (!reservationAt || !Number.isFinite(reservationAt.getTime()) || reservationAt.getTime() <= Date.now()) {
      this.showFeedback('زمان رزرو باید در آینده باشد', 'error');
      return;
    }

    const patientCity = this.reservationForm.patientCity.trim();
    const attendancePrediction = this.reservationForm.attendancePrediction.trim();
    const attendanceProbabilityPercent = Number(this.reservationForm.attendanceProbabilityPercent);
    if (!patientCity) { this.showFeedback('شهر بیمار اجباری است', 'error'); return; }
    if (!attendancePrediction) { this.showFeedback('پیش‌بینی حضور بیمار اجباری است', 'error'); return; }
    if (!Number.isFinite(attendanceProbabilityPercent) || attendanceProbabilityPercent < 0 || attendanceProbabilityPercent > 100) {
      this.showFeedback('درصد احتمال حضور باید بین ۰ تا ۱۰۰ باشد', 'error'); return;
    }

    const payload: CreateReservationRequest = {
      leadAssignmentId,
      consultantProfileId: profileId,
      reservationAt: reservationAt.toISOString(),
      patientCity,
      attendanceProbabilityPercent,
      attendancePrediction,
      description: this.reservationForm.description.trim() || null
    };

    this.reservationSaving = true;
    this.clearFeedback();

    this.consultantApi.createReservation(payload)
      .pipe(finalize(() => {
        this.reservationSaving = false;
        this.markViewDirty();
      }))
      .subscribe({
        next: response => {
          const reservation = this.extractReservation(response.data) ?? this.extractReservation(response);
          this.reservationRequired = false;
          this.reservationDialogOpen = false;
          this.selectedReservationLead = null;
          const requiresPatientProfile = Boolean(reservation && this.canCompletePatientProfile(reservation));
          this.showFeedback(response.message || 'رزرو با موفقیت ثبت شد', 'success');
          this.loadReservations();

          if (requiresPatientProfile && reservation) {
            this.openPatientProfileDialog(reservation);
          } else {
            this.restoreOnlineAfterRequiredAction();
          }
        },
        error: error => this.showFeedback(this.errorMessage(error, 'ثبت رزرو انجام نشد'), 'error')
      });
  }

  closePatientProfileDialog(): void {
    const wasRequired = this.patientProfileRequired;
    this.resetPatientProfileState();

    if (wasRequired) {
      this.showFeedback('برای تکمیل رزرو، تشکیل پرونده بیمار الزامی است', 'error');
    }
  }

  submitPatientProfile(): void {
    const reservation = this.selectedPatientProfileReservation;
    const reservationId = reservation ? this.reservationId(reservation) : null;
    if (!reservation || !reservationId) {
      this.showFeedback('شناسه رزرو برای تشکیل پرونده یافت نشد', 'error');
      return;
    }

    const validationError = this.validatePatientProfileForm();
    if (validationError) {
      this.showFeedback(validationError, 'error');
      return;
    }

    const payload = this.buildPatientRegistrationRequest(reservationId);

    this.patientProfileSaving = true;
    this.clearFeedback();

    this.auth.register(payload)
      .pipe(finalize(() => {
        this.patientProfileSaving = false;
        this.markViewDirty();
      }))
      .subscribe({
        next: response => {
          this.resetPatientProfileState();
          this.showFeedback(response.message || 'ثبت‌نام بیمار و تشکیل پرونده رزرو با موفقیت انجام شد', 'success');
          this.restoreOnlineAfterRequiredAction();
          this.loadReservations();
        },
        error: error => this.showFeedback(this.errorMessage(error, 'تشکیل پرونده بیمار انجام نشد'), 'error')
      });
  }

  handleCallClick(event: MouseEvent, lead: ConsultantLead): void {
    if (this.isLeadPhoneDisabled(lead) || this.leadPhone(lead) === '-') {
      event.preventDefault();
      this.showFeedback('شماره این لید در حال حاضر فعال نیست', 'error');
    }
  }

  leadId(lead: ConsultantLead): number | null {
    const value = lead.id ?? lead.Id ?? lead.leadAssignmentId ?? lead.LeadAssignmentId;
    const numeric = this.numberOrNull(value);
    return numeric && numeric > 0 ? numeric : null;
  }

  leadName(lead: ConsultantLead): string {
    return lead.userName
      || lead.UserName
      || lead.fullName
      || lead.FullName
      || [lead.firstName, lead.lastName].filter(Boolean).join(' ').trim()
      || [lead.FirstName, lead.LastName].filter(Boolean).join(' ').trim()
      || lead.user?.userName
      || lead.user?.UserName
      || lead.user?.fullName
      || lead.user?.FullName
      || lead.user?.name
      || lead.user?.Name
      || [lead.user?.firstName, lead.user?.lastName].filter(Boolean).join(' ').trim()
      || [lead.user?.FirstName, lead.user?.LastName].filter(Boolean).join(' ').trim()
      || lead.User?.userName
      || lead.User?.UserName
      || lead.User?.fullName
      || lead.User?.FullName
      || lead.User?.name
      || lead.User?.Name
      || [lead.User?.firstName, lead.User?.lastName].filter(Boolean).join(' ').trim()
      || [lead.User?.FirstName, lead.User?.LastName].filter(Boolean).join(' ').trim()
      || lead.lead?.fullName
      || lead.lead?.FullName
      || lead.lead?.name
      || lead.lead?.Name
      || [lead.lead?.firstName, lead.lead?.lastName].filter(Boolean).join(' ').trim()
      || [lead.lead?.FirstName, lead.lead?.LastName].filter(Boolean).join(' ').trim()
      || lead.Lead?.fullName
      || lead.Lead?.FullName
      || lead.Lead?.name
      || lead.Lead?.Name
      || [lead.Lead?.firstName, lead.Lead?.lastName].filter(Boolean).join(' ').trim()
      || [lead.Lead?.FirstName, lead.Lead?.LastName].filter(Boolean).join(' ').trim()
      || 'بدون نام';
  }

  leadPhone(lead: ConsultantLead): string {
    return lead.phoneNumber
      || lead.PhoneNumber
      || lead.mobile
      || lead.Mobile
      || lead.userPhoneNumber
      || lead.UserPhoneNumber
      || lead.leadPhoneNumber
      || lead.LeadPhoneNumber
      || lead.user?.phoneNumber
      || lead.user?.PhoneNumber
      || lead.user?.mobile
      || lead.user?.Mobile
      || lead.User?.phoneNumber
      || lead.User?.PhoneNumber
      || lead.User?.mobile
      || lead.User?.Mobile
      || lead.lead?.phoneNumber
      || lead.lead?.PhoneNumber
      || lead.lead?.mobile
      || lead.lead?.Mobile
      || lead.Lead?.phoneNumber
      || lead.Lead?.PhoneNumber
      || lead.Lead?.mobile
      || lead.Lead?.Mobile
      || '-';
  }

  leadState(lead: ConsultantLead): number | null {
    return this.numberOrNull(lead.leadAssignmentState ?? lead.LeadAssignmentState ?? lead.state ?? lead.State ?? lead.status ?? lead.Status ?? null);
  }

  leadType(lead: ConsultantLead): number | null {
    return this.numberOrNull(lead.leadAssignmentType ?? lead.LeadAssignmentType ?? lead.assignmentType ?? lead.AssignmentType ?? lead.type ?? lead.Type ?? null);
  }

  stateLabel(value: number | null): string {
    const labels: Record<number, string> = {
      1: 'جدید',
      2: 'تخصیص داده شده',
      3: 'تماس گرفته شده',
      4: 'در انتظار تعیین تکلیف',
      5: 'تبدیل شده',
      6: 'منقضی شده',
      7: 'رد شده'
    };

    return value === null ? 'نامشخص' : labels[value] ?? 'نامشخص';
  }

  leadTypeLabel(value: number | null): string {
    if (value === LEAD_TYPE.OfflineQueue) return 'صف آفلاین';
    if (value === LEAD_TYPE.RealTime) return 'لحظه‌ای';
    return 'نامشخص';
  }

  stateBadgeClass(value: number | null): string {
    if (value === LEAD_STATE.New || value === LEAD_STATE.Assigned) return 'badge info';
    if (value === LEAD_STATE.Contacted || value === LEAD_STATE.Converted) return 'badge success';
    if (value === LEAD_STATE.Pending || value === LEAD_STATE.Expired) return 'badge warn';
    return 'badge danger';
  }

  isRealtimeTimedLead(lead: ConsultantLead): boolean {
    const leadAssignmentId = this.leadId(lead);
    if ((leadAssignmentId && this.reportedLeadIds.has(leadAssignmentId)) || Boolean(lead.isReportSubmitted ?? lead.IsReportSubmitted)) return false;
    if (this.leadType(lead) !== LEAD_TYPE.RealTime) return false;
    return (lead.requiresThreeMinuteCall ?? lead.RequiresThreeMinuteCall ?? true) === true;
  }

  leadRemainingMs(lead: ConsultantLead): number {
    if (!this.isRealtimeTimedLead(lead)) return 0;
    return Math.max(0, this.leadDeadlineMs(lead) - this.currentTime);
  }

  realtimeCountdown(lead: ConsultantLead): string {
    if (this.isLeadExpired(lead)) return 'منقضی';
    const totalSeconds = Math.ceil(this.leadRemainingMs(lead) / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  isLeadExpired(lead: ConsultantLead): boolean {
    return this.leadState(lead) === LEAD_STATE.Expired || (this.isRealtimeTimedLead(lead) && this.leadRemainingMs(lead) <= 0);
  }

  isLeadPhoneDisabled(lead: ConsultantLead): boolean {
    return this.isLeadExpired(lead) || this.leadPhone(lead) === '-' || this.expiringLeadIds.has(this.leadId(lead) ?? -1);
  }

  isReportDisabled(lead: ConsultantLead): boolean {
    const state = this.leadState(lead);
    const leadAssignmentId = this.leadId(lead);
    return !leadAssignmentId
      || this.isLeadExpired(lead)
      || this.reportedLeadIds.has(leadAssignmentId)
      || Boolean(lead.isReportSubmitted ?? lead.IsReportSubmitted)
      || state === LEAD_STATE.Contacted
      || state === LEAD_STATE.Converted
      || state === LEAD_STATE.Rejected;
  }

  minReservationDateTime(): string {
    return this.toDateTimeLocalValue(this.minimumReservationDateTime());
  }

  minimumReservationDate(): Date {
    const date = this.minimumReservationDateTime();
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  formatDateTime(value: string): string {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return value;
    return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }

  private loadDashboardStatus(afterLoad?: () => void): void {
    const profileId = this.currentProfileId();
    if (!profileId) return;

    this.dashboardStatusSubscription?.unsubscribe();
    this.dashboardStatusSubscription = this.consultantApi.getDashboardStatus(profileId)
      .pipe(finalize(() => this.markViewDirty()))
      .subscribe({
        next: status => {
          this.applyDashboardStatus(status);
          afterLoad?.();
        },
        error: error => {
          this.showFeedback(this.errorMessage(error, 'دریافت وضعیت داشبورد انجام نشد'), 'error');
          afterLoad?.();
        }
      });
  }

  private applyDashboardStatus(status: ConsultantDashboardStatus): void {
    this.profileId = status.profileId || this.profileId;
    this.isAvailable = status.isAvailable;
    this.isOnline = status.isOnline;
    this.updatePendingOfflineCount(status.pendingOfflineLeadCount);
    this.currentScore = status.currentScore;
    this.canGoOnlineFromStatus = status.canGoOnline;
    this.dashboardStatusLoaded = true;
    this.onlineStatusBlockReason = status.onlineStatusBlockReason;
    this.applyConsultantStatusFrom(status.raw);
  }

  private loadPendingOfflineLeads(): void {
    const profileId = this.currentProfileId();
    if (!profileId) return;

    const requestId = ++this.pendingOfflineRequestId;
    this.pendingOfflineLoadSubscription?.unsubscribe();

    this.pendingOfflineLoadSubscription = this.consultantApi.getLeads({
      profileId,
      leadAssignmentState: LEAD_STATE.Pending,
      leadAssignmentType: LEAD_TYPE.OfflineQueue,
      pageNumber: 1,
      pageSize: 50
    }).pipe(finalize(() => this.markViewDirty())).subscribe({
      next: response => {
        if (requestId !== this.pendingOfflineRequestId) return;
        this.applyConsultantStatusFrom(response.source, response.raw);
        this.updatePendingOfflineCount(response.totalCount ?? response.items.length);
      },
      error: () => {
        if (requestId === this.pendingOfflineRequestId) this.updatePendingOfflineCount(0);
      }
    });
  }


  private loadDueConfirmations(): void {
    const profileId = this.currentProfileId();
    if (!profileId) return;

    const requestId = ++this.dueConfirmationRequestId;
    this.dueConfirmationLoadSubscription?.unsubscribe();
    this.dueConfirmationLoadSubscription = this.consultantApi.getDueConfirmations(profileId)
      .pipe(finalize(() => this.markViewDirty()))
      .subscribe({
        next: items => {
          if (requestId === this.dueConfirmationRequestId) this.dueConfirmations = items ?? [];
        },
        error: () => {
          if (requestId === this.dueConfirmationRequestId) this.dueConfirmations = [];
        }
      });
  }

  private loadLeads(quiet = false): void {
    const profileId = this.currentProfileId();
    if (!profileId) return;
    if (quiet && this.leadLoadSubscription && !this.leadLoadSubscription.closed) return;

    const requestId = ++this.leadRequestId;
    this.leadLoadSubscription?.unsubscribe();

    if (!quiet) {
      this.visibleLeadLoadingRequestId = requestId;
      this.leadsLoading = true;
    }
    if (!quiet) this.clearFeedback();

    this.leadLoadSubscription = this.consultantApi.getLeads({
      profileId,
      leadAssignmentState: this.leadStateFilter,
      leadAssignmentType: this.leadTypeFilter,
      pageNumber: this.leadPageNumber,
      pageSize: this.leadPageSize
    }).pipe(finalize(() => {
      if (!quiet && requestId === this.visibleLeadLoadingRequestId) this.leadsLoading = false;
      this.markViewDirty();
    })).subscribe({
      next: response => {
        if (requestId !== this.leadRequestId) return;
        this.applyConsultantStatusFrom(response.source, response.raw);
        this.leads = response.items ?? [];
        this.leadTotalCount = response.totalCount ?? this.leads.length;
        this.leadPageSize = response.pageSize || this.leadPageSize;
        this.leadTotalPages = Math.max(1, response.totalPages || Math.ceil(this.leadTotalCount / this.leadPageSize));
        const normalizedPageNumber = Math.min(Math.max(1, response.pageNumber || this.leadPageNumber), this.leadTotalPages);
        if (!quiet && this.leadPageNumber !== normalizedPageNumber) {
          this.leadPageNumber = normalizedPageNumber;
          if (!this.leads.length && this.leadTotalCount > 0) {
            this.loadLeads();
            return;
          }
        } else {
          this.leadPageNumber = normalizedPageNumber;
        }
        this.hydrateRealtimeTimers();
        this.notifyNewRealtimeLeads();
        this.notifyNewAssignedLeads();
        this.expireDueRealtimeLeads();
      },
      error: error => {
        if (requestId !== this.leadRequestId) return;
        if (!quiet) this.showFeedback(this.errorMessage(error, 'دریافت لیدها انجام نشد'), 'error');
      }
    });
  }

  private loadReservations(): void {
    const profileId = this.currentProfileId();
    if (!profileId) return;

    const requestId = ++this.reservationRequestId;
    this.reservationLoadSubscription?.unsubscribe();
    this.reservationsLoading = true;

    this.reservationLoadSubscription = this.consultantApi.getReservations({
      consultantProfileId: profileId,
      from: this.startOfTodayIso(),
      to: this.endOfTodayIso(),
      includeCanceled: false,
      pageNumber: 1,
      pageSize: 5
    }).pipe(finalize(() => {
      if (requestId === this.reservationRequestId) this.reservationsLoading = false;
      this.markViewDirty();
    })).subscribe({
      next: response => {
        if (requestId !== this.reservationRequestId) return;
        this.applyConsultantStatusFrom(response.source, response.raw);
        this.reservations = response.items ?? [];
      },
      error: () => {
        if (requestId === this.reservationRequestId) this.reservations = [];
      }
    });
  }

  private startOfTodayIso(): string {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
  }

  private endOfTodayIso(): string {
    const date = new Date();
    date.setHours(23, 59, 59, 999);
    return date.toISOString();
  }

  private startTimers(): void {
    this.ngZone.runOutsideAngular(() => {
      if (!this.timerId) {
        this.timerId = setInterval(() => {
          this.ngZone.run(() => {
            if (!this.hasActiveRealtimeTimers()) return;
            this.currentTime = Date.now();
            this.expireDueRealtimeLeads();
            this.markViewDirty();
          });
        }, 1000);
      }

      if (!this.pollId) {
        this.pollId = setInterval(() => {
          if (this.isProfileReady()) {
            this.loadLeads(true);
            this.loadPendingOfflineLeads();
          }
        }, 30000);
      }
    });
  }


  private hasActiveRealtimeTimers(): boolean {
    return this.leads.some(lead => this.isRealtimeTimedLead(lead) && !this.isLeadExpired(lead));
  }

  private hydrateRealtimeTimers(): void {
    let changed = false;

    this.leads.forEach(lead => {
      if (!this.isRealtimeTimedLead(lead)) return;
      const leadAssignmentId = this.leadId(lead);
      if (!leadAssignmentId) return;
      const key = String(leadAssignmentId);
      if (!this.timerStarts[key]) {
        this.timerStarts[key] = Date.now();
        changed = true;
      }
    });

    if (changed) this.writeJson(this.timerStorageKey(), this.timerStarts);
  }

  private notifyNewRealtimeLeads(): void {
    let changed = false;

    this.leads.forEach(lead => {
      const leadAssignmentId = this.leadId(lead);
      if (!leadAssignmentId || !this.isRealtimeTimedLead(lead) || this.notifiedRealtimeLeadIds.has(leadAssignmentId) || this.isLeadExpired(lead)) {
        return;
      }

      this.notifiedRealtimeLeadIds.add(leadAssignmentId);
      changed = true;
      this.showRealtimeLeadNotification(lead);
    });

    if (changed) this.writeJson(this.notificationStorageKey(), [...this.notifiedRealtimeLeadIds]);
  }

  private showRealtimeLeadNotification(lead: ConsultantLead): void {
    this.showLeadNotification('لید لحظه‌ای جدید', `${this.leadName(lead)} - ${this.leadPhone(lead)}؛ مهلت تماس ۳ دقیقه است.`);
  }

  private notifyNewAssignedLeads(): void {
    let changed = false;

    this.leads.forEach(lead => {
      const leadAssignmentId = this.leadId(lead);
      if (!leadAssignmentId || this.notifiedAssignedLeadIds.has(leadAssignmentId) || this.isLeadExpired(lead)) return;
      const state = this.leadState(lead);
      if (![LEAD_STATE.Assigned, LEAD_STATE.Pending, LEAD_STATE.New].includes(state as 1 | 2 | 4)) return;
      if (this.isRealtimeTimedLead(lead)) return;

      this.notifiedAssignedLeadIds.add(leadAssignmentId);
      changed = true;
      const typeLabel = this.leadType(lead) === LEAD_TYPE.OfflineQueue ? 'صف آفلاین' : 'تخصیص جدید';
      this.showLeadNotification('لید جدید برای شما assign شد', `${this.leadName(lead)} - ${this.leadPhone(lead)}؛ ${typeLabel}`);
    });

    if (changed) this.writeJson(this.assignmentNotificationStorageKey(), [...this.notifiedAssignedLeadIds]);
  }

  private showLeadNotification(title: string, body: string): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    } else {
      this.showFeedback(body, 'success');
    }

    const navigatorWithVibration = navigator as Navigator & { vibrate?: (pattern: number | number[]) => boolean };
    navigatorWithVibration.vibrate?.([200, 100, 200]);
  }

  private requestNotificationPermission(): void {
    if (!('Notification' in window) || Notification.permission !== 'default') return;
    Notification.requestPermission().catch(() => undefined);
  }

  private expireDueRealtimeLeads(): void {
    this.leads.forEach(lead => {
      const leadAssignmentId = this.leadId(lead);
      if (!leadAssignmentId || !this.shouldExpireLead(lead)) return;
      this.expireLead(leadAssignmentId);
    });
  }

  private shouldExpireLead(lead: ConsultantLead): boolean {
    const leadAssignmentId = this.leadId(lead);
    if (!leadAssignmentId || !this.isRealtimeTimedLead(lead)) return false;
    if (this.reportedLeadIds.has(leadAssignmentId) || this.expiringLeadIds.has(leadAssignmentId)) return false;
    if (this.currentTime < (this.expirationRetryAfter.get(leadAssignmentId) ?? 0)) return false;
    if (Boolean(lead.isReportSubmitted ?? lead.IsReportSubmitted)) return false;

    const state = this.leadState(lead);
    if ([LEAD_STATE.Contacted, LEAD_STATE.Converted, LEAD_STATE.Expired, LEAD_STATE.Rejected].includes(state as 3 | 5 | 6 | 7)) {
      return false;
    }

    return this.leadRemainingMs(lead) <= 0;
  }

  private expireLead(leadAssignmentId: number): void {
    const profileId = this.currentProfileId();
    if (!profileId) return;

    this.expiringLeadIds.add(leadAssignmentId);

    this.consultantApi.expireLeadNoCall({ leadAssignmentId, consultantProfileId: profileId }).pipe(finalize(() => {
      this.expiringLeadIds.delete(leadAssignmentId);
      this.markViewDirty();
    })).subscribe({
      next: response => {
        const status = this.applyConsultantStatusFrom(response, response.data);
        if (status.isOnline === null && typeof response.data?.isConsultantOnline === 'boolean') {
          this.isOnline = response.data.isConsultantOnline;
        }
        this.leads = this.leads.map(lead => this.leadId(lead) === leadAssignmentId ? { ...lead, leadAssignmentState: LEAD_STATE.Expired } : lead);
        this.showFeedback(response.message || 'لید منقضی شد و امتیاز مشاور کسر شد', 'error');
        this.loadPendingOfflineLeads();
        this.loadLeads(true);
      },
      error: error => {
        this.expirationRetryAfter.set(leadAssignmentId, Date.now() + 30000);
        this.showFeedback(this.errorMessage(error, 'منقضی کردن لید انجام نشد'), 'error');
        this.loadLeads(true);
      },
    });
  }

  private openReservationDialog(lead: ConsultantLead, required: boolean): void {
    const minimumReservationAt = this.minimumReservationDateTime();
    this.selectedReservationLead = lead;
    this.reservationRequired = required;
    this.reservationForm = {
      reservationDate: minimumReservationAt,
      reservationTime: this.toTimeValue(minimumReservationAt),
      patientCity: '',
      attendanceProbabilityPercent: 80,
      attendancePrediction: '',
      description: 'رزرو اولیه پس از تماس موفق'
    };
    this.reservationDialogOpen = true;
  }

  private openPatientProfileDialog(reservation: ConsultantReservation): void {
    const names = this.splitReservationPatientName(this.reservationPatientName(reservation));
    const phoneNumber = this.reservationPatientPhone(reservation);

    this.selectedPatientProfileReservation = reservation;
    this.patientProfileRequired = true;
    this.patientProfileForm = {
      ...this.emptyPatientProfileForm(),
      firstName: names.firstName,
      lastName: names.lastName,
      phoneNumber: phoneNumber === '-' ? '' : phoneNumber
    };
    this.patientProfileDialogOpen = true;
  }


  private extractReservation(source: unknown): ConsultantReservation | null {
    if (!this.isRecord(source)) return null;

    if (this.reservationId(source as ConsultantReservation)) return source as ConsultantReservation;

    for (const key of ['reservation', 'Reservation', 'data', 'Data', 'result', 'Result', 'value', 'Value', 'payload', 'Payload']) {
      const nested = this.readValue(source, key);
      const reservation = this.extractReservation(nested);
      if (reservation) return reservation;
    }

    return null;
  }

  private resetPatientProfileState(): void {
    this.patientProfileDialogOpen = false;
    this.patientProfileSaving = false;
    this.patientProfileRequired = false;
    this.selectedPatientProfileReservation = null;
    this.patientProfileForm = this.emptyPatientProfileForm();
  }

  private markLeadReported(leadAssignmentId: number, nextState: number): void {
    this.leads = this.leads.map(lead => {
      if (this.leadId(lead) !== leadAssignmentId) return lead;

      return {
        ...lead,
        isReportSubmitted: true,
        IsReportSubmitted: true,
        leadAssignmentState: nextState,
        LeadAssignmentState: nextState,
        state: nextState
      };
    });
  }

  private updatePendingOfflineCount(count: number): void {
    this.pendingOfflineCount = Math.max(0, count);

    if (this.pendingOfflineCount === 0) {
      this.onlineStatusBlockReason = null;
      this.canGoOnlineFromStatus = this.isAvailable;
      return;
    }

    this.canGoOnlineFromStatus = false;
  }

  private selectedReservationDateTime(): Date | null {
    const date = this.reservationForm.reservationDate;
    const time = this.reservationForm.reservationTime;
    if (!date || !time) return null;

    const [hours, minutes] = time.split(':').map(Number);
    if (!Number.isInteger(hours) || !Number.isInteger(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return null;
    }

    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes);
  }

  private minimumReservationDateTime(): Date {
    const date = new Date(Date.now() + 5 * 60 * 1000);
    date.setSeconds(0, 0);
    return date;
  }

  private toTimeValue(date: Date): string {
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  private leadDeadlineMs(lead: ConsultantLead): number {
    const deadline = lead.callDeadlineAt ?? lead.CallDeadlineAt;
    if (deadline) {
      const parsedDeadline = new Date(deadline).getTime();
      if (Number.isFinite(parsedDeadline)) return parsedDeadline;
    }

    const leadAssignmentId = this.leadId(lead);
    const startedAt = leadAssignmentId ? this.timerStarts[String(leadAssignmentId)] ?? Date.now() : Date.now();
    return startedAt + THREE_MINUTES_MS;
  }

  private forceOfflineForReport(): void {
    const profileId = this.currentProfileId();
    if (!profileId || !this.isOnline) return;

    this.onlineSaving = true;
    this.isOnline = false;
    this.consultantApi.setOnlineStatus({ profileId, isOnline: false, isOffline: true })
      .pipe(finalize(() => {
        this.onlineSaving = false;
        this.markViewDirty();
      }))
      .subscribe({
        next: response => {
          const status = this.applyConsultantStatusFrom(response, response.data);
          if (status.isOnline === null) this.isOnline = false;
        },
        error: () => {
          this.isOnline = false;
        }
      });
  }

  private restoreOnlineAfterRequiredAction(): void {
    const profileId = this.currentProfileId();
    if (!profileId || this.isOnline || !this.isAvailable || this.pendingOfflineCount > 0) return;

    this.onlineSaving = true;
    this.consultantApi.setOnlineStatus({ profileId, isOnline: true, isOffline: false })
      .pipe(finalize(() => {
        this.onlineSaving = false;
        this.markViewDirty();
      }))
      .subscribe({
        next: response => {
          const status = this.applyConsultantStatusFrom(response, response.data);
          if (status.isOnline === null) this.isOnline = true;
          if (status.isAvailable === null) this.isAvailable = true;
          this.refreshDashboard();
        },
        error: () => this.loadPendingOfflineLeads()
      });
  }

  private defaultPatientAvatarImageName(): string {
    return 'default-patient-avatar.png';
  }

  private validateProfileForm(): string | null {
    const code = this.profileForm.nationalityCode.trim();
    if (!/^\d{10}$/.test(code)) return 'کد ملی باید ۱۰ رقم باشد';
    if (!this.profileForm.address.trim() || this.profileForm.address.trim().length < 5) return 'آدرس مشاور الزامی است';
    return null;
  }

  private validatePatientProfileForm(): string | null {
    const firstName = this.patientProfileForm.firstName.trim();
    const lastName = this.patientProfileForm.lastName.trim();
    const phoneNumber = this.patientProfileForm.phoneNumber.trim();
    const expectedPhoneNumberValue = this.selectedPatientProfileReservation
      ? this.reservationPatientPhone(this.selectedPatientProfileReservation).trim()
      : phoneNumber;
    const expectedPhoneNumber = expectedPhoneNumberValue && expectedPhoneNumberValue !== '-' ? expectedPhoneNumberValue : phoneNumber;
    if (!firstName) return 'نام بیمار الزامی است';
    if (firstName.length > 100) return 'نام بیمار نباید بیشتر از ۱۰۰ کاراکتر باشد';
    if (!lastName) return 'نام خانوادگی بیمار الزامی است';
    if (lastName.length > 100) return 'نام خانوادگی بیمار نباید بیشتر از ۱۰۰ کاراکتر باشد';
    if (!/^09\d{9}$/.test(phoneNumber)) return 'شماره موبایل بیمار معتبر نیست';
    if (phoneNumber !== expectedPhoneNumber) return 'شماره موبایل بیمار باید با شماره لید رزرو شده یکسان باشد';
    if (!this.patientProfileForm.password) return 'رمز عبور بیمار الزامی است';
    if (this.patientProfileForm.password.length < 6) return 'رمز عبور باید حداقل ۶ کاراکتر باشد';
    if (this.patientProfileForm.password.length > 100) return 'رمز عبور نباید بیشتر از ۱۰۰ کاراکتر باشد';
    if (![1, 2].includes(Number(this.patientProfileForm.gender))) return 'جنسیت بیمار معتبر نیست';
    return null;
  }

  private buildPatientRegistrationRequest(reservationId: number): RegisterRequest {
    return {
      firstName: this.patientProfileForm.firstName.trim(),
      lastName: this.patientProfileForm.lastName.trim(),
      phoneNumber: this.patientProfileForm.phoneNumber.trim(),
      passwordHash: this.patientProfileForm.password,
      isCompleteProfile: true,
      avatarImageName: this.defaultPatientAvatarImageName(),
      gender: Number(this.patientProfileForm.gender),
      roleName: 'Patient',
      reservationId
    };
  }

  private emptyPatientProfileForm(): PatientProfileForm {
    return {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      password: '',
      gender: 1
    };
  }

  private splitReservationPatientName(value: string | null | undefined): { firstName: string; lastName: string } {
    const parts = (value ?? '').trim().split(/\s+/).filter(Boolean);
    return {
      firstName: parts[0] ?? '',
      lastName: parts.slice(1).join(' ')
    };
  }

  private createYesterday(): Date {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return this.startOfDay(date);
  }

  private createRelativeYearDate(yearOffset: number): Date {
    const date = new Date();
    date.setFullYear(date.getFullYear() + yearOffset);
    return this.startOfDay(date);
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private toDateInputValue(date: Date): string {
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  private resolveProfileId(data: unknown): number | null {
    if (typeof data === 'number' && data > 0) return data;
    if (typeof data === 'string') {
      const numeric = Number(data);
      return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
    }

    if (typeof data !== 'object' || data === null) return null;

    const source = data as Record<string, unknown>;
    for (const key of ['profileId', 'consultantProfileId', 'id']) {
      const value = source[key];
      const numeric = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
      if (Number.isFinite(numeric) && numeric > 0) return numeric;
    }

    return null;
  }

  private requireProfileId(): number | null {
    const profileId = this.currentProfileId();
    if (!profileId) {
      this.showFeedback('شناسه پروفایل مشاور یافت نشد', 'error');
      return null;
    }

    return profileId;
  }

  private timerStorageKey(): string {
    return `consultant-lead-timers:${this.userKey()}`;
  }

  private notificationStorageKey(): string {
    return `consultant-realtime-notifications:${this.userKey()}`;
  }

  private assignmentNotificationStorageKey(): string {
    return `consultant-assignment-notifications:${this.userKey()}`;
  }

  private userKey(): string {
    const user = this.user();
    return user?.userId || user?.phoneNumber || 'current';
  }

  private toDateTimeLocalValue(date: Date): string {
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  private readJson<T>(key: string, fallback: T): T {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) as T : fallback;
    } catch {
      return fallback;
    }
  }

  private writeJson(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // The dashboard still works; only local timer persistence is skipped.
    }
  }

  private applyConsultantStatusFrom(...sources: unknown[]): ConsultantStatusUpdate {
    const update: ConsultantStatusUpdate = { isAvailable: null, isOnline: null };

    sources.forEach(source => this.collectConsultantStatus(source, update, 0));

    if (update.isAvailable !== null) this.isAvailable = update.isAvailable;
    if (update.isOnline !== null) this.isOnline = update.isOnline;

    return update;
  }

  private collectConsultantStatus(source: unknown, update: ConsultantStatusUpdate, depth: number): void {
    if (depth > 2 || !this.isRecord(source)) return;

    update.isAvailable ??= this.readBoolean(source, 'isAvailable', 'available', 'consultantIsAvailable');
    update.isOnline ??= this.readBoolean(source, 'isOnline', 'online', 'consultantIsOnline', 'isConsultantOnline');

    if (update.isOnline === null) {
      const isOffline = this.readBoolean(source, 'isOffline', 'offline', 'consultantIsOffline');
      if (isOffline !== null) update.isOnline = !isOffline;
    }

    for (const key of ['data', 'result', 'value', 'payload', 'consultant', 'profile', 'status']) {
      const nested = this.readValue(source, key);
      if (nested && nested !== source) this.collectConsultantStatus(nested, update, depth + 1);
    }
  }

  private readBoolean(source: unknown, ...keys: string[]): boolean | null {
    if (!this.isRecord(source)) return null;

    for (const key of keys) {
      const value = this.readValue(source, key);
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (['true', '1', 'yes'].includes(normalized)) return true;
        if (['false', '0', 'no'].includes(normalized)) return false;
      }
    }

    return null;
  }

  private numberOrNull(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    const numeric = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

  private readValue(source: unknown, ...keys: string[]): unknown {
    if (!this.isRecord(source)) return undefined;

    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(source, key)) return source[key];
    }

    const entries = Object.entries(source);
    for (const key of keys) {
      const match = entries.find(([entryKey]) => entryKey.toLowerCase() === key.toLowerCase());
      if (match) return match[1];
    }

    return undefined;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private showFeedback(message: string, type: 'success' | 'error'): void {
    this.feedbackMessage = message;
    this.feedbackType = type;
  }

  private clearFeedback(): void {
    this.feedbackMessage = '';
  }

  private markViewDirty(): void {
    if (this.destroyed) return;
    this.cdr.markForCheck();
  }

  private errorMessage(error: unknown, fallback: string): string {
    return error instanceof Error && error.message ? error.message : fallback;
  }
}
