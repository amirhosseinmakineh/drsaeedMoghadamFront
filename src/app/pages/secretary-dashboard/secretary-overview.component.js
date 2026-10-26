 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,


  EventEmitter,





} from "@angular/core";
import { finalize } from "rxjs";
import {
  AttendanceConfirmationStatus,
  readAttendanceStatus,
} from "../../core/reservation/reservation-attendance";





import { FaIconComponent } from "../../shared/ui/fa-icon/fa-icon.component";
import { formatReservationTime } from "../../utils/iran-datetime.util";

 















@Component({
  selector: "app-secretary-overview",
  standalone: true,
  imports: [CommonModule, FaIconComponent],
  templateUrl: "./secretary-overview.component.html",
  styleUrl: "./secretary-overview.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecretaryOverviewComponent  {
  Input() __init() {this.profileReady = false}
  Output() __init2() {this.openList = new EventEmitter()}

  __init3() {this.loading = false}
  __init4() {this.errorMessage = ""}
  __init5() {this.reservations = []}
  __init6() {this.summary = { requiresCall: 0, confirmed: 0, noAnswer: 0, cancelled: 0, afterSalesServices: 0 }}

   __init7() {this.loadSubscription = null}
   __init8() {this.requestId = 0}

  constructor(
     secretaryApi,
     cdr,
  ) {;this.secretaryApi = secretaryApi;this.cdr = cdr;SecretaryOverviewComponent.prototype.__init.call(this);SecretaryOverviewComponent.prototype.__init2.call(this);SecretaryOverviewComponent.prototype.__init3.call(this);SecretaryOverviewComponent.prototype.__init4.call(this);SecretaryOverviewComponent.prototype.__init5.call(this);SecretaryOverviewComponent.prototype.__init6.call(this);SecretaryOverviewComponent.prototype.__init7.call(this);SecretaryOverviewComponent.prototype.__init8.call(this);}

  ngOnChanges(changes) {
    if (_optionalChain([changes, 'access', _2 => _2["profileReady"], 'optionalAccess', _3 => _3.currentValue]) === true) this.load();
  }

  ngOnDestroy() {
    _optionalChain([this, 'access', _4 => _4.loadSubscription, 'optionalAccess', _5 => _5.unsubscribe, 'call', _6 => _6()]);
  }

  get cards() {
    return [
      {
        preset: "after-sales",
        title: "خدمات پس از فروش",
        description: "رزروهای فعال خدمات پس از فروش",
        icon: "calendar",
        count: this.summary.afterSalesServices,
        tone: "info",
      },
      {
        preset: "needs-call",
        title: "رزروهای نیازمند تماس",
        description: "در انتظار اعلام منشی",
        icon: "phone",
        count: this.summary.requiresCall,
        tone: "info",
      },
      {
        preset: "secretary-confirmed",
        title: "تایید شده",
        description: "تایید تلفنی بیمار",
        icon: "check",
        count: this.summary.confirmed,
        tone: "success",
      },
      {
        preset: "secretary-no-answer",
        title: "پاسخ نداده",
        description: "تماس‌های بدون پاسخ",
        icon: "phone",
        count: this.summary.noAnswer,
        tone: "warning",
      },
      {
        preset: "secretary-cancelled",
        title: "لغو شده",
        description: "لغو توسط بیمار",
        icon: "close",
        count: this.summary.cancelled,
        tone: "danger",
      },
    ];
  }

  get pendingRequests() {
    return this.activeReservations.filter(
      (item) => this.reviewStatus(item) === 1,
    );
  }

  get confirmedToday() {
    return this.activeReservations
      .filter(
        (item) =>
          this.isToday(this.reservationAt(item)) &&
          [2, 3].includes(_nullishCoalesce(this.reviewStatus(item), () => ( 0))),
      )
      .sort((left, right) => this.timeOf(left) - this.timeOf(right));
  }

  get followUpsToday() {
    return this.activeReservations
      .filter(
        (item) =>
          this.isToday(this.followUpAt(item)) ||
          this.isToday(this.reminderAt(item)) ||
          this.readBoolean(item, "needsFollowUp", "NeedsFollowUp") === true,
      )
      .sort((left, right) => this.priorityOf(right) - this.priorityOf(left));
  }

  get noShows() {
    const now = Date.now();
    return this.activeReservations.filter((item) => {
      const reservationTime = this.timeOf(item);
      return (
        reservationTime > 0 &&
        reservationTime < now &&
        this.readBoolean(
          item,
          "consultantSaysPatientAttended",
          "ConsultantSaysPatientAttended",
        ) === false &&
        readAttendanceStatus(item, "attendanceConfirmationStatus") ===
          AttendanceConfirmationStatus.SecretaryApproved
      );
    });
  }

  get upcomingReservations() {
    const now = Date.now();
    return this.activeReservations
      .filter((item) => this.timeOf(item) >= now)
      .sort((left, right) => this.timeOf(left) - this.timeOf(right))
      .slice(0, 5);
  }

  get unconfirmedReservations() {
    return this.activeReservations
      .filter(
        (item) =>
          this.readBoolean(
            item,
            "isConfirmedWithPatient",
            "IsConfirmedWithPatient",
          ) === false,
      )
      .slice(0, 5);
  }

  get recentActivities() {
    return [...this.reservations]
      .filter((item) => Boolean(this.activityAt(item)))
      .sort(
        (left, right) =>
          this.dateTimeOf(this.activityAt(right)) -
          this.dateTimeOf(this.activityAt(left)),
      )
      .slice(0, 5);
  }

  load() {
    if (!this.profileReady) return;
    const requestId = ++this.requestId;
    this.loading = true;
    this.errorMessage = "";
    _optionalChain([this, 'access', _7 => _7.loadSubscription, 'optionalAccess', _8 => _8.unsubscribe, 'call', _9 => _9()]);
    this.loadSubscription = this.secretaryApi
      .getDashboardSummary()
      .pipe(
        finalize(() => {
          if (requestId !== this.requestId) return;
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (summary) => {
          if (requestId !== this.requestId) return;
          this.summary = summary;
          this.cdr.markForCheck();
        },
        error: (error) => {
          if (requestId !== this.requestId) return;
          this.summary = { requiresCall: 0, confirmed: 0, noAnswer: 0, cancelled: 0, afterSalesServices: 0 };
          this.errorMessage =
            error instanceof Error && error.message
              ? error.message
              : "اطلاعات داشبورد دریافت نشد";
          this.cdr.markForCheck();
        },
      });
  }

  patientName(item) {
    return _nullishCoalesce(_nullishCoalesce(item.patientName, () => ( item.PatientName)), () => ( "بیمار بدون نام"));
  }

  reservationAt(item) {
    return _nullishCoalesce(_nullishCoalesce(item.reservationAt, () => ( item.ReservationAt)), () => ( ""));
  }

  formatDateTime(value) {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return "زمان ثبت نشده";
    return new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "Asia/Tehran",
    }).format(date);
  }

  formatAppointmentTime(value) {
    return formatReservationTime(value);
  }

  trackReservation(_, item) {
    return _nullishCoalesce(_nullishCoalesce(item.id, () => ( item.Id)), () => ( this.reservationAt(item)));
  }

   get activeReservations() {
    return this.reservations.filter(
      (item) => !(_nullishCoalesce(_nullishCoalesce(item.isCanceled, () => ( item.IsCanceled)), () => ( false))),
    );
  }

   reviewStatus(item) {
    const value =
      _nullishCoalesce(item.secretaryReservationReviewStatus, () => (
      item.SecretaryReservationReviewStatus));
    const status = Number(value);
    return Number.isFinite(status) ? status : null;
  }

   followUpAt(item) {
    return _nullishCoalesce(_nullishCoalesce(item.followUpAt, () => ( item.FollowUpAt)), () => ( ""));
  }

   reminderAt(item) {
    return _nullishCoalesce(_nullishCoalesce(item.reminderAt, () => ( item.ReminderAt)), () => ( ""));
  }

   activityAt(item) {
    return (
      _nullishCoalesce(_nullishCoalesce(_nullishCoalesce(_nullishCoalesce(item.lastActivityAt, () => (
      item.LastActivityAt)), () => (
      item.secretaryReviewedAt)), () => (
      item.SecretaryReviewedAt)), () => (
      ""))
    );
  }

   priorityOf(item) {
    return Number(_nullishCoalesce(_nullishCoalesce(item.followUpPriority, () => ( item.FollowUpPriority)), () => ( 0))) || 0;
  }

   timeOf(item) {
    return this.dateTimeOf(this.reservationAt(item));
  }

   dateTimeOf(value) {
    const time = new Date(value).getTime();
    return Number.isFinite(time) ? time : 0;
  }

   isToday(value) {
    if (!value) return false;
    const time = this.dateTimeOf(value);
    if (!time) return false;
    return (
      this.tehranDateKey(new Date(time)) === this.tehranDateKey(new Date())
    );
  }

   tehranDateKey(date) {
    return new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Tehran",
    }).format(date);
  }

   readBoolean(
    item,
    camelKey,
    pascalKey,
  ) {
    const value = _nullishCoalesce(item[camelKey], () => ( item[pascalKey]));
    return typeof value === "boolean" ? value : null;
  }
}
