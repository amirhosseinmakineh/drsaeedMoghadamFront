import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, switchMap, tap } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import {
  ConsultantDashboardService,
  ConsultantLead,
  ConsultantReservation,
  CreateReservationRequest,
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

const SUCCESSFUL_CALL_RESULTS = [1, 2];
const THREE_MINUTES_MS = 3 * 60 * 1000;

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
  description: string;
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
            *ngFor="let item of visibleDashboardLinks"
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
              <button type="button" (click)="setSection('reservations')">
                <span><app-fa-icon name="calendar"></app-fa-icon></span>
                <strong>رزروها</strong>
                <small>{{ reservations.length }} رزرو آینده برای پیگیری سریع در دسترس است.</small>
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
                  <button class="secondary-action danger" type="button" [disabled]="availabilitySaving || !isAvailable" (click)="setAvailability(false)">
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
                  <button class="secondary-action danger" type="button" [disabled]="availabilitySaving || !isAvailable" (click)="setAvailability(false)">
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
                  <button class="primary-action compact" type="submit">اعمال</button>
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
                            (click)="handleCallClick($event, lead)"
                          >
                            <app-fa-icon name="phone"></app-fa-icon>
                            {{ leadPhone(lead) }}
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
                    @for (reservation of reservations; track reservation.id) {
                      <article>
                        <strong>{{ reservation.patientName || 'بدون نام' }}</strong>
                        <span>{{ reservation.patientPhoneNumber }}</span>
                        <time>{{ formatDateTime(reservation.reservationAt) }}</time>
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
          <label>
            توضیحات
            <textarea [(ngModel)]="reservationForm.description" name="reservationDescription" rows="3"></textarea>
          </label>
          <div class="dialog-actions">
            <button class="secondary-action" type="button" (click)="closeReservationDialog()">بعداً</button>
            <button class="primary-action" type="submit" [disabled]="reservationSaving">{{ reservationSaving ? 'در حال ثبت...' : 'ثبت رزرو' }}</button>
          </div>
        </form>
      </app-base-dialog>
    </section>
  `,
  styles: [`
    .dashboard-layout{display:grid;grid-template-columns:300px minmax(0,1fr);gap:18px;width:min(1180px,calc(100% - 36px));margin:0 auto;padding:36px 0 86px}
    .dashboard-sidebar,.dashboard-hero,.profile-lock-card,.status-card,.lead-panel,.reservation-panel,.consultant-panel{border:1px solid var(--line);background:color-mix(in srgb,var(--surface) 86%,transparent);box-shadow:var(--shadow);backdrop-filter:blur(18px)}
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
    .feedback{margin:0;padding:12px 14px;border-radius:20px;font-weight:950}.feedback.success{background:color-mix(in srgb,#22c55e 16%,transparent);color:#bbf7d0}.feedback.error{background:color-mix(in srgb,var(--danger) 15%,transparent);color:#fecaca}
    .consultant-overview{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.consultant-overview button{display:grid;gap:12px;text-align:start;border:1px solid var(--line);border-radius:30px;padding:22px;background:color-mix(in srgb,var(--surface) 86%,transparent);color:var(--text);box-shadow:0 18px 54px rgba(0,0,0,.18)}.consultant-overview span{display:grid;place-items:center;width:52px;height:52px;border-radius:20px;background:color-mix(in srgb,var(--brand) 16%,transparent);color:var(--brand);font-size:1.25rem}.consultant-overview strong{font-size:1.1rem}.consultant-overview small{color:var(--muted);font-weight:900;line-height:1.8}
    .profile-lock-card,.status-card,.lead-panel,.reservation-panel,.consultant-panel{display:grid;gap:16px;padding:18px;border-radius:30px}.lock-icon{display:grid;place-items:center;width:58px;height:58px;border-radius:22px;background:color-mix(in srgb,var(--brand) 16%,transparent);color:var(--brand);font-size:1.35rem}.profile-lock-card h2,.panel-heading h2,.locked-panel h2{margin:0;font-size:1.35rem}.profile-lock-card p,.panel-heading p,.locked-panel p{margin:0;color:var(--muted)}
    .locked-panel{grid-template-columns:auto minmax(0,1fr) auto;align-items:center}
    .profile-form,.dialog-form{display:grid;gap:14px}label{display:grid;gap:8px;color:var(--muted);font-weight:950}.primary-action,.secondary-action{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;border:0;border-radius:18px;padding:12px 16px;font:inherit;font-weight:950}.primary-action{background:linear-gradient(135deg,var(--brand),var(--brand-2));color:#1b1712}.secondary-action{border:1px solid var(--line);background:var(--surface-muted);color:var(--text)}.secondary-action.danger{background:color-mix(in srgb,var(--danger) 15%,var(--surface-muted));color:#fecaca}.primary-action:disabled,.secondary-action:disabled{cursor:not-allowed;opacity:.55}.full{width:100%}.compact{min-height:40px;border-radius:999px;padding:9px 13px;font-size:.86rem}
    .status-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.status-summary div{padding:14px;border:1px solid var(--line);border-radius:22px;background:color-mix(in srgb,var(--surface-muted) 70%,transparent)}.status-summary span{display:block;color:var(--muted);font-size:.82rem;font-weight:900}.status-summary strong{display:block;color:var(--text);font-size:1.05rem}.status-summary .good{color:#bbf7d0}.status-summary .bad{color:#fecaca}
    .action-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.queue-warning{margin:0;padding:12px 14px;border-radius:18px;background:color-mix(in srgb,#f59e0b 14%,transparent);color:#fde68a;font-weight:950}
    .panel-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.lead-filters{display:grid;grid-template-columns:1fr 1fr auto;gap:10px;align-items:end}.loading-copy,.empty-copy{margin:0;padding:18px;border:1px dashed var(--line);border-radius:22px;color:var(--muted);text-align:center;font-weight:900}
    .lead-list{display:grid;gap:12px}.lead-card{display:grid;gap:12px;padding:14px;border:1px solid var(--line);border-radius:24px;background:color-mix(in srgb,var(--surface-muted) 56%,transparent)}.lead-card.realtime{border-color:color-mix(in srgb,var(--brand) 44%,var(--line))}.lead-card.expired{opacity:.72}.lead-card header{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.lead-card h3{margin:0;font-size:1.1rem}.lead-card header span{color:var(--brand);font-weight:950;font-size:.82rem}
    .badge{display:inline-flex;align-items:center;justify-content:center;min-height:30px;border-radius:999px;padding:5px 10px;font-size:.8rem;font-weight:950}.badge.info{background:color-mix(in srgb,var(--brand) 16%,transparent);color:var(--brand)}.badge.success{background:color-mix(in srgb,#22c55e 16%,transparent);color:#bbf7d0}.badge.warn{background:color-mix(in srgb,#f59e0b 16%,transparent);color:#fde68a}.badge.danger{background:color-mix(in srgb,var(--danger) 16%,transparent);color:#fecaca}
    .timer-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border-radius:18px;background:color-mix(in srgb,var(--brand) 10%,transparent);color:var(--brand);font-weight:950}.timer-row.danger{background:color-mix(in srgb,var(--danger) 14%,transparent);color:#fecaca}.lead-actions{display:grid;grid-template-columns:1fr auto;gap:10px}.call-action{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:46px;border-radius:18px;background:color-mix(in srgb,#22c55e 18%,var(--surface-muted));color:#bbf7d0;font-weight:950}.call-action.disabled{pointer-events:none;opacity:.5;filter:grayscale(1)}
    .pager{display:flex;align-items:center;justify-content:center;gap:10px}.pager button{border:1px solid var(--line);border-radius:999px;padding:9px 16px;background:var(--surface-muted);color:var(--text);font:inherit;font-weight:950}.pager button:disabled{opacity:.45;cursor:not-allowed}.pager span{color:var(--muted);font-weight:950}
    .reservation-list{display:grid;gap:10px}.reservation-list article{display:grid;gap:3px;padding:12px;border:1px solid var(--line);border-radius:20px;background:color-mix(in srgb,var(--surface-muted) 58%,transparent)}.reservation-list strong{color:var(--text)}.reservation-list span,.reservation-list time{color:var(--muted);font-weight:900}
    .dialog-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    @media (max-width:980px){.dashboard-layout{grid-template-columns:1fr;width:min(100% - 24px,760px);padding-top:14px}.dashboard-sidebar{position:relative;top:0;min-height:0}.consultant-overview{grid-template-columns:1fr}.lead-filters{grid-template-columns:1fr 1fr auto}.locked-panel{grid-template-columns:1fr}}
    @media (max-width:760px){
      .dashboard-layout.consultant-mode{width:100%;padding:0 10px 96px}.dashboard-layout.consultant-mode .dashboard-sidebar{position:fixed;z-index:80;inset-inline:10px;bottom:10px;top:auto;min-height:0;padding:8px;border-radius:28px}.consultant-mode .dashboard-brand,.consultant-mode .dashboard-user-card,.consultant-mode .logout-btn{display:none}.consultant-mode .dashboard-nav{grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}.consultant-mode .dashboard-nav button{display:grid;place-items:center;gap:3px;min-height:58px;padding:7px;border-radius:20px;text-align:center;font-size:.72rem}.consultant-mode .dashboard-nav app-fa-icon{font-size:1.1rem;color:var(--brand)}
      .dashboard-content{padding-top:10px}.dashboard-hero,.profile-lock-card,.status-card,.lead-panel,.reservation-panel,.consultant-panel{border-radius:24px;padding:14px}.status-summary,.action-grid,.lead-filters,.lead-actions{grid-template-columns:1fr}.panel-heading{display:grid}.dialog-actions{grid-template-columns:1fr 1fr}
    }
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
    description: ''
  };
  reservations: ConsultantReservation[] = [];
  reservationsLoading = false;
  readonly reservationDatePickerLabel = { fa: 'تاریخ رزرو', en: 'Reservation date' };

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
  private leadRequestId = 0;
  private pendingOfflineRequestId = 0;
  private reservationRequestId = 0;
  private visibleLeadLoadingRequestId = 0;

  constructor(
    private auth: AuthService,
    private router: Router,
    private consultantApi: ConsultantDashboardService
  ) {}

  get visibleDashboardLinks(): ConsultantDashboardLink[] {
    return this.isProfileReady()
      ? this.dashboardLinks.filter(item => item.id !== 'profile')
      : this.dashboardLinks;
  }

  ngOnInit(): void {
    this.profileId = this.currentProfileId();
    this.timerStarts = this.readJson<Record<string, number>>(this.timerStorageKey(), {});
    this.notifiedRealtimeLeadIds = new Set(this.readJson<number[]>(this.notificationStorageKey(), []));

    if (this.isProfileReady()) {
      this.refreshDashboard();
      this.startTimers();
    } else {
      this.activeSection = 'profile';
    }
  }

  ngOnDestroy(): void {
    if (this.timerId) clearInterval(this.timerId);
    if (this.pollId) clearInterval(this.pollId);
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
    return this.isAvailable && this.pendingOfflineCount === 0;
  }

  setSection(section: ConsultantDashboardSection): void {
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
    }).pipe(finalize(() => this.profileSaving = false)).subscribe({
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

    const shouldForceOffline = !isAvailable && this.isOnline;
    this.availabilitySaving = true;
    if (shouldForceOffline) this.onlineSaving = true;
    this.clearFeedback();

    const request = shouldForceOffline
      ? this.consultantApi.setOnlineStatus({ profileId, isOnline: false, isOffline: true }).pipe(
        tap(response => {
          const status = this.applyConsultantStatusFrom(response, response.data);
          if (status.isOnline === null) this.isOnline = false;
        }),
        switchMap(() => this.consultantApi.setAvailability({ profileId, isAvailable }))
      )
      : this.consultantApi.setAvailability({ profileId, isAvailable });

    request
      .pipe(finalize(() => {
        this.availabilitySaving = false;
        if (shouldForceOffline) this.onlineSaving = false;
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
      const message = this.pendingOfflineCount > 0
        ? 'ابتدا لیدهای آفلاین خود را تعیین تکلیف کنید'
        : 'ابتدا حضور خود را ثبت کنید';
      this.showFeedback(message, 'error');
      return;
    }

    this.onlineSaving = true;
    this.clearFeedback();

    this.consultantApi.setOnlineStatus({ profileId, isOnline, isOffline: !isOnline })
      .pipe(finalize(() => this.onlineSaving = false))
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
    this.loadPendingOfflineLeads();
    this.loadLeads();
    this.loadReservations();
  }

  applyLeadFilters(): void {
    this.leadPageNumber = 1;
    this.loadLeads();
  }

  changeLeadPage(page: number): void {
    this.leadPageNumber = page;
    this.loadLeads();
  }

  openReportDialog(lead: ConsultantLead): void {
    if (this.isReportDisabled(lead)) return;
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
      reportDescription: this.reportForm.reportDescription.trim() || null
    };

    this.consultantApi.submitLeadCallReport(payload)
      .pipe(finalize(() => this.reportSaving = false))
      .subscribe({
        next: response => {
          const wasBlockingOfflineLead = this.leadType(lead) === LEAD_TYPE.OfflineQueue && this.leadState(lead) === LEAD_STATE.Pending;
          this.reportedLeadIds.add(leadAssignmentId);
          const status = this.applyConsultantStatusFrom(response, response.data);
          if (status.isOnline === null && typeof response.data?.isConsultantOnline === 'boolean') {
            this.isOnline = response.data.isConsultantOnline;
          }
          this.markLeadReported(leadAssignmentId, response.data?.leadAssignmentState ?? LEAD_STATE.Contacted);
          if (wasBlockingOfflineLead) this.pendingOfflineCount = Math.max(0, this.pendingOfflineCount - 1);
          this.closeReportDialog();
          this.showFeedback(response.message || 'گزارش تماس ثبت شد', 'success');
          this.refreshDashboard();

          if (SUCCESSFUL_CALL_RESULTS.includes(payload.callResult)) {
            this.openReservationDialog(lead, true);
          }
        },
        error: error => this.showFeedback(this.errorMessage(error, 'ثبت گزارش تماس انجام نشد'), 'error')
      });
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

    const payload: CreateReservationRequest = {
      leadAssignmentId,
      consultantProfileId: profileId,
      reservationAt: reservationAt.toISOString(),
      description: this.reservationForm.description.trim() || null
    };

    this.reservationSaving = true;
    this.clearFeedback();

    this.consultantApi.createReservation(payload)
      .pipe(finalize(() => this.reservationSaving = false))
      .subscribe({
        next: response => {
          this.reservationRequired = false;
          this.reservationDialogOpen = false;
          this.selectedReservationLead = null;
          this.showFeedback(response.message || 'رزرو با موفقیت ثبت شد', 'success');
          this.loadReservations();
        },
        error: error => this.showFeedback(this.errorMessage(error, 'ثبت رزرو انجام نشد'), 'error')
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

  private loadPendingOfflineLeads(): void {
    const profileId = this.currentProfileId();
    if (!profileId) return;

    const requestId = ++this.pendingOfflineRequestId;

    this.consultantApi.getLeads({
      profileId,
      leadAssignmentState: LEAD_STATE.Pending,
      leadAssignmentType: LEAD_TYPE.OfflineQueue,
      pageNumber: 1,
      pageSize: 50
    }).subscribe({
      next: response => {
        if (requestId !== this.pendingOfflineRequestId) return;
        this.applyConsultantStatusFrom(response.source, response.raw);
        this.pendingOfflineCount = response.totalCount ?? response.items.length;
      },
      error: () => {
        if (requestId === this.pendingOfflineRequestId) this.pendingOfflineCount = 0;
      }
    });
  }

  private loadLeads(quiet = false): void {
    const profileId = this.currentProfileId();
    if (!profileId) return;

    const requestId = ++this.leadRequestId;
    if (!quiet) {
      this.visibleLeadLoadingRequestId = requestId;
      this.leadsLoading = true;
    }
    if (!quiet) this.clearFeedback();

    this.consultantApi.getLeads({
      profileId,
      leadAssignmentState: this.leadStateFilter,
      leadAssignmentType: this.leadTypeFilter,
      pageNumber: this.leadPageNumber,
      pageSize: this.leadPageSize
    }).pipe(finalize(() => {
      if (!quiet && requestId === this.visibleLeadLoadingRequestId) this.leadsLoading = false;
    })).subscribe({
      next: response => {
        if (requestId !== this.leadRequestId) return;
        this.applyConsultantStatusFrom(response.source, response.raw);
        this.leads = response.items ?? [];
        this.leadTotalCount = response.totalCount ?? this.leads.length;
        this.leadTotalPages = Math.max(1, response.totalPages || Math.ceil(this.leadTotalCount / this.leadPageSize));
        this.hydrateRealtimeTimers();
        this.notifyNewRealtimeLeads();
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
    this.reservationsLoading = true;

    this.consultantApi.getReservations({
      consultantProfileId: profileId,
      from: new Date().toISOString(),
      includeCanceled: false,
      pageNumber: 1,
      pageSize: 5
    }).pipe(finalize(() => {
      if (requestId === this.reservationRequestId) this.reservationsLoading = false;
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

  private startTimers(): void {
    if (!this.timerId) {
      this.timerId = setInterval(() => {
        this.currentTime = Date.now();
        this.expireDueRealtimeLeads();
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
    const title = 'لید لحظه‌ای جدید';
    const body = `${this.leadName(lead)} - ${this.leadPhone(lead)}؛ مهلت تماس ۳ دقیقه است.`;

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

    this.consultantApi.expireLeadNoCall({ leadAssignmentId, consultantProfileId: profileId }).subscribe({
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
      complete: () => this.expiringLeadIds.delete(leadAssignmentId)
    });
  }

  private openReservationDialog(lead: ConsultantLead, required: boolean): void {
    const minimumReservationAt = this.minimumReservationDateTime();
    this.selectedReservationLead = lead;
    this.reservationRequired = required;
    this.reservationForm = {
      reservationDate: minimumReservationAt,
      reservationTime: this.toTimeValue(minimumReservationAt),
      description: 'رزرو اولیه پس از تماس موفق'
    };
    this.reservationDialogOpen = true;
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

  private validateProfileForm(): string | null {
    const code = this.profileForm.nationalityCode.trim();
    if (!/^\d{10}$/.test(code)) return 'کد ملی باید ۱۰ رقم باشد';
    if (!this.profileForm.address.trim() || this.profileForm.address.trim().length < 5) return 'آدرس مشاور الزامی است';
    return null;
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

  private errorMessage(error: unknown, fallback: string): string {
    return error instanceof Error && error.message ? error.message : fallback;
  }
}
