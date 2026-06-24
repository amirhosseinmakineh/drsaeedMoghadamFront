import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import {
  ConsultantDashboardService,
  ConsultantLead,
  ConsultantReservation,
  CreateReservationRequest,
  SubmitLeadCallReportRequest
} from '../../core/consultant/consultant-dashboard.service';
import { BaseDialogComponent } from '../../shared/base/base-dialog/base-dialog.component';
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
  reservationAt: string;
  description: string;
}

@Component({
  selector: 'app-consultant-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BaseDialogComponent, FaIconComponent],
  template: `
    <section class="consultant-shell">
      <header class="mobile-hero">
        <a class="dashboard-brand" routerLink="/">
          <span class="brand-mark"><app-fa-icon name="tooth"></app-fa-icon></span>
          <strong>کلینیک دکتر سعید مقدم</strong>
        </a>
        <button class="logout-chip" type="button" (click)="logout()">
          <app-fa-icon name="logout"></app-fa-icon>
          خروج
        </button>
        <div>
          <span>داشبورد مشاور</span>
          <h1>{{ displayName() }}</h1>
          <p>ابتدا پروفایل را کامل کنید، سپس حضور و وضعیت آنلاین را برای دریافت و تعیین تکلیف لیدها مدیریت کنید.</p>
        </div>
      </header>

      @if (feedbackMessage) {
        <p class="feedback" [class.error]="feedbackType === 'error'" [class.success]="feedbackType === 'success'">
          {{ feedbackMessage }}
        </p>
      }

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
            زمان رزرو
            <input [(ngModel)]="reservationForm.reservationAt" name="reservationAt" type="datetime-local" [min]="minReservationDateTime()" />
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
    .consultant-shell{display:grid;gap:16px;width:min(760px,calc(100% - 24px));margin:0 auto;padding:14px 0 96px}
    .mobile-hero,.profile-lock-card,.status-card,.lead-panel,.reservation-panel{border:1px solid var(--line);border-radius:30px;background:color-mix(in srgb,var(--surface) 88%,transparent);box-shadow:var(--shadow);backdrop-filter:blur(18px)}
    .mobile-hero{display:grid;grid-template-columns:1fr auto;gap:18px;padding:20px;background:radial-gradient(circle at 10% 0,color-mix(in srgb,var(--brand) 20%,transparent),transparent 46%),linear-gradient(135deg,color-mix(in srgb,var(--surface) 88%,transparent),var(--cream))}
    .mobile-hero>div{grid-column:1/-1}.dashboard-brand{display:flex;align-items:center;gap:10px;font-weight:950}.logout-chip{display:inline-flex;align-items:center;gap:7px;align-self:start;border:1px solid var(--line);border-radius:999px;padding:9px 12px;background:var(--surface-muted);color:var(--text);font-weight:950}
    .mobile-hero span,.panel-heading span{display:inline-flex;margin-bottom:8px;padding:5px 12px;border-radius:999px;background:color-mix(in srgb,var(--brand) 14%,transparent);color:var(--brand);font-weight:950}.mobile-hero h1{margin:0 0 8px;font-size:clamp(1.8rem,8vw,2.8rem)}.mobile-hero p{margin:0}
    .feedback{margin:0;padding:12px 14px;border-radius:20px;font-weight:950}.feedback.success{background:color-mix(in srgb,#22c55e 16%,transparent);color:#bbf7d0}.feedback.error{background:color-mix(in srgb,var(--danger) 15%,transparent);color:#fecaca}
    .profile-lock-card,.status-card,.lead-panel,.reservation-panel{display:grid;gap:16px;padding:18px}.lock-icon{display:grid;place-items:center;width:58px;height:58px;border-radius:22px;background:color-mix(in srgb,var(--brand) 16%,transparent);color:var(--brand);font-size:1.35rem}.profile-lock-card h2,.panel-heading h2{margin:0;font-size:1.35rem}.profile-lock-card p,.panel-heading p{margin:0;color:var(--muted)}
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
    @media (max-width:640px){.consultant-shell{width:min(100% - 20px,560px);padding-top:10px}.mobile-hero,.profile-lock-card,.status-card,.lead-panel,.reservation-panel{border-radius:24px;padding:14px}.status-summary,.action-grid,.lead-filters,.lead-actions{grid-template-columns:1fr}.panel-heading{display:grid}.mobile-hero{grid-template-columns:1fr}.logout-chip{justify-self:start}}
  `]
})
export class ConsultantDashboardComponent implements OnInit, OnDestroy {
  readonly user = this.auth.user;
  readonly displayName = computed(() => {
    const user = this.user();
    const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
    return name || 'مشاور';
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
    reservationAt: '',
    description: ''
  };
  reservations: ConsultantReservation[] = [];
  reservationsLoading = false;

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

  constructor(
    private auth: AuthService,
    private router: Router,
    private consultantApi: ConsultantDashboardService
  ) {}

  ngOnInit(): void {
    this.profileId = this.currentProfileId();
    this.timerStarts = this.readJson<Record<string, number>>(this.timerStorageKey(), {});
    this.notifiedRealtimeLeadIds = new Set(this.readJson<number[]>(this.notificationStorageKey(), []));

    if (this.isProfileReady()) {
      this.refreshDashboard();
      this.startTimers();
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
        const profileId = Number(response.data || this.currentProfileId() || 0);
        if (profileId > 0) {
          this.profileId = profileId;
          this.auth.updateConsultantProfile(profileId, true);
        }

        this.showFeedback(response.message || 'پروفایل مشاور کامل شد', 'success');
        this.refreshDashboard();
        this.startTimers();
      },
      error: error => this.showFeedback(this.errorMessage(error, 'تکمیل پروفایل انجام نشد'), 'error')
    });
  }

  setAvailability(isAvailable: boolean): void {
    const profileId = this.requireProfileId();
    if (!profileId) return;

    this.availabilitySaving = true;
    this.clearFeedback();

    this.consultantApi.setAvailability({ profileId, isAvailable })
      .pipe(finalize(() => this.availabilitySaving = false))
      .subscribe({
        next: response => {
          this.isAvailable = isAvailable;
          if (!isAvailable) this.isOnline = false;
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
          this.isOnline = isOnline;
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
          this.reportedLeadIds.add(leadAssignmentId);
          if (typeof response.data?.isConsultantOnline === 'boolean') {
            this.isOnline = response.data.isConsultantOnline;
          }
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

  submitReservation(): void {
    const profileId = this.requireProfileId();
    const lead = this.selectedReservationLead;
    const leadAssignmentId = lead ? this.leadId(lead) : null;
    if (!profileId || !leadAssignmentId) return;

    const reservationAt = new Date(this.reservationForm.reservationAt);
    if (!this.reservationForm.reservationAt || !Number.isFinite(reservationAt.getTime()) || reservationAt.getTime() <= Date.now()) {
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
    const value = lead.id ?? lead.leadAssignmentId;
    return typeof value === 'number' && value > 0 ? value : null;
  }

  leadName(lead: ConsultantLead): string {
    return lead.userName
      || lead.fullName
      || [lead.firstName, lead.lastName].filter(Boolean).join(' ').trim()
      || lead.user?.userName
      || lead.user?.fullName
      || lead.user?.name
      || [lead.user?.firstName, lead.user?.lastName].filter(Boolean).join(' ').trim()
      || lead.lead?.fullName
      || lead.lead?.name
      || [lead.lead?.firstName, lead.lead?.lastName].filter(Boolean).join(' ').trim()
      || 'بدون نام';
  }

  leadPhone(lead: ConsultantLead): string {
    return lead.phoneNumber
      || lead.mobile
      || lead.userPhoneNumber
      || lead.leadPhoneNumber
      || lead.user?.phoneNumber
      || lead.user?.mobile
      || lead.lead?.phoneNumber
      || lead.lead?.mobile
      || '-';
  }

  leadState(lead: ConsultantLead): number | null {
    return lead.leadAssignmentState ?? lead.state ?? lead.status ?? null;
  }

  leadType(lead: ConsultantLead): number | null {
    return lead.leadAssignmentType ?? lead.assignmentType ?? lead.type ?? null;
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
    const date = new Date(Date.now() + 5 * 60 * 1000);
    date.setSeconds(0, 0);
    return this.toDateTimeLocalValue(date);
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

    this.consultantApi.getLeads({
      profileId,
      leadAssignmentState: LEAD_STATE.Pending,
      leadAssignmentType: LEAD_TYPE.OfflineQueue,
      pageNumber: 1,
      pageSize: 50
    }).subscribe({
      next: response => this.pendingOfflineCount = response.totalCount ?? response.items.length,
      error: () => this.pendingOfflineCount = 0
    });
  }

  private loadLeads(quiet = false): void {
    const profileId = this.currentProfileId();
    if (!profileId) return;

    this.leadsLoading = !quiet;
    if (!quiet) this.clearFeedback();

    this.consultantApi.getLeads({
      profileId,
      leadAssignmentState: this.leadStateFilter,
      leadAssignmentType: this.leadTypeFilter,
      pageNumber: this.leadPageNumber,
      pageSize: this.leadPageSize
    }).pipe(finalize(() => this.leadsLoading = false)).subscribe({
      next: response => {
        this.leads = response.items ?? [];
        this.leadTotalCount = response.totalCount ?? this.leads.length;
        this.leadTotalPages = Math.max(1, response.totalPages || Math.ceil(this.leadTotalCount / this.leadPageSize));
        this.hydrateRealtimeTimers();
        this.notifyNewRealtimeLeads();
        this.expireDueRealtimeLeads();
      },
      error: error => {
        if (!quiet) this.showFeedback(this.errorMessage(error, 'دریافت لیدها انجام نشد'), 'error');
      }
    });
  }

  private loadReservations(): void {
    const profileId = this.currentProfileId();
    if (!profileId) return;

    this.reservationsLoading = true;

    this.consultantApi.getReservations({
      consultantProfileId: profileId,
      from: new Date().toISOString(),
      includeCanceled: false,
      pageNumber: 1,
      pageSize: 5
    }).pipe(finalize(() => this.reservationsLoading = false)).subscribe({
      next: response => this.reservations = response.items ?? [],
      error: () => this.reservations = []
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
        if (typeof response.data?.isConsultantOnline === 'boolean') {
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
    this.selectedReservationLead = lead;
    this.reservationRequired = required;
    this.reservationForm = {
      reservationAt: this.minReservationDateTime(),
      description: 'رزرو اولیه پس از تماس موفق'
    };
    this.reservationDialogOpen = true;
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
