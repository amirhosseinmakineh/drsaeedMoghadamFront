 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,







} from "@angular/core";
import { FormsModule } from "@angular/forms";

import { finalize, } from "rxjs";
import {



  ReservationType,

} from "../../core/secretary/secretary-dashboard.service";

import {
  AttendanceConfirmationStatus,
  attendanceStatusPresentation,
  readAttendanceStatus,
} from "../../core/reservation/reservation-attendance";
import {
  BaseDatepickerComponent,
  BaseDialogComponent,
} from "../../shared/base";



import {
  formatReservationTime,
  toIranTimeInputValue,
} from "../../utils/iran-datetime.util";
import { DENTAL_SERVICE_OPTIONS, dentalServicesOf, formatDentalServices } from "../../core/reservation/dental-services";
import { reservationPatientCount, validatePatientCount } from "../../core/reservation/reservation.model";

// This workflow status is returned for display/actions and is deliberately not
// used by the attendance filter sent to SecretaryReservations.
var ReservationRequestStatus; (function (ReservationRequestStatus) {
  const PendingSecretaryReview = 1; ReservationRequestStatus[ReservationRequestStatus["PendingSecretaryReview"] = PendingSecretaryReview] = "PendingSecretaryReview";
  const Confirmed = 2; ReservationRequestStatus[ReservationRequestStatus["Confirmed"] = Confirmed] = "Confirmed";
  const Rescheduled = 3; ReservationRequestStatus[ReservationRequestStatus["Rescheduled"] = Rescheduled] = "Rescheduled";
  const Rejected = 4; ReservationRequestStatus[ReservationRequestStatus["Rejected"] = Rejected] = "Rejected";
  const Canceled = 5; ReservationRequestStatus[ReservationRequestStatus["Canceled"] = Canceled] = "Canceled";
  const WaitingPatientConfirmation = 6; ReservationRequestStatus[ReservationRequestStatus["WaitingPatientConfirmation"] = WaitingPatientConfirmation] = "WaitingPatientConfirmation";
  const NeedsFollowUp = 7; ReservationRequestStatus[ReservationRequestStatus["NeedsFollowUp"] = NeedsFollowUp] = "NeedsFollowUp";
  const Attended = 8; ReservationRequestStatus[ReservationRequestStatus["Attended"] = Attended] = "Attended";
  const NoShow = 9; ReservationRequestStatus[ReservationRequestStatus["NoShow"] = NoShow] = "NoShow";
})(ReservationRequestStatus || (ReservationRequestStatus = {}));











const SECRETARY_ANNOUNCEMENT_OPTIONS


 = [
  { value: "NotCalled", label: "تماس نشده" },
  { value: "NoAnswer", label: "پاسخ نداد" },
  { value: "Confirmed", label: "تایید شده" },
  { value: "CancelledByPatient", label: "لغو توسط بیمار" },
  { value: "RescheduleRequested", label: "درخواست تغییر زمان" },
  { value: "CallAgain", label: "تماس مجدد" },
];

const STATUS_OPTIONS = [
  AttendanceConfirmationStatus.PendingConsultantConfirmation,
  AttendanceConfirmationStatus.ConsultantConfirmedPresent,
  AttendanceConfirmationStatus.ConsultantConfirmedAbsent,
  AttendanceConfirmationStatus.SecretaryApproved,
  AttendanceConfirmationStatus.SecretaryRejected,
].map((value) => ({
  value,
  label: attendanceStatusPresentation(value).label,
})) 


;

