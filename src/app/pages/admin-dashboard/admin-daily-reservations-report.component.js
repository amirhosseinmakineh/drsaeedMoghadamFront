 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { finalize } from "rxjs";









import { BaseDatepickerComponent } from "../../shared/base/base-datepicker/base-datepicker.component";
import { downloadBlob } from "../../utils/file-download.util";
import { formatDentalServices } from "../../core/reservation/dental-services";
import {
  formatIranDateTime,
  formatReservationTime,
  nowInIran,
  toIranDateInputValue,
} from "../../utils/iran-datetime.util";

@Component({
  selector: "app-admin-daily-reservations-report",
  standalone: true,
  imports: [CommonModule, FormsModule, BaseDatepickerComponent],
  templateUrl: "./admin-daily-reservations-report.component.html",
  styleUrl: "./admin-daily-reservations-report.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDailyReservationsReportComponent  {
   __init() {this.dentalServicesLabel = formatDentalServices}
  __init2() {this.selectedDate = nowInIran()}
  __init3() {this.consultantProfileId = null}
  __init4() {this.reservationOwnerType = "Consultant"}
  __init5() {this.secretaryUserId = null}
  __init6() {this.requestStatus = null}
  __init7() {this.includeAllReservations = false}
  __init8() {this.consultants = []}
  __init9() {this.consultantsLoading = false}
  __init10() {this.consultantsLoadError = ""}
  __init11() {this.secretaries = []}
  __init12() {this.secretariesLoading = false}
  __init13() {this.secretariesLoadError = ""}
  __init14() {this.report = null}
  __init15() {this.loading = false}
  __init16() {this.downloading = false}
  __init17() {this.errorMessage = ""}

   __init18() {this.createdDatePickerLabel = { fa: "تاریخ ثبت رزرو", en: "Created date" }}
   __init19() {this.appointmentDatePickerLabel = { fa: "تاریخ مراجعه", en: "Appointment date" }}
   __init20() {this.requestStatuses = [
    { value: 1, label: "در انتظار بررسی منشی" },
    { value: 2, label: "تایید شده" },
    { value: 3, label: "زمان‌بندی مجدد" },
    { value: 4, label: "رد شده" },
    { value: 5, label: "لغو شده" },
    { value: 6, label: "در انتظار تایید بیمار" },
    { value: 7, label: "نیازمند پیگیری" },
  ]}

  constructor(
      adminApi,
      toast,
      cdr,
  ) {;this.adminApi = adminApi;this.toast = toast;this.cdr = cdr;AdminDailyReservationsReportComponent.prototype.__init.call(this);AdminDailyReservationsReportComponent.prototype.__init2.call(this);AdminDailyReservationsReportComponent.prototype.__init3.call(this);AdminDailyReservationsReportComponent.prototype.__init4.call(this);AdminDailyReservationsReportComponent.prototype.__init5.call(this);AdminDailyReservationsReportComponent.prototype.__init6.call(this);AdminDailyReservationsReportComponent.prototype.__init7.call(this);AdminDailyReservationsReportComponent.prototype.__init8.call(this);AdminDailyReservationsReportComponent.prototype.__init9.call(this);AdminDailyReservationsReportComponent.prototype.__init10.call(this);AdminDailyReservationsReportComponent.prototype.__init11.call(this);AdminDailyReservationsReportComponent.prototype.__init12.call(this);AdminDailyReservationsReportComponent.prototype.__init13.call(this);AdminDailyReservationsReportComponent.prototype.__init14.call(this);AdminDailyReservationsReportComponent.prototype.__init15.call(this);AdminDailyReservationsReportComponent.prototype.__init16.call(this);AdminDailyReservationsReportComponent.prototype.__init17.call(this);AdminDailyReservationsReportComponent.prototype.__init18.call(this);AdminDailyReservationsReportComponent.prototype.__init19.call(this);AdminDailyReservationsReportComponent.prototype.__init20.call(this);}

  ngOnInit() {
    this.loadConsultants(true);
    this.loadSecretaries(true);
    this.loadReport();
  }

  setDate(date) {
    this.selectedDate = date;
    this.cdr.markForCheck();
  }

  setReservationOwnerType(type) {
    this.reservationOwnerType = type;
    this.consultantProfileId = null;
    this.secretaryUserId = null;
    if (type === "Consultant") {
      this.loadConsultants();
    } else {
      this.loadSecretaries();
    }
    this.cdr.markForCheck();
  }

  setIncludeAllReservations(includeAll) {
    this.includeAllReservations = includeAll;
    this.cdr.markForCheck();
    this.loadReport();
  }

  loadReport() {
    if (this.loading) return;
    this.loading = true;
    this.errorMessage = "";
    this.cdr.markForCheck();
    this.adminApi
      .getDailyReservationsReport(this.filters())
      .pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (report) => { this.report = report; this.cdr.markForCheck(); },
        error: (error) => {
          this.errorMessage = this.errorText(error);
          this.toast.error(this.errorMessage);
          this.cdr.markForCheck();
        },
      });
  }

  download() {
    if (this.downloading) return;
    const filters = this.filters();
    this.downloading = true;
    this.cdr.markForCheck();
    this.adminApi
      .exportDailyReservationsReport(filters)
      .pipe(finalize(() => { this.downloading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (blob) => {
          const suffix = filters.includeAll
            ? "all"
            : filters.date.replaceAll("-", "");
          downloadBlob(blob, `daily-reservations-${suffix}.csv`);
          this.toast.success("فایل گزارش روزانه رزروها دانلود شد");
        },
        error: (error) => this.toast.error(this.errorText(error)),
      });
  }

  formatDateTime(value) {
    return formatIranDateTime(value);
  }

  formatAppointmentTime(value) {
    return formatReservationTime(value);
  }

  secretaryAnnouncement(item) {
    return (
      _optionalChain([item, 'access', _2 => _2.secretaryAnnouncement, 'optionalAccess', _3 => _3.trim, 'call', _4 => _4()]) ||
      _optionalChain([item, 'access', _5 => _5.SecretaryAnnouncement, 'optionalAccess', _6 => _6.trim, 'call', _7 => _7()]) ||
      _optionalChain([item, 'access', _8 => _8.secretaryAnnouncementDescription, 'optionalAccess', _9 => _9.trim, 'call', _10 => _10()]) ||
      _optionalChain([item, 'access', _11 => _11.SecretaryAnnouncementDescription, 'optionalAccess', _12 => _12.trim, 'call', _13 => _13()]) ||
      this.secretaryAnnouncementStatusLabel(
        _nullishCoalesce(item.secretaryAnnouncementStatus, () => ( item.SecretaryAnnouncementStatus)),
      )
    );
  }

   secretaryAnnouncementStatusLabel(status) {
    if (status === "Confirmed") return "تایید شده";
    if (status === "NoAnswer") return "پاسخ نداد";
    if (status === "CancelledByPatient") return "لغو توسط بیمار";
    if (status === "RescheduleRequested") return "درخواست تغییر زمان";
    if (status === "CallAgain") return "تماس مجدد";
    if (status === "NotCalled") return "تماس نشده";
    return _optionalChain([status, 'optionalAccess', _14 => _14.trim, 'call', _15 => _15()]) || "-";
  }

  trackReservation(_, item) {
    return item.reservationId;
  }

  consultantId(consultant) {
    return _nullishCoalesce(consultant.profileId, () => ( consultant.ProfileId));
  }

  consultantName(consultant) {
    const fullName = [
      consultant.firstName || consultant.FirstName,
      consultant.lastName || consultant.LastName,
    ].filter(Boolean).join(" ");
    return fullName || `مشاور ${this.consultantId(consultant)}`;
  }

  secretaryId(secretary) {
    return secretary.id || secretary.Id || "";
  }

  secretaryName(secretary) {
    const fullName = [
      secretary.firstName || secretary.FirstName,
      secretary.lastName || secretary.LastName,
    ].filter(Boolean).join(" ");
    return fullName || secretary.phoneNumber || secretary.PhoneNumber || "منشی";
  }

   filters() {
    if (this.includeAllReservations) {
      return { includeAll: true };
    }

    return {
      date: toIranDateInputValue(this.selectedDate),
      reservationOwnerType: this.reservationOwnerType,
      ...(this.reservationOwnerType === "Consultant" &&
      this.consultantProfileId !== null
        ? { consultantProfileId: this.consultantProfileId }
        : {}),
      ...(this.reservationOwnerType === "Secretary" && this.secretaryUserId
        ? { secretaryUserId: this.secretaryUserId }
        : {}),
      ...(this.requestStatus ? { requestStatus: this.requestStatus } : {}),
    };
  }

  loadConsultants(force = false) {
    if (this.consultantsLoading) return;
    if (!force && this.consultants.length) return;

    this.consultantsLoading = true;
    this.consultantsLoadError = "";
    this.cdr.markForCheck();
    this.adminApi
      .getConsultantsList({ pageNumber: 1, pageSize: 500 })
      .pipe(finalize(() => {
        this.consultantsLoading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: ({ items }) => {
          this.consultants = items.filter((item) =>
            Number.isFinite(this.consultantId(item)),
          );
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.consultantsLoadError = this.errorText(error);
          this.toast.error(this.consultantsLoadError);
          this.cdr.markForCheck();
        },
      });
  }
  loadSecretaries(force = false) {
    if (this.secretariesLoading) return;
    if (!force && this.secretaries.length) return;

    this.secretariesLoading = true;
    this.secretariesLoadError = "";
    this.cdr.markForCheck();
    this.adminApi
      .getSecretaries({ pageNumber: 1, pageSize: 500 })
      .pipe(finalize(() => {
        this.secretariesLoading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: ({ items }) => {
          this.secretaries = items.filter((item) => !!this.secretaryId(item));
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.secretariesLoadError = this.errorText(error);
          this.toast.error(this.secretariesLoadError);
          this.cdr.markForCheck();
        },
      });
  }

   errorText(error) {
    return error instanceof Error && error.message
      ? error.message
      : "خطا در دریافت گزارش. لطفاً دوباره تلاش کنید.";
  }
}
