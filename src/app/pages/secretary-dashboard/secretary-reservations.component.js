 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,







} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { finalize, forkJoin, map } from "rxjs";
import {
  AttendanceConfirmationStatus,
  attendanceScoreLabel,
  attendanceStatusPresentation,
  canSecretaryReviewAttendance,
  consultantAttendanceClaimLabel,
  readAttendanceStatus,
} from "../../core/reservation/reservation-attendance";
import {


  ReservationType,
} from "../../core/secretary/secretary-dashboard.service";

import { NG_MODEL_UPDATE_ON_BLUR } from "../../shared/forms/ng-model-options";
import { createCoalescedMarkForCheck } from "../../shared/change-detection/coalesce-mark-for-check";

import { formatReservationTime } from "../../utils/iran-datetime.util";

import { BaseDatepickerComponent } from "../../shared/base";

 






@Component({
  selector: "app-secretary-reservations",
  standalone: true,
  imports: [CommonModule, FormsModule, BaseDatepickerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./secretary-reservations.component.html",
  styleUrl: "./secretary-reservations.component.scss",
})
export class SecretaryReservationsComponent
  
{
  Input() __init() {this.profileReady = false}
  Input() __init2() {this.initialTab = "queue"}
  Input() __init3() {this.preset = null}

  __init4() {this.activeTab = "queue"}
  __init5() {this.items = []}
  __init6() {this.notes = {}}
  __init7() {this.doctorNames = {}}
  __init8() {this.approvalReservationId = null}
  __init9() {this.loading = false}
  __init10() {this.savingId = null}
  __init11() {this.feedback = ""}
  __init12() {this.feedbackType = "success"}
  __init13() {this.statusFilter = null}
  __init14() {this.reservationTypeFilter = null}
    __init15() {this.fromDate = null}
    __init16() {this.toDate = null}
   __init17() {this.reservationTypeOptions = [
    { value: ReservationType.Regular, label: "رزرو عادی" },
    { value: ReservationType.AfterSalesService, label: "خدمات پس از درمان" },
  ]}
   __init18() {this.statusOptions = [
    AttendanceConfirmationStatus.PendingConsultantConfirmation,
    AttendanceConfirmationStatus.ConsultantConfirmedPresent,
    AttendanceConfirmationStatus.ConsultantConfirmedAbsent,
    AttendanceConfirmationStatus.SecretaryApproved,
    AttendanceConfirmationStatus.SecretaryRejected,
  ].map((value) => ({
    value,
    label: attendanceStatusPresentation(value).label,
  }))}
  __init19() {this.searchText = ""}
  __init20() {this.includeCanceled = false}
  __init21() {this.pageNumber = 1}
  __init22() {this.pageSize = 20}
  __init23() {this.totalPages = 1}

   __init24() {this.loadRequestId = 0}
   __init25() {this.pollId = null}
   __init26() {this.loadSubscription = null}
  
   __init27() {this.destroyed = false}
   __init28() {this.loadPending = false}
   __init29() {this.initialLoadStarted = false}
    __init30() {this.onVisibilityChange = () => {
    if (document.visibilityState === "visible" && this.profileReady) this.load();
  }}
   __init31() {this.ngModelBlurOptions = NG_MODEL_UPDATE_ON_BLUR}
  

  constructor(
     secretaryApi,
     toast,
    reservationSync,
     cdr,
  ) {;this.secretaryApi = secretaryApi;this.toast = toast;this.cdr = cdr;SecretaryReservationsComponent.prototype.__init.call(this);SecretaryReservationsComponent.prototype.__init2.call(this);SecretaryReservationsComponent.prototype.__init3.call(this);SecretaryReservationsComponent.prototype.__init4.call(this);SecretaryReservationsComponent.prototype.__init5.call(this);SecretaryReservationsComponent.prototype.__init6.call(this);SecretaryReservationsComponent.prototype.__init7.call(this);SecretaryReservationsComponent.prototype.__init8.call(this);SecretaryReservationsComponent.prototype.__init9.call(this);SecretaryReservationsComponent.prototype.__init10.call(this);SecretaryReservationsComponent.prototype.__init11.call(this);SecretaryReservationsComponent.prototype.__init12.call(this);SecretaryReservationsComponent.prototype.__init13.call(this);SecretaryReservationsComponent.prototype.__init14.call(this);SecretaryReservationsComponent.prototype.__init15.call(this);SecretaryReservationsComponent.prototype.__init16.call(this);SecretaryReservationsComponent.prototype.__init17.call(this);SecretaryReservationsComponent.prototype.__init18.call(this);SecretaryReservationsComponent.prototype.__init19.call(this);SecretaryReservationsComponent.prototype.__init20.call(this);SecretaryReservationsComponent.prototype.__init21.call(this);SecretaryReservationsComponent.prototype.__init22.call(this);SecretaryReservationsComponent.prototype.__init23.call(this);SecretaryReservationsComponent.prototype.__init24.call(this);SecretaryReservationsComponent.prototype.__init25.call(this);SecretaryReservationsComponent.prototype.__init26.call(this);SecretaryReservationsComponent.prototype.__init27.call(this);SecretaryReservationsComponent.prototype.__init28.call(this);SecretaryReservationsComponent.prototype.__init29.call(this);SecretaryReservationsComponent.prototype.__init30.call(this);SecretaryReservationsComponent.prototype.__init31.call(this);
    this.markDirty = createCoalescedMarkForCheck(
      this.cdr,
      () => this.destroyed,
    );
    this.realtimeSubscription = reservationSync.refreshRequested$.subscribe(() => {
      if (this.profileReady) this.load();
    });
  }

  ngOnInit() {
    this.activeTab = this.initialTab;
    document.addEventListener("visibilitychange", this.onVisibilityChange);
    if (this.profileReady) {
      this.loadInitial();
      this.startPolling();
    }
  }

  ngOnChanges(changes) {
    if (_optionalChain([changes, 'access', _ => _["initialTab"], 'optionalAccess', _2 => _2.currentValue])) {
      this.activeTab = changes["initialTab"].currentValue;
    }
    if (
      changes["preset"] &&
      !changes["preset"].firstChange &&
      this.profileReady
    ) {
      this.pageNumber = 1;
      this.load();
    }
    if (_optionalChain([changes, 'access', _3 => _3["profileReady"], 'optionalAccess', _4 => _4.currentValue]) === true) {
      this.loadInitial();
      this.startPolling();
    }
  }

  ngOnDestroy() {
    this.destroyed = true;
    this.stopPolling();
    _optionalChain([this, 'access', _5 => _5.loadSubscription, 'optionalAccess', _6 => _6.unsubscribe, 'call', _7 => _7()]);
    this.realtimeSubscription.unsubscribe();
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
  }

   filterPreset(
    items,
    preset,
  ) {
    const activeItems = items.filter(
      (item) => !(_nullishCoalesce(_nullishCoalesce(item.isCanceled, () => ( item.IsCanceled)), () => ( false))),
    );
    const isToday = (value) => {
      const date = new Date(value);
      if (!Number.isFinite(date.getTime())) return false;
      const formatter = new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "Asia/Tehran",
      });
      return formatter.format(date) === formatter.format(new Date());
    };

    const expected = preset === "secretary-confirmed" ? "Confirmed" :
      preset === "secretary-no-answer" ? "NoAnswer" :
      preset === "secretary-cancelled" ? "CancelledByPatient" : "NotCalled";
      const from = this.toDateParam(this.fromDate);
      const to = this.toDateParam(this.toDate);
      return activeItems.filter((item) => {
          const status = _nullishCoalesce(_nullishCoalesce(item.secretaryAnnouncementStatus, () => ( item.SecretaryAnnouncementStatus)), () => ( "NotCalled"));
          if (status !== expected) return false;
          if (!from && !to) return true;
          const day = this.reservationDay(item);
          return !!day && (!from || day >= from) && (!to || day <= to);
      }
      )}

  setTab(tab) {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
    this.pageNumber = 1;
    this.load();
  }

  applySearch() {
    this.pageNumber = 1;
    this.load();
  }

  applyFilters(change


) {
    if ("status" in change) this.statusFilter = _nullishCoalesce(change.status, () => ( null));
    if ("reservationType" in change) {
      this.reservationTypeFilter = _nullishCoalesce(change.reservationType, () => ( null));
    }
    this.pageNumber = 1;
    this.load();
    }

    onFromDateChange(date) {
        this.fromDate = date;
        this.applyDateFilters();
    }

    onToDateChange(date) {
        this.toDate= date;
        this.applyDateFilters();
    }

    clearDateFilters() {
        this.fromDate = null;
        this.toDate = null;
        this.applyFilters({});
    }

    dateFilterLabel() {
        if (this.fromDate && this.toDate) return "بازه تاریخ انتخاب شده";
        if (this.fromDate || this.toDate) return "یک تاریخ انتخاب شده";
        return "فیلتر تاریخ";
    }

    applyDateFilters() {
        const from = this.toDateParam(this.fromDate);
        const to = this.toDateParam(this.toDate);
        if (from && to && from > to) {
            this.showFeedback("تاریخ شروع نباید بعد از تاریخ پایان باشد", "error");
            return;
        }
        this.applyFilters({});
    }

     toDateParam(value) {
        if (!value) return undefined;
        const year = value.getFullYear();
        const month = `${value.getMonth() + 1}`.padStart(2, "0");
        const day = `${value.getDate()}`.padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

     dateParam() {
        const from = this.toDateParam(this.fromDate);
        const to = this.toDateParam(this.toDate);
        return { fromDate: from, toDate: to,from,to };
    }

     reservationDay(item) {
        const date = new Date(this.reservationAt(item));
        return Number.isFinite(date.getTime())
            ? date.toLocaleDateString("en-CA", { timeZone: "Asia/Tehran" }) : "";
    }

  load() {
    if (!this.profileReady) return;
    if (this.loading) {
      this.loadPending = true;
      return;
    }

    const requestId = ++this.loadRequestId;
    this.loading = true;
    this.feedback = "";
    this.markDirty();
    _optionalChain([this, 'access', _8 => _8.loadSubscription, 'optionalAccess', _9 => _9.unsubscribe, 'call', _10 => _10()]);

    if (this.preset) {
      this.loadSubscription = this.secretaryApi
        .getDashboardReservations()
        .pipe(
          map((items) => this.filterPreset(items, this.preset)),
          finalize(() => {
            if (requestId === this.loadRequestId) {
              this.loading = false;
              this.markDirty();
              this.runPendingLoad();
            }
          }),
        )
        .subscribe({
          next: (items) => {
            if (requestId !== this.loadRequestId) return;
            this.totalPages = Math.max(
              1,
              Math.ceil(items.length / this.pageSize),
            );
            const start = (this.pageNumber - 1) * this.pageSize;
            this.items = items.slice(start, start + this.pageSize);
            this.markDirty();
          },
          error: (error) => this.handleLoadError(requestId, error),
        });
      return;
    }

    if (this.activeTab === "queue") {
      this.loadSubscription = this.secretaryApi
        .getReservations({
          includeCanceled: false,
          pageNumber: this.pageNumber,
          pageSize: this.pageSize,
          searchText: this.searchText.trim() || undefined,
          attendanceConfirmationStatus: this.statusFilter,
            reservationType: this.reservationTypeFilter,
            ...this.dateParam(),
        })
        .pipe(
          finalize(() => {
            if (requestId === this.loadRequestId) {
              this.loading = false;
              this.markDirty();
              this.runPendingLoad();
            }
          }),
        )
        .subscribe({
          next: (response) => {
            if (requestId !== this.loadRequestId) return;
            this.items = _nullishCoalesce(response.items, () => ( []));
            this.pageNumber = response.pageNumber;
            this.totalPages = response.totalPages;
            this.markDirty();
          },
          error: (error) => this.handleLoadError(requestId, error),
        });
      return;
    }

    if (this.activeTab === "completed") {
      this.loadSubscription = forkJoin({
        approved: this.secretaryApi.getReservations({
          includeCanceled: false,
          pageNumber: this.pageNumber,
            pageSize: this.pageSize,
            ...this.dateParam(),

        }),
        rejected: this.secretaryApi.getReservations({
          includeCanceled: false,
          pageNumber: this.pageNumber,
            pageSize: this.pageSize,
            ...this.dateParam(),

        }),
      })
        .pipe(
          map(({ approved, rejected }) => {
            const merged = [
              ...(_nullishCoalesce(approved.items, () => ( []))),
              ...(_nullishCoalesce(rejected.items, () => ( []))),
            ].sort(
              (left, right) =>
                new Date(this.reservationAt(right)).getTime() -
                new Date(this.reservationAt(left)).getTime(),
            );
            const totalCount =
              (_nullishCoalesce(approved.totalCount, () => ( 0))) + (_nullishCoalesce(rejected.totalCount, () => ( 0)));
            const totalPages = Math.max(
              _nullishCoalesce(approved.totalPages, () => ( 1)),
              _nullishCoalesce(rejected.totalPages, () => ( 1)),
              Math.ceil(totalCount / this.pageSize),
            );
            return { items: merged, pageNumber: this.pageNumber, totalPages };
          }),
          finalize(() => {
            if (requestId === this.loadRequestId) {
              this.loading = false;
              this.markDirty();
              this.runPendingLoad();
            }
          }),
        )
        .subscribe({
          next: (response) => {
            if (requestId !== this.loadRequestId) return;
            this.items = response.items;
            this.pageNumber = response.pageNumber;
            this.totalPages = response.totalPages;
            this.markDirty();
          },
          error: (error) => this.handleLoadError(requestId, error),
        });
      return;
    }

    this.loadSubscription = this.secretaryApi
      .getReservations({
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
        includeCanceled: this.includeCanceled,
        searchText: this.searchText.trim() || undefined,
        reservationType:
          this.activeTab === "regular"
            ? ReservationType.Regular
            : this.activeTab === "after-sales"
              ? ReservationType.AfterSalesService
              : null,
          sortDirection: "asc",
          ...this.dateParam(),

      })
      .pipe(
        finalize(() => {
          if (requestId === this.loadRequestId) {
            this.loading = false;
            this.markDirty();
            this.runPendingLoad();
          }
        }),
      )
      .subscribe({
        next: (response) => {
          if (requestId !== this.loadRequestId) return;
          this.items = _nullishCoalesce(response.items, () => ( []));
          this.pageNumber = response.pageNumber;
          this.totalPages = response.totalPages;
          this.markDirty();
        },
        error: (error) => this.handleLoadError(requestId, error),
      });
  }

  review(item, patientReceivedService) {
    if (!this.canManage(item)) return;
    const reservationId = this.reservationId(item);
    if (!reservationId) {
      this.showFeedback("شناسه رزرو در دسترس نیست", "error");
      return;
    }
    const doctorName = (this.doctorNames[reservationId] || "").trim();
    if (patientReceivedService && !doctorName) {
      this.approvalReservationId = reservationId;
      this.showFeedback("وارد کردن نام دکتر برای تایید حضور الزامی است", "error");
      this.markDirty();
      return;
    }

    this.savingId = reservationId;
    this.secretaryApi
      .reviewAttendance({
        reservationId,
        patientReceivedService,
        doctorName: patientReceivedService ? doctorName : null,
        note: (this.notes[reservationId] || "").trim() || null,
      })
      .pipe(finalize(() => (this.savingId = null)))
      .subscribe({
        next: (response) => {
          this.showFeedback(
            response.message ||
              (patientReceivedService
                ? "انجام خدمت برای بیمار ثبت شد"
                : "انجام نشدن خدمت برای بیمار ثبت شد"),
            "success",
          );
          delete this.doctorNames[reservationId];
          if (this.approvalReservationId === reservationId) {
            this.approvalReservationId = null;
          }
          this.load();
        },
        error: (error) =>
          this.showFeedback(
            error instanceof Error && error.message
              ? error.message
              : "ثبت بررسی انجام نشد",
            "error",
          ),
      });
  }

  startApproval(item) {
    const reservationId = this.reservationId(item);
    if (!reservationId || !this.canManage(item)) return;
    this.approvalReservationId = reservationId;
    this.feedback = "";
    this.markDirty();
  }

  cancelApproval() {
    this.approvalReservationId = null;
    this.markDirty();
  }

  goToPage(page) {
    if (page < 1 || page > this.totalPages) return;
    this.pageNumber = page;
    this.load();
  }

  emptyCopy() {
    if (this.activeTab === "queue") {
      return "موردی در صف بررسی تایید حضور وجود ندارد.";
    }
    if (this.activeTab === "after-sales")
      return "رزرو خدمات پس از فروشی یافت نشد.";
    if (this.activeTab === "regular") return "رزرو عادی یافت نشد.";
    if (this.activeTab === "completed") {
      return "رزروی با بررسی نهایی منشی یافت نشد.";
    }
    return "رزروی برای نمایش وجود ندارد.";
  }

  canReview(item) {
    if (this.activeTab !== "queue") return false;
    return canSecretaryReviewAttendance(
      readAttendanceStatus(
        item,
        "attendanceConfirmationStatus",
        "AttendanceConfirmationStatus",
      ),
      (_nullishCoalesce(item.isWaitingForSecretaryReview, () => ( item.IsWaitingForSecretaryReview))) ===
        true,
    );
  }

  canManage(item) {
    return this.secretaryApi.canManageReservation(item);
  }

  reservationId(item) {
    const value = _nullishCoalesce(item.id, () => ( item.Id));
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

  reservationTrackKey(item, index) {
    const id = this.reservationId(item);
    return `${_nullishCoalesce(id, () => ( "missing"))}:${index}`;
  }

  patientName(item) {
    return (
      _optionalChain([item, 'access', _11 => _11.patientName, 'optionalAccess', _12 => _12.trim, 'call', _13 => _13()]) || _optionalChain([item, 'access', _14 => _14.PatientName, 'optionalAccess', _15 => _15.trim, 'call', _16 => _16()]) || "بیمار بدون نام"
    );
  }

  patientPhone(item) {
    return (
      _optionalChain([item, 'access', _17 => _17.patientPhoneNumber, 'optionalAccess', _18 => _18.trim, 'call', _19 => _19()]) || _optionalChain([item, 'access', _20 => _20.PatientPhoneNumber, 'optionalAccess', _21 => _21.trim, 'call', _22 => _22()]) || "-"
    );
  }

  patientCity(item) {
    return (
      _optionalChain([item, 'access', _23 => _23.patientCity, 'optionalAccess', _24 => _24.trim, 'call', _25 => _25()]) || _optionalChain([item, 'access', _26 => _26.PatientCity, 'optionalAccess', _27 => _27.trim, 'call', _28 => _28()]) || "شهر ثبت نشده"
    );
  }

  consultantName(item) {
    return (
      _optionalChain([item, 'access', _29 => _29.consultantFullName, 'optionalAccess', _30 => _30.trim, 'call', _31 => _31()]) || _optionalChain([item, 'access', _32 => _32.ConsultantFullName, 'optionalAccess', _33 => _33.trim, 'call', _34 => _34()]) || "-"
    );
  }

  reservationAt(item) {
    return item.reservationAt || item.ReservationAt || "";
  }

  probability(item) {
    return (
      _nullishCoalesce(_nullishCoalesce(item.attendanceProbabilityPercent, () => (
      item.AttendanceProbabilityPercent)), () => (
      "-"))
    );
  }

  consultantClaim(item) {
    return consultantAttendanceClaimLabel(
      _nullishCoalesce(item.consultantSaysPatientAttended, () => ( item.ConsultantSaysPatientAttended)),
    );
  }

  statusLabel(item) {
    return attendanceStatusPresentation(
      readAttendanceStatus(
        item,
        "attendanceConfirmationStatus",
        "AttendanceConfirmationStatus",
      ),
    ).label;
  }

  statusBadge(item) {
    return attendanceStatusPresentation(
      readAttendanceStatus(
        item,
        "attendanceConfirmationStatus",
        "AttendanceConfirmationStatus",
      ),
    ).badgeClass;
  }

  scoreText(item) {
    const applied =
      _nullishCoalesce(item.isAttendanceScoreApplied, () => ( item.IsAttendanceScoreApplied));
    const value = _nullishCoalesce(item.attendanceScoreValue, () => ( item.AttendanceScoreValue));
    if (applied && value !== null && value !== undefined) {
      return value > 0 ? `+${value}` : `${value}`;
    }

    return attendanceScoreLabel(
      _nullishCoalesce(item.secretaryApprovedConsultantConfirmation, () => (
        item.SecretaryApprovedConsultantConfirmation)),
    );
  }

  scoreClass(item) {
    const text = this.scoreText(item);
    if (text.startsWith("+")) return "success";
    if (text.startsWith("-")) return "danger";
    return "muted";
  }

  formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    return Number.isFinite(date.getTime())
      ? new Intl.DateTimeFormat("fa-IR", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(date)
      : value;
  }

  formatAppointmentTime(value) {
    return formatReservationTime(value);
  }

  displayReservationAt(item) {
    return (
      _nullishCoalesce(_nullishCoalesce(item.reservationAtPersian, () => (
      item.ReservationAtPersian)), () => (
      this.formatAppointmentTime(this.reservationAt(item))))
    );
  }

  serviceResult(item) {
    const result = _nullishCoalesce(item.patientReceivedService, () => ( item.PatientReceivedService));
    return result === true
      ? "خدمت انجام شد"
      : result === false
        ? "خدمت انجام نشد"
        : "هنوز بررسی نشده";
  }

   handleLoadError(requestId, error) {
    if (requestId !== this.loadRequestId) return;
    this.items = [];
    this.showFeedback(
      error instanceof Error && error.message
        ? error.message
        : "دریافت رزروها انجام نشد",
      "error",
    );
  }

   startPolling() {
    this.stopPolling();
    this.pollId = setInterval(() => {
      if (
        !this.profileReady ||
        this.loading ||
        this.savingId ||
        this.destroyed ||
        document.visibilityState === "hidden"
      ) {
        return;
      }
      this.load();
    }, 120000);
  }

   loadInitial() {
    if (this.initialLoadStarted) return;
    this.initialLoadStarted = true;
    this.load();
  }

   runPendingLoad() {
    if (!this.loadPending || this.destroyed) return;
    this.loadPending = false;
    queueMicrotask(() => this.load());
  }

   stopPolling() {
    if (this.pollId) {
      clearInterval(this.pollId);
      this.pollId = null;
    }
  }

   showFeedback(message, type) {
    this.feedback = message;
    this.feedbackType = type;
    if (type === "success") {
      this.toast.success(message);
      return;
    }
    this.toast.error(message);
    this.markDirty();
  }
}
