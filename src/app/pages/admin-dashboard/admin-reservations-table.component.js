 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,







} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { finalize, } from "rxjs";





import {
  attendanceStatusPresentation,
  consultantAttendanceClaimLabel,
  readAttendanceStatus,
} from "../../core/reservation/reservation-attendance";
import {
  downloadBlob,
  reportFileName,
} from "../../utils/file-download.util";
import { BaseDatepickerComponent } from "../../shared/base/base-datepicker/base-datepicker.component";
import {

  TableComponent,
} from "../../shared/base/table/table.component";
import { NG_MODEL_UPDATE_ON_BLUR } from "../../shared/forms/ng-model-options";
import { formatIranDateTime, formatReservationTime, startOfIranDay, toIranDateInputValue } from "../../utils/iran-datetime.util";





@Component({
  selector: "app-admin-reservations-table",
  standalone: true,
  imports: [CommonModule, FormsModule, BaseDatepickerComponent, TableComponent],
  templateUrl: "./admin-reservations-table.component.html",
  styleUrl: "./admin-reservations-table.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminReservationsTableComponent  {
  Input() __init() {this.mode = "system"}
  Input() __init2() {this.profileId = null}
  Input() __init3() {this.title = "مدیریت رزروها و تایید حضور"}

   __init4() {this.ngModelBlurOptions = NG_MODEL_UPDATE_ON_BLUR}
   __init5() {this.datePickerLabel = { fa: "انتخاب روز", en: "Select day" }}

  __init6() {this.view = "reservations"}
  __init7() {this.selectedDate = startOfIranDay()}
  __init8() {this.selectedDatePersian = ""}
  __init9() {this.items = []}
  __init10() {this.loading = false}
  __init11() {this.exportingReservations = false}
  __init12() {this.exportingAttendance = false}
  __init13() {this.feedback = ""}
  __init14() {this.totalCount = 0}
  __init15() {this.totalPages = 1}
  
   __init16() {this.pollId = null}
   __init17() {this.loadPending = false}
   __init18() {this.destroyed = false}
   __init19() {this.initialLoadStarted = false}
    __init20() {this.onVisibilityChange = () => {
    if (document.visibilityState === "visible") this.load();
  }}

  __init21() {this.filters = {
    pageNumber: 1,
    pageSize: 10,
    attendanceConfirmationStatus: null,
  }}

   __init22() {this.columns = [
    {
      key: "patientName",
      label: "بیمار",
      value: (row) => this.patientName(row),
    },
    {
      key: "patientPhone",
      label: "موبایل",
      value: (row) => this.patientPhone(row),
    },
    {
      key: "consultant",
      label: "مشاور",
      value: (row) => this.consultantName(row),
    },
    {
      key: "reservationAt",
      label: "زمان مراجعه بیمار",
      value: (row) => formatReservationTime(this.reservationAt(row)),
    },
    {
      key: "status",
      label: "وضعیت",
      value: (row) => attendanceStatusPresentation(readAttendanceStatus(row)).label,
      badge: (row) =>
        attendanceStatusPresentation(readAttendanceStatus(row)).badgeClass,
    },
    {
      key: "consultantClaim",
      label: "اعلام مشاور",
      value: (row) =>
        consultantAttendanceClaimLabel(
          _nullishCoalesce(row.consultantSaysPatientAttended, () => ( row.ConsultantSaysPatientAttended)),
        ),
    },
    {
      key: "secretaryAnnouncement",
      label: "اعلام منشی",
      value: (row) => this.secretaryAnnouncementLabel(row),
      badge: (row) => this.secretaryAnnouncementBadge(row),
    },
    {
      key: "city",
      label: "شهر",
      value: (row) => this.patientCity(row),
    },
  ]}

  secretaryAnnouncementLabel(row) {
    const status = _nullishCoalesce(_nullishCoalesce(row.secretaryAnnouncementStatus, () => ( row.SecretaryAnnouncementStatus)), () => ( "NotCalled"));
    if (status === "Confirmed") return "🟢 تایید شده";
    if (status === "NoAnswer") return "🟠 پاسخ نداد";
    if (status === "CancelledByPatient") return "🔴 لغو شده";
    if (status === "NotCalled") return "⚪ تماس نشده";
    if (status === "RescheduleRequested") return "درخواست تغییر زمان";
    if (status === "CallAgain") return "تماس مجدد";
    return status;
  }

  secretaryAnnouncementBadge(row) {
    const status = _nullishCoalesce(_nullishCoalesce(row.secretaryAnnouncementStatus, () => ( row.SecretaryAnnouncementStatus)), () => ( "NotCalled"));
    return status === "Confirmed" ? "success" : status === "CancelledByPatient" ? "danger" : status === "NoAnswer" ? "warn" : "muted";
  }

  constructor(
     adminApi,
    reservationSync,
     cdr,
  ) {;this.adminApi = adminApi;this.cdr = cdr;AdminReservationsTableComponent.prototype.__init.call(this);AdminReservationsTableComponent.prototype.__init2.call(this);AdminReservationsTableComponent.prototype.__init3.call(this);AdminReservationsTableComponent.prototype.__init4.call(this);AdminReservationsTableComponent.prototype.__init5.call(this);AdminReservationsTableComponent.prototype.__init6.call(this);AdminReservationsTableComponent.prototype.__init7.call(this);AdminReservationsTableComponent.prototype.__init8.call(this);AdminReservationsTableComponent.prototype.__init9.call(this);AdminReservationsTableComponent.prototype.__init10.call(this);AdminReservationsTableComponent.prototype.__init11.call(this);AdminReservationsTableComponent.prototype.__init12.call(this);AdminReservationsTableComponent.prototype.__init13.call(this);AdminReservationsTableComponent.prototype.__init14.call(this);AdminReservationsTableComponent.prototype.__init15.call(this);AdminReservationsTableComponent.prototype.__init16.call(this);AdminReservationsTableComponent.prototype.__init17.call(this);AdminReservationsTableComponent.prototype.__init18.call(this);AdminReservationsTableComponent.prototype.__init19.call(this);AdminReservationsTableComponent.prototype.__init20.call(this);AdminReservationsTableComponent.prototype.__init21.call(this);AdminReservationsTableComponent.prototype.__init22.call(this);
    this.refreshSubscription = reservationSync.refreshRequested$.subscribe(() => this.load());
  }

  ngOnDestroy() {
    this.destroyed = true;
    this.refreshSubscription.unsubscribe();
    this.stopPolling();
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
  }

  ngOnInit() {
    this.syncProfileFilter();
    this.syncDateFilter();
    this.syncSelectedDatePersian();
    this.loadInitial();
    this.startPolling();
    document.addEventListener("visibilitychange", this.onVisibilityChange);
  }

  ngOnChanges(changes) {
    if (changes["profileId"] || changes["mode"]) {
      this.syncProfileFilter();
      this.filters.pageNumber = 1;
      const isInitialChange =
        (_nullishCoalesce(_optionalChain([changes, 'access', _ => _["profileId"], 'optionalAccess', _2 => _2.firstChange]), () => ( true))) &&
        (_nullishCoalesce(_optionalChain([changes, 'access', _3 => _3["mode"], 'optionalAccess', _4 => _4.firstChange]), () => ( true)));
      if (isInitialChange) {
        this.loadInitial();
      } else {
        this.load();
      }
    }
  }

  setView(view) {
    this.view = view;
    this.filters.pageNumber = 1;
    this.load();
  }

  onDateChange(date) {
    this.selectedDate = date;
    this.syncDateFilter();
    this.syncSelectedDatePersian();
    this.filters.pageNumber = 1;
    this.load();
  }

  applyFilters() {
    this.syncDateFilter();
    this.syncSelectedDatePersian();
    this.filters.pageNumber = 1;
    this.load();
  }

  changePage(page) {
    this.filters.pageNumber = page;
    this.load();
  }

  load() {
    if (this.destroyed) return;
    if (this.loading) {
      this.loadPending = true;
      return;
    }

    this.loading = true;
    this.feedback = "";

    const source$ =
      this.view === "attendanceConfirmations"
        ? this.adminApi.getConsultantAttendanceConfirmations(this.filters)
        : this.adminApi.getSecretaryReservations(this.filters);

    source$
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
          this.runPendingLoad();
        }),
      )
      .subscribe({
        next: (response) => {
          this.items = _nullishCoalesce(response.items, () => ( []));
          this.totalCount = _nullishCoalesce(response.totalCount, () => ( this.items.length));
          this.totalPages = Math.max(
            1,
            _nullishCoalesce(response.totalPages, () => (
              Math.ceil(this.totalCount / this.filters.pageSize))),
          );
        },
        error: (error) => {
          this.feedback = this.errorMessage(error, "دریافت رزروها انجام نشد");
        },
      });
  }

  exportReservations() {
    this.exportingReservations = true;
    this.adminApi
      .exportReservationsReport(this.exportFilters())
      .pipe(
        finalize(() => {
          this.exportingReservations = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (blob) =>
          downloadBlob(blob, reportFileName("reservations-report")),
        error: (error) => {
          this.feedback = this.errorMessage(error, "دریافت گزارش رزروها انجام نشد");
        },
      });
  }

  exportAttendanceConfirmations() {
    this.exportingAttendance = true;
    this.adminApi
      .exportConsultantAttendanceConfirmationsReport(this.exportFilters())
      .pipe(
        finalize(() => {
          this.exportingAttendance = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (blob) =>
          downloadBlob(
            blob,
            reportFileName("consultant-attendance-confirmations"),
          ),
        error: (error) => {
          this.feedback = this.errorMessage(
            error,
            "دریافت گزارش تایید حضور انجام نشد",
          );
        },
      });
  }

  emptyText() {
    if (this.selectedDatePersian) {
      return this.view === "attendanceConfirmations"
        ? `تایید حضوری برای ${this.selectedDatePersian} وجود ندارد.`
        : `رزروی برای ${this.selectedDatePersian} وجود ندارد.`;
    }

    return this.view === "attendanceConfirmations"
      ? "تایید حضوری برای نمایش وجود ندارد."
      : "رزروی برای نمایش وجود ندارد.";
  }

   syncProfileFilter() {
    this.filters.consultantProfileId =
      this.mode === "consultant" && this.profileId ? this.profileId : null;
  }

   syncDateFilter() {
    this.filters.date = this.toDateString(this.selectedDate);
    delete this.filters.from;
    delete this.filters.to;
    delete this.filters.includeCanceled;
  }

   exportFilters()



 {
    const consultantProfileId = _nullishCoalesce(this.filters.consultantProfileId, () => ( undefined));
    const date = this.toDateString(this.selectedDate);
    return {
      consultantProfileId,
      from: date,
      to: date,
    };
  }

   syncSelectedDatePersian() {
    this.selectedDatePersian = this.selectedDate.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Tehran",
    });
  }

   toDateString(date) {
    return toIranDateInputValue(date);
  }

   patientName(row) {
    return _nullishCoalesce(_nullishCoalesce(row.patientName, () => ( row.PatientName)), () => ( "-"));
  }

   patientPhone(row) {
    return _nullishCoalesce(_nullishCoalesce(row.patientPhoneNumber, () => ( row.PatientPhoneNumber)), () => ( "-"));
  }

   patientCity(row) {
    return _nullishCoalesce(_nullishCoalesce(row.patientCity, () => ( row.PatientCity)), () => ( "-"));
  }

   consultantName(row) {
    return _nullishCoalesce(_nullishCoalesce(row.consultantFullName, () => ( row.ConsultantFullName)), () => ( "-"));
  }

   reservationAt(row) {
    return _nullishCoalesce(_nullishCoalesce(row.reservationAt, () => ( row.ReservationAt)), () => ( ""));
  }

   formatDateTime(value) {
    return formatIranDateTime(value);
  }

   startPolling() {
    this.stopPolling();
    this.pollId = setInterval(() => {
      if (this.loading || document.visibilityState === "hidden") return;
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
    if (!this.pollId) return;
    clearInterval(this.pollId);
    this.pollId = null;
  }

   errorMessage(error, fallback) {
    return error instanceof Error && error.message ? error.message : fallback;
  }
}