@Component({
  selector: "app-secretary-reservation-requests",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BaseDatepickerComponent,
    BaseDialogComponent,
  ],
  templateUrl: "./secretary-reservation-requests.component.html",
  styleUrl: "./secretary-reservation-requests.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecretaryReservationRequestsComponent
  
{
  Input() __init() {this.profileReady = false}
  Input() __init2() {this.preset = null}
  Input() __init3() {this.canCreate = false}

   __init4() {this.statusOptions = STATUS_OPTIONS}

   __init5() {this.secretaryAnnouncementOptions = SECRETARY_ANNOUNCEMENT_OPTIONS}

  __init6() {this.items = []}
  __init7() {this.totalCount = 0}
  __init8() {this.pageNumber = 1}
  __init9() {this.pageSize = 20}
  __init10() {this.totalPages = 1}
  __init11() {this.loading = false}
  __init12() {this.saving = false}
  __init13() {this.errorMessage = ""}
  __init14() {this.quickFilter = "all"}
  __init15() {this.searchText = ""}
  __init16() {this.consultantName = ""}
  __init17() {this.statusFilter = null}
  __init18() {this.reservationStatus = ""}
  __init19() {this.secretaryAnnouncementFilter = null}
  __init20() {this.reservationDate = null}
  __init21() {this.fromDate = null}
  __init22() {this.toDate = null}
  __init23() {this.dateFilterMode = "exact"}
  __init24() {this.sortDirection = "asc"}
  __init25() {this.reservationTypeFilter = "all"}

  __init26() {this.createDialogOpen = false}
  __init27() {this.createLeadAssignmentId = null}
  __init28() {this.createConsultantProfileId = null}
  __init29() {this.createDate = null}
  __init30() {this.createTime = ""}
  __init31() {this.createDescription = ""}
  __init32() {this.createServiceTitle = ""}
  __init33() {this.createReservationType = ReservationType.AfterSalesService}
  __init34() {this.createDentalServices = []}
   __init35() {this.dentalServiceOptions = DENTAL_SERVICE_OPTIONS}
   __init36() {this.dentalServicesLabel = formatDentalServices}
  __init37() {this.createOptionsLoading = false}
  __init38() {this.createOptionsError = ""}
  __init39() {this.patientSearch = ""}
  __init40() {this.patientOptions = []}

  __init41() {this.selected = null}
  __init42() {this.dialogMode = null}
  __init43() {this.detailsLoading = false}
  __init44() {this.detailsError = ""}
  __init45() {this.note = ""}
  __init46() {this.reasonCode = null}
  __init47() {this.rejectionText = ""}
  __init48() {this.newDate = null}
  __init49() {this.newTime = ""}
  __init50() {this.editDentalServices = []}
  __init51() {this.editPatientCount = 1}
  __init52() {this.contactResult = "NotCalled"}
  __init53() {this.visitResult = 2}

   __init54() {this.loadSubscription = null}
   __init55() {this.detailsSubscription = null}
  
   __init56() {this.requestId = 0}

  constructor(
     api,
     auth,
     route,
     router,
     toast,
     reservationSync,
     cdr,
  ) {;this.api = api;this.auth = auth;this.route = route;this.router = router;this.toast = toast;this.reservationSync = reservationSync;this.cdr = cdr;SecretaryReservationRequestsComponent.prototype.__init.call(this);SecretaryReservationRequestsComponent.prototype.__init2.call(this);SecretaryReservationRequestsComponent.prototype.__init3.call(this);SecretaryReservationRequestsComponent.prototype.__init4.call(this);SecretaryReservationRequestsComponent.prototype.__init5.call(this);SecretaryReservationRequestsComponent.prototype.__init6.call(this);SecretaryReservationRequestsComponent.prototype.__init7.call(this);SecretaryReservationRequestsComponent.prototype.__init8.call(this);SecretaryReservationRequestsComponent.prototype.__init9.call(this);SecretaryReservationRequestsComponent.prototype.__init10.call(this);SecretaryReservationRequestsComponent.prototype.__init11.call(this);SecretaryReservationRequestsComponent.prototype.__init12.call(this);SecretaryReservationRequestsComponent.prototype.__init13.call(this);SecretaryReservationRequestsComponent.prototype.__init14.call(this);SecretaryReservationRequestsComponent.prototype.__init15.call(this);SecretaryReservationRequestsComponent.prototype.__init16.call(this);SecretaryReservationRequestsComponent.prototype.__init17.call(this);SecretaryReservationRequestsComponent.prototype.__init18.call(this);SecretaryReservationRequestsComponent.prototype.__init19.call(this);SecretaryReservationRequestsComponent.prototype.__init20.call(this);SecretaryReservationRequestsComponent.prototype.__init21.call(this);SecretaryReservationRequestsComponent.prototype.__init22.call(this);SecretaryReservationRequestsComponent.prototype.__init23.call(this);SecretaryReservationRequestsComponent.prototype.__init24.call(this);SecretaryReservationRequestsComponent.prototype.__init25.call(this);SecretaryReservationRequestsComponent.prototype.__init26.call(this);SecretaryReservationRequestsComponent.prototype.__init27.call(this);SecretaryReservationRequestsComponent.prototype.__init28.call(this);SecretaryReservationRequestsComponent.prototype.__init29.call(this);SecretaryReservationRequestsComponent.prototype.__init30.call(this);SecretaryReservationRequestsComponent.prototype.__init31.call(this);SecretaryReservationRequestsComponent.prototype.__init32.call(this);SecretaryReservationRequestsComponent.prototype.__init33.call(this);SecretaryReservationRequestsComponent.prototype.__init34.call(this);SecretaryReservationRequestsComponent.prototype.__init35.call(this);SecretaryReservationRequestsComponent.prototype.__init36.call(this);SecretaryReservationRequestsComponent.prototype.__init37.call(this);SecretaryReservationRequestsComponent.prototype.__init38.call(this);SecretaryReservationRequestsComponent.prototype.__init39.call(this);SecretaryReservationRequestsComponent.prototype.__init40.call(this);SecretaryReservationRequestsComponent.prototype.__init41.call(this);SecretaryReservationRequestsComponent.prototype.__init42.call(this);SecretaryReservationRequestsComponent.prototype.__init43.call(this);SecretaryReservationRequestsComponent.prototype.__init44.call(this);SecretaryReservationRequestsComponent.prototype.__init45.call(this);SecretaryReservationRequestsComponent.prototype.__init46.call(this);SecretaryReservationRequestsComponent.prototype.__init47.call(this);SecretaryReservationRequestsComponent.prototype.__init48.call(this);SecretaryReservationRequestsComponent.prototype.__init49.call(this);SecretaryReservationRequestsComponent.prototype.__init50.call(this);SecretaryReservationRequestsComponent.prototype.__init51.call(this);SecretaryReservationRequestsComponent.prototype.__init52.call(this);SecretaryReservationRequestsComponent.prototype.__init53.call(this);SecretaryReservationRequestsComponent.prototype.__init54.call(this);SecretaryReservationRequestsComponent.prototype.__init55.call(this);SecretaryReservationRequestsComponent.prototype.__init56.call(this);
    this.realtimeSubscription = this.reservationSync.refreshRequested$.subscribe(
      () => {
        if (this.profileReady && !this.saving) this.load();
      },
    );
  }

  ngOnInit() {
    this.restoreFromUrl();
    if (this.profileReady) this.load();
  }

  ngOnChanges(changes) {
    if (_optionalChain([changes, 'access', _ => _["preset"], 'optionalAccess', _2 => _2.currentValue])) {
      this.applyPreset(changes["preset"].currentValue);
    }
    if (_optionalChain([changes, 'access', _3 => _3["profileReady"], 'optionalAccess', _4 => _4.currentValue]) === true) this.load();
  }

  ngOnDestroy() {
    _optionalChain([this, 'access', _5 => _5.loadSubscription, 'optionalAccess', _6 => _6.unsubscribe, 'call', _7 => _7()]);
    _optionalChain([this, 'access', _8 => _8.detailsSubscription, 'optionalAccess', _9 => _9.unsubscribe, 'call', _10 => _10()]);
    this.realtimeSubscription.unsubscribe();
  }

  setQuickFilter(value) {
    this.quickFilter = value;
    this.statusFilter = this.statusForQuickFilter(value);
    this.applyFilters();
  }

  setReservationTypeFilter(value) {
    this.reservationTypeFilter = value;
    this.applyFilters();
  }

  applyFilters() {
    this.pageNumber = 1;
    this.syncUrl();
    this.load();
  }

  searchReservations() {
    this.searchText = this.searchText.trim();
    this.consultantName = this.consultantName.trim();
    this.applyFilters();
  }

  onReservationStatusChange(event) {
    this.reservationStatus = (event.target ).value;
    this.applyFilters();
  }

  clearFilters() {
    this.quickFilter = "all";
    this.searchText = "";
    this.consultantName = "";
    this.statusFilter = null;
    this.reservationStatus = "";
    this.secretaryAnnouncementFilter = null;
    this.reservationDate = null;
    this.fromDate = null;
    this.toDate = null;
    this.sortDirection = "asc";
    this.reservationTypeFilter = "all";
    this.applyFilters();
  }

  clearDateFilters() {
    this.reservationDate = null;
    this.fromDate = null;
    this.toDate = null;
    this.applyFilters();
  }

  setDateFilterMode(mode) {
    this.dateFilterMode = mode;
    if (mode === "exact") {
      this.fromDate = null;
      this.toDate = null;
    } else {
      this.reservationDate = null;
    }
  }

  dateFilterLabel() {
    const activeCount = [
      this.reservationDate,
      this.fromDate,
      this.toDate,
    ].filter(Boolean).length;
    if (!activeCount) return "فیلتر تاریخ";
    if (this.reservationDate) return "تاریخ رزرو انتخاب شده";
    return activeCount === 2 ? "بازه تاریخ انتخاب شده" : "یک تاریخ انتخاب شده";
  }

  changePageSize() {
    this.pageNumber = 1;
    this.syncUrl();
    this.load();
  }

  goToPage(page) {
    if (page < 1 || page > this.totalPages || page === this.pageNumber) return;
    this.pageNumber = page;
    this.syncUrl();
    this.load();
  }

  load() {
    if (!this.profileReady) return;

    const currentRequest = ++this.requestId;
    const exactDate = this.toDateParam(this.reservationDate);
    const rangeFrom = _nullishCoalesce(exactDate, () => ( this.toDateParam(this.fromDate)));
    const rangeTo = _nullishCoalesce(exactDate, () => ( this.toDateParam(this.toDate)));
    this.loading = true;
    this.errorMessage = "";
    _optionalChain([this, 'access', _11 => _11.loadSubscription, 'optionalAccess', _12 => _12.unsubscribe, 'call', _13 => _13()]);

    this.loadSubscription = this.api
      .getReservations({
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
        includeCanceled: true,
        searchText: this.searchText.trim() || undefined,
        consultantName: this.consultantName.trim() || undefined,
        reservationStatus: this.reservationStatus || null,
        secretaryAnnouncementStatus: this.secretaryAnnouncementFilter,
        attendanceConfirmationStatus: this.statusFilter,
        // The current backend binds the range from fromDate/toDate. Keep the
        // former from/to names too so this frontend remains safe during rollout.
        reservationDate: exactDate,
        fromDate: rangeFrom,
        toDate: rangeTo,
        from: rangeFrom,
        to: rangeTo,
        sortDirection: this.sortDirection,
        reservationType:
          this.reservationTypeFilter === "regular"
            ? ReservationType.Regular
            : this.reservationTypeFilter === "after-sales"
              ? ReservationType.AfterSalesService
              : null,
      })
      .pipe(
        finalize(() => {
          if (currentRequest !== this.requestId) return;
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (response) => {
          if (currentRequest !== this.requestId) return;
          this.items = _nullishCoalesce(response.items, () => ( []));
          this.totalCount = _nullishCoalesce(response.totalCount, () => ( 0));
          this.pageNumber = response.pageNumber || 1;
          this.totalPages = Math.max(1, response.totalPages || 1);
          this.cdr.markForCheck();
        },
        error: (error) => {
          if (currentRequest !== this.requestId) return;
          this.items = [];
          this.totalCount = 0;
          this.errorMessage = this.errorText(
            error,
            "دریافت درخواست‌های رزرو انجام نشد",
          );
          this.cdr.markForCheck();
        },
      });
  }

  openDialog(item, mode) {
    if (mode !== "details" && !this.hasManagementAccess(item)) return;
    this.selected = item;
    this.dialogMode = mode;
    this.detailsError = "";
    this.note = "";
    this.reasonCode = null;
    this.rejectionText = "";
    this.newDate = null;
    this.newTime = "";
    if (mode === "reschedule") {
      const reservationDate = new Date(this.reservationAt(item));
      if (Number.isFinite(reservationDate.getTime())) {
        this.newDate = reservationDate;
        this.newTime = toIranTimeInputValue(reservationDate);
      }
    }
    this.editDentalServices = dentalServicesOf(item);
    this.editPatientCount = reservationPatientCount(item);
    this.contactResult = this.secretaryAnnouncementStatus(item);

    if (mode === "details") this.loadSelectedDetails(item);
  }

  closeDialog() {
    if (this.saving) return;
    this.dialogMode = null;
    this.selected = null;
    this.detailsLoading = false;
    this.detailsError = "";
    _optionalChain([this, 'access', _14 => _14.detailsSubscription, 'optionalAccess', _15 => _15.unsubscribe, 'call', _16 => _16()]);
    this.detailsSubscription = null;
  }

   loadSelectedDetails(item) {
    const id = this.reservationId(item);
    if (!id) return;

    this.detailsLoading = true;
    _optionalChain([this, 'access', _17 => _17.detailsSubscription, 'optionalAccess', _18 => _18.unsubscribe, 'call', _19 => _19()]);
    this.detailsSubscription = this.api.getReservationDetails(id)
      .pipe(finalize(() => {
        this.detailsLoading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (details) => {
          if (
            this.dialogMode !== "details" ||
            !this.selected ||
            this.reservationId(this.selected) !== id
          ) return;
          // List endpoints return a compact projection while the details endpoint
          // contains the remaining workflow states. Preserve list values when a
          // field is absent from the detailed projection.
          this.selected = { ...item, ...details };
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.detailsError = this.errorText(error, "دریافت همه جزئیات رزرو انجام نشد");
          this.cdr.markForCheck();
        },
      });
  }

  openCreateDialog(type = ReservationType.AfterSalesService) {
    if (!this.canCreate) return;
    this.createReservationType = type;
    this.createLeadAssignmentId = null;
    this.createConsultantProfileId = null;
    this.createDate = null;
    this.createTime = "";
    this.createDescription = "";
    this.createServiceTitle = "";
    this.createDentalServices = [];
    this.patientSearch = "";
    this.createDialogOpen = true;
    this.loadCreateOptions();
  }

  closeCreateDialog() {
    if (!this.saving) this.createDialogOpen = false;
  }

  createReservation() {
    if (!this.canCreate || this.saving) return;
    if (!this.createLeadAssignmentId || !this.createConsultantProfileId) {
      this.toast.error("ابتدا بیماری را انتخاب کنید که مشاور فعال دارد");
      return;
    }
    if (!this.createDate || !this.createTime) {
      this.toast.error("تاریخ و ساعت مراجعه الزامی است");
      return;
    }
    if (!this.createDentalServices.length) {
      this.toast.error("انتخاب حداقل یک خدمت معتبر الزامی است");
      return;
    }
    if (!this.createServiceTitle.trim()) {
      this.toast.error("عنوان خدمت پس از فروش الزامی است");
      return;
    }
    const reservationAt = this.combineDateTime(this.createDate, this.createTime);
    this.saving = true;
    this.api.createReservation({
      leadAssignmentId: this.createLeadAssignmentId,
      consultantProfileId: this.createConsultantProfileId,
      reservationAt,
      description: [
        `خدمت: ${this.createServiceTitle.trim()}`,
        this.createDescription.trim(),
      ].filter(Boolean).join("\n"),
      reservationType: this.createReservationType,
      dentalServices: this.createDentalServices,
    }).pipe(finalize(() => { this.saving = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (response) => {
          this.toast.success(response.message || "رزرو با موفقیت ثبت شد");
          this.createDialogOpen = false;
          this.reservationSync.requestRefresh();
          this.load();
        },
        error: (error) => this.toast.error(this.errorText(error, "ثبت رزرو انجام نشد")),
      });
  }

  toggleCreateDentalService(service, checked) {
    const selected = new Set(this.createDentalServices);
    checked ? selected.add(service) : selected.delete(service);
    this.createDentalServices = [...selected];
  }

  loadCreateOptions() {
    if (this.createOptionsLoading) return;
    this.createOptionsLoading = true;
    this.createOptionsError = "";
    this.api.getPatientOptions().pipe(finalize(() => {
      this.createOptionsLoading = false;
      this.cdr.markForCheck();
    })).subscribe({
      next: (patients) => {
        this.patientOptions = patients;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.createOptionsError = this.errorText(
          error,
          "دریافت فهرست بیماران انجام نشد",
        );
        this.cdr.markForCheck();
      },
    });
  }

  get filteredPatientOptions() {
    const query = this.normalizeSearch(this.patientSearch);
    if (!query) return this.patientOptions;
    return this.patientOptions.filter((item) =>
      this.normalizeSearch(`${this.patientOptionName(item)} ${this.patientOptionPhone(item)}`).includes(query),
    );
  }

  patientOptionId(item) {
    return Number(_nullishCoalesce(_nullishCoalesce(_nullishCoalesce(item.leadAssignmentId, () => ( item.LeadAssignmentId)), () => ( item.id)), () => ( item.Id)));
  }

  patientOptionName(item) {
    const person = _nullishCoalesce(_nullishCoalesce(_nullishCoalesce(_nullishCoalesce(item.user, () => ( item.User)), () => ( item.lead)), () => ( item.Lead)), () => ( {}));
    const fullName = _optionalChain([item, 'access', _20 => _20.fullName, 'optionalAccess', _21 => _21.trim, 'call', _22 => _22()]) || _optionalChain([item, 'access', _23 => _23.FullName, 'optionalAccess', _24 => _24.trim, 'call', _25 => _25()]);
    const composedName = [
      _nullishCoalesce(_nullishCoalesce(_nullishCoalesce(item.firstName, () => ( item.FirstName)), () => ( person["firstName"])), () => ( person["FirstName"])),
      _nullishCoalesce(_nullishCoalesce(_nullishCoalesce(item.lastName, () => ( item.LastName)), () => ( person["lastName"])), () => ( person["LastName"])),
    ].filter(Boolean).join(" ").trim();
    return fullName || composedName || item.userName || item.UserName || "بیمار بدون نام";
  }

  patientOptionPhone(item) {
    const person = _nullishCoalesce(_nullishCoalesce(_nullishCoalesce(_nullishCoalesce(item.user, () => ( item.User)), () => ( item.lead)), () => ( item.Lead)), () => ( {}));
    return String(_nullishCoalesce(_nullishCoalesce(_nullishCoalesce(_nullishCoalesce(item.phoneNumber, () => ( item.PhoneNumber)), () => ( person["phoneNumber"])), () => ( person["PhoneNumber"])), () => ( "")));
  }

  onPatientSelected(leadAssignmentId) {
    this.createLeadAssignmentId = leadAssignmentId;
    const patient = this.selectedPatientOption;
    this.createConsultantProfileId = patient
      ? this.patientConsultantId(patient)
      : null;
  }

  get selectedPatientOption() {
    if (!this.createLeadAssignmentId) return null;
    return _nullishCoalesce(this.patientOptions.find(
      (item) => this.patientOptionId(item) === this.createLeadAssignmentId,
    ), () => ( null));
  }

  patientConsultantId(item) {
    const consultant = _nullishCoalesce(_nullishCoalesce(item.consultant, () => ( item.Consultant)), () => ( {}));
    const value = Number(
      _nullishCoalesce(_nullishCoalesce(_nullishCoalesce(_nullishCoalesce(_nullishCoalesce(item.consultantProfileId, () => (
      item.ConsultantProfileId)), () => (
      consultant["profileId"])), () => (
      consultant["ProfileId"])), () => (
      consultant["consultantProfileId"])), () => (
      consultant["ConsultantProfileId"])),
    );
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  patientConsultantName(item) {
    const consultant = _nullishCoalesce(_nullishCoalesce(item.consultant, () => ( item.Consultant)), () => ( {}));
    const fullName = _optionalChain([item, 'access', _26 => _26.consultantFullName, 'optionalAccess', _27 => _27.trim, 'call', _28 => _28()]) ||
      _optionalChain([item, 'access', _29 => _29.ConsultantFullName, 'optionalAccess', _30 => _30.trim, 'call', _31 => _31()]) ||
      String(_nullishCoalesce(_nullishCoalesce(consultant["fullName"], () => ( consultant["FullName"])), () => ( ""))).trim();
    const composedName = [
      _nullishCoalesce(consultant["firstName"], () => ( consultant["FirstName"])),
      _nullishCoalesce(consultant["lastName"], () => ( consultant["LastName"])),
    ].filter(Boolean).join(" ").trim();
    return fullName || composedName || "مشاور ثبت نشده";
  }

  patientConsultantPhone(item) {
    const consultant = _nullishCoalesce(_nullishCoalesce(item.consultant, () => ( item.Consultant)), () => ( {}));
    return String(
      _nullishCoalesce(_nullishCoalesce(_nullishCoalesce(_nullishCoalesce(item.consultantPhoneNumber, () => (
      item.ConsultantPhoneNumber)), () => (
      consultant["phoneNumber"])), () => (
      consultant["PhoneNumber"])), () => (
      "")),
    );
  }

   normalizeSearch(value) {
    return value.toLocaleLowerCase("fa").replaceAll("ي", "ی").replaceAll("ك", "ک").trim();
  }

  submitDialog() {
    const item = this.selected;
    const id = item ? this.reservationId(item) : null;
    if (
      !item ||
      !id ||
      !this.dialogMode ||
      this.dialogMode === "details" ||
      !this.hasManagementAccess(item)
    )
      return;
    const validation = this.validateDialog(item);
    if (validation) {
      this.toast.error(validation);
      return;
    }

    let request;
    if (this.dialogMode === "confirm") {
      request = this.api.confirmReservation(id, this.note.trim() || null);
    } else if (this.dialogMode === "reschedule") {
      request = this.api.updateReservationTime(
        id,
        this.combineDateTime(this.newDate, this.newTime),
        this.editDentalServices,
        this.editPatientCount,
      );
    } else if (this.dialogMode === "reject") {
      request = this.api.rejectReservation(id, {
        reasonCode: this.reasonCode,
        reason: this.resolvedRejectionReason(),
      });
    } else if (this.dialogMode === "contact") {
      const secretaryUserId = _optionalChain([this, 'access', _32 => _32.auth, 'access', _33 => _33.user, 'call', _34 => _34(), 'optionalAccess', _35 => _35.userId]);
      if (!secretaryUserId) {
        this.toast.error("شناسه کاربر منشی در دسترس نیست؛ لطفاً دوباره وارد شوید");
        return;
      }
      request = this.api.updateSecretaryAnnouncement({
        reservationId: id,
        secretaryUserId,
        status: this.contactResult,
        description: this.note.trim() || null,
      });
    } else {
      request = this.api.recordVisitResult(
        id,
        this.visitResult,
        this.note.trim() || null,
      );
    }

    this.saving = true;
    request
      .pipe(
        finalize(() => {
          this.saving = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (response) => {
          this.saving = false;
          this.toast.success(response.message || "عملیات با موفقیت ثبت شد");
          this.closeDialog();
          this.reservationSync.requestRefresh();
          this.load();
        },
        error: (error) =>
          this.toast.error(this.errorText(error, "ثبت عملیات انجام نشد")),
      });
  }

  canManage(item) {
    return (
      this.hasManagementAccess(item) &&
      this.status(item) === ReservationRequestStatus.PendingSecretaryReview
    );
  }

  hasManagementAccess(item) {
    return this.api.canManageReservation(item);
  }

  canChangeTime(item) {
    return (
      this.hasManagementAccess(item) &&
      !(_nullishCoalesce(_nullishCoalesce(item.isCanceled, () => ( item.IsCanceled)), () => ( false)))
    );
  }

  canRecordVisit(item) {
    return (
      this.hasManagementAccess(item) &&
      [
        ReservationRequestStatus.Confirmed,
        ReservationRequestStatus.Rescheduled,
      ].includes(this.status(item) )
    );
  }

  phoneHref(item) {
    const phone = this.patientPhone(item).replace(/[^\d+]/g, "");
    return phone && phone !== "-" ? `tel:${phone}` : null;
  }

  statusLabel(item) {
    return attendanceStatusPresentation(this.attendanceStatus(item)).label;
  }

  statusClass(item) {
    return attendanceStatusPresentation(this.attendanceStatus(item)).badgeClass;
  }

  secretaryAnnouncementStatus(item) {
    return _nullishCoalesce(_nullishCoalesce(item.secretaryAnnouncementStatus, () => ( item.SecretaryAnnouncementStatus)), () => ( "NotCalled"));
  }

  secretaryAnnouncementLabel(item) {
    const status = this.secretaryAnnouncementStatus(item);
    if (status === "Confirmed") return "🟢 تایید شده";
    if (status === "NoAnswer") return "🟠 پاسخ نداد";
    if (status === "CancelledByPatient") return "🔴 لغو شده";
    if (status === "NotCalled") return "⚪ تماس نشده";
    return _nullishCoalesce(_optionalChain([SECRETARY_ANNOUNCEMENT_OPTIONS, 'access', _36 => _36.find, 'call', _37 => _37((option) => option.value === status), 'optionalAccess', _38 => _38.label]), () => ( status));
  }

  secretaryAnnouncementClass(item) {
    const status = this.secretaryAnnouncementStatus(item);
    return status === "Confirmed" ? "success" : status === "CancelledByPatient" ? "danger" : status === "NoAnswer" ? "warn" : "muted";
  }

  reservationId(item) {
    const value = Number(_nullishCoalesce(item.id, () => ( item.Id)));
    return Number.isFinite(value) ? value : null;
  }
  patientName(item) {
    return (
      _optionalChain([item, 'access', _39 => _39.patientName, 'optionalAccess', _40 => _40.trim, 'call', _41 => _41()]) || _optionalChain([item, 'access', _42 => _42.PatientName, 'optionalAccess', _43 => _43.trim, 'call', _44 => _44()]) || "بیمار بدون نام"
    );
  }
  patientPhone(item) {
    return (
      _optionalChain([item, 'access', _45 => _45.patientPhoneNumber, 'optionalAccess', _46 => _46.trim, 'call', _47 => _47()]) || _optionalChain([item, 'access', _48 => _48.PatientPhoneNumber, 'optionalAccess', _49 => _49.trim, 'call', _50 => _50()]) || "-"
    );
  }
  consultantNameOf(item) {
    return (
      _optionalChain([item, 'access', _51 => _51.consultantFullName, 'optionalAccess', _52 => _52.trim, 'call', _53 => _53()]) || _optionalChain([item, 'access', _54 => _54.ConsultantFullName, 'optionalAccess', _55 => _55.trim, 'call', _56 => _56()]) || "-"
    );
  }
  serviceName(item) {
    return (
      _optionalChain([item, 'access', _57 => _57.requestedServiceName, 'optionalAccess', _58 => _58.trim, 'call', _59 => _59()]) ||
      _optionalChain([item, 'access', _60 => _60.RequestedServiceName, 'optionalAccess', _61 => _61.trim, 'call', _62 => _62()]) ||
      _optionalChain([item, 'access', _63 => _63.businessName, 'optionalAccess', _64 => _64.trim, 'call', _65 => _65()]) ||
      _optionalChain([item, 'access', _66 => _66.BusinessName, 'optionalAccess', _67 => _67.trim, 'call', _68 => _68()]) ||
      "ثبت نشده"
    );
  }
  consultantReport(item) {
    return (
      _optionalChain([item, 'access', _69 => _69.consultantReport, 'optionalAccess', _70 => _70.trim, 'call', _71 => _71()]) ||
      _optionalChain([item, 'access', _72 => _72.ConsultantReport, 'optionalAccess', _73 => _73.trim, 'call', _74 => _74()]) ||
      _optionalChain([item, 'access', _75 => _75.description, 'optionalAccess', _76 => _76.trim, 'call', _77 => _77()]) ||
      _optionalChain([item, 'access', _78 => _78.Description, 'optionalAccess', _79 => _79.trim, 'call', _80 => _80()]) ||
      "گزارشی ثبت نشده"
    );
  }
  doctorRoom(item) {
    const doctor = _nullishCoalesce(item.doctorName, () => ( item.DoctorName));
    const room = _nullishCoalesce(item.roomName, () => ( item.RoomName));
    return doctor || room ? `${_nullishCoalesce(doctor, () => ( "-"))} / ${_nullishCoalesce(room, () => ( "-"))}` : null;
  }
  reservationAt(item) {
    return item.reservationAt || item.ReservationAt || "";
  }
  formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    return Number.isFinite(date.getTime())
      ? new Intl.DateTimeFormat("fa-IR", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "Asia/Tehran",
        }).format(date)
      : "-";
  }
  formatAppointmentTime(value) {
    return formatReservationTime(value);
  }
  displayReservationAt(item) {
    return _nullishCoalesce(_nullishCoalesce(item.reservationAtPersian, () => ( item.ReservationAtPersian)), () => (
      this.formatAppointmentTime(this.reservationAt(item))));
  }
  displayCreatedAt(item) {
    return _nullishCoalesce(_nullishCoalesce(item.createdAtPersian, () => ( item.CreatedAtPersian)), () => (
      this.formatDate(_nullishCoalesce(_nullishCoalesce(item.createdAt, () => ( item.CreatedAt)), () => ( item.requestCreatedAt)))));
  }

   status(item) {
    return Number(
      _nullishCoalesce(_nullishCoalesce(_nullishCoalesce(item.reservationRequestStatus, () => (
        item.secretaryReservationReviewStatus)), () => (
        item.SecretaryReservationReviewStatus)), () => (
        0)),
    );
  }

   attendanceStatus(
    item,
  ) {
    return readAttendanceStatus(item, "attendanceConfirmationStatus");
  }

   validateDialog(item) {
    if (this.dialogMode === "reschedule") {
      const patientCountError = validatePatientCount(this.editPatientCount);
      if (patientCountError) return patientCountError;
      if (!this.editDentalServices.length)
        return "انتخاب حداقل یک خدمت معتبر الزامی است";
      if (!this.newDate || !this.newTime) return "تاریخ و ساعت جدید الزامی است";
      const next = new Date(
        this.combineDateTime(this.newDate, this.newTime),
      ).getTime();
      if (!Number.isFinite(next) || next <= Date.now())
        return "زمان جدید باید معتبر و در آینده باشد";
      if (Math.abs(next - new Date(this.reservationAt(item)).getTime()) < 60000)
        return "زمان جدید باید با زمان فعلی متفاوت باشد";
    }
    if (this.dialogMode === "reject") {
      if (!this.reasonCode) return "انتخاب دلیل رد الزامی است";
      if (this.reasonCode === 4 && !this.rejectionText.trim())
        return "توضیحات دلیل سایر الزامی است";
    }
    return null;
  }

  toggleEditDentalService(service, checked) {
    const selected = new Set(this.editDentalServices);
    checked ? selected.add(service) : selected.delete(service);
    this.editDentalServices = [...selected];
  }

   resolvedRejectionReason() {
    return this.reasonCode === 1
      ? "عدم ظرفیت"
      : this.reasonCode === 2
        ? "عدم پاسخ بیمار"
        : this.reasonCode === 3
          ? "درخواست لغو شده"
          : this.rejectionText.trim();
  }

   combineDateTime(date, time) {
    const [hours, minutes] = time.split(":").map(Number);
    const value = new Date(date);
    value.setHours(hours, minutes, 0, 0);
    return value.toISOString();
  }

   statusForQuickFilter(
    filter,
  ) {
    return filter === "pending"
      ? AttendanceConfirmationStatus.PendingConsultantConfirmation
      : filter === "confirmed"
        ? AttendanceConfirmationStatus.SecretaryApproved
        : filter === "followup"
          ? null
          : filter === "rejected"
            ? AttendanceConfirmationStatus.SecretaryRejected
            : null;
  }

   applyPreset(preset) {
    this.preset = preset;
    this.quickFilter = "all";
    this.statusFilter = null;
    this.reservationTypeFilter = preset === "after-sales" ? "after-sales" : "all";
    this.secretaryAnnouncementFilter = preset === "after-sales" ? null :
      preset === "secretary-confirmed" ? "Confirmed" :
      preset === "secretary-no-answer" ? "NoAnswer" :
      preset === "secretary-cancelled" ? "CancelledByPatient" : "NotCalled";
    this.applyFilters();
  }

   restoreFromUrl() {
    const params = this.route.snapshot.queryParamMap;
    const filter = params.get("requestFilter") ;
    const restoredStatus = Number(params.get("attendanceStatus"));
    this.statusFilter =
      params.has("attendanceStatus") &&
      STATUS_OPTIONS.some((option) => option.value === restoredStatus)
        ? (restoredStatus )
        : this.statusForQuickFilter(this.quickFilter);
    this.searchText = _nullishCoalesce(params.get("requestSearch"), () => ( ""));
    this.consultantName = _nullishCoalesce(params.get("consultant"), () => ( ""));
    this.reservationStatus = _nullishCoalesce(params.get("reservationStatus"), () => ( ""));
    const announcement = params.get("secretaryAnnouncementStatus") ;
    this.secretaryAnnouncementFilter = SECRETARY_ANNOUNCEMENT_OPTIONS.some((option) => option.value === announcement) ? announcement : null;
    this.reservationDate = this.readDateParam(params.get("reservationDate"));
    this.fromDate = this.readDateParam(params.get("requestFrom"));
    this.toDate = this.readDateParam(params.get("requestTo"));
    this.dateFilterMode = this.fromDate || this.toDate ? "range" : "exact";
    this.sortDirection =
      params.get("requestDirection") === "desc" ? "desc" : "asc";
    const type = params.get("reservationType") ;
    this.reservationTypeFilter = ["regular", "after-sales"].includes(_nullishCoalesce(type, () => ( ""))) ? type : "all";
    this.pageNumber = Math.max(1, Number(params.get("requestPage")) || 1);
    this.pageSize = [10, 20, 50].includes(Number(params.get("requestPageSize")))
      ? Number(params.get("requestPageSize"))
      : 20;
  }

   syncUrl() {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParamsHandling: "merge",
      replaceUrl: true,
      queryParams: {
        requestFilter: this.quickFilter === "all" ? null : this.quickFilter,
        requestStatus: null,
        attendanceStatus: this.statusFilter,
        requestSearch: this.searchText.trim() || null,
        consultant: this.consultantName.trim() || null,
        reservationStatus: this.reservationStatus || null,
        secretaryAnnouncementStatus: this.secretaryAnnouncementFilter,
        reservationDate: _nullishCoalesce(this.toDateParam(this.reservationDate), () => ( null)),
        requestFrom: _nullishCoalesce(this.toDateParam(this.fromDate), () => ( null)),
        requestTo: _nullishCoalesce(this.toDateParam(this.toDate), () => ( null)),
        requestSort: null,
        requestDirection:
          this.sortDirection !== "asc" ? this.sortDirection : null,
        reservationType: this.reservationTypeFilter === "all" ? null : this.reservationTypeFilter,
        requestPage: this.pageNumber > 1 ? this.pageNumber : null,
        requestPageSize: this.pageSize !== 20 ? this.pageSize : null,
      },
    });
  }

   toDateParam(value) {
    if (!value) return undefined;

    // A calendar date has no timezone. Using toISOString() here converted the
    // user's local midnight to UTC and could send the previous day to the API.
    const year = value.getFullYear();
    const month = `${value.getMonth() + 1}`.padStart(2, "0");
    const day = `${value.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
   readDateParam(value) {
    if (!value) return null;
    const date = new Date(`${value}T12:00:00`);
    return Number.isFinite(date.getTime()) ? date : null;
  }
   todayParam() {
    return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Tehran" });
  }
   errorText(error, fallback) {
    return error instanceof Error && error.message ? error.message : fallback;
  }
}
