 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,


  EventEmitter,






} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { finalize } from "rxjs";







import {
  attendanceScoreLabel,
  attendanceStatusPresentation,
  canConsultantEditReservation,
  canConsultantConfirmDueReservation,
  isAwaitingConsultantAttendanceConfirmation,
  isPendingConsultantConfirmationNotYetDue,
  isSecretaryReviewCompleted,
  readAttendanceStatus,
} from "../../core/reservation/reservation-attendance";

import { NG_MODEL_UPDATE_ON_BLUR } from "../../shared/forms/ng-model-options";
import { createCoalescedMarkForCheck } from "../../shared/change-detection/coalesce-mark-for-check";
import { BaseDialogComponent } from "../../shared/base/base-dialog/base-dialog.component";
import { BaseDatepickerComponent } from "../../shared/base/base-datepicker/base-datepicker.component";

import { DENTAL_SERVICE_OPTIONS, dentalServicesOf, formatDentalServices } from "../../core/reservation/dental-services";

import {
  combineIranDateAndTime,
  formatIranDateTime,
  formatReservationTime,
  nowInIran,
  startOfIranDay,
  toIranDateInputValue,
  toIranTimeInputValue,
} from "../../utils/iran-datetime.util";

 

@Component({
  selector: "app-consultant-reservations-panel",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BaseDialogComponent,
    BaseDatepickerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./consultant-reservations-panel.component.html",
  styleUrl: "./consultant-reservations-panel.component.scss",
})
export class ConsultantReservationsPanelComponent
  
{
  Input({ required: true }) __init() {this.profileId = 0}
  Input() __init2() {this.profileReady = false}
  Output() __init3() {this.pendingCountChange = new EventEmitter()}

  __init4() {this.activeTab = "pending"}
  __init5() {this.items = []}
  __init6() {this.notes = {}}
  __init7() {this.loading = false}
  __init8() {this.savingId = null}
  __init9() {this.feedback = ""}
  __init10() {this.feedbackType = "success"}
  __init11() {this.pageNumber = 1}
  __init12() {this.pageSize = 20}
  __init13() {this.totalPages = 1}
  __init14() {this.totalCount = 0}
  __init15() {this.searchText = ""}
  __init16() {this.patientNameFilter = ""}
  __init17() {this.patientPhoneFilter = ""}
  __init18() {this.patientCityFilter = ""}
  __init19() {this.attendanceStatusFilter = ""}
  __init20() {this.fromDate = null}
  __init21() {this.toDate = null}
   __init22() {this.fromDatePickerLabel = { fa: "از تاریخ مراجعه", en: "Visit date from" }}
   __init23() {this.toDatePickerLabel = { fa: "تا تاریخ مراجعه", en: "Visit date to" }}
   __init24() {this.attendanceStatusOptions


 = [
    { value: "PendingConsultantConfirmation", label: "در انتظار تأیید مشاور" },
    { value: "ConsultantConfirmedPresent", label: "حضور تأییدشده توسط مشاور" },
    { value: "ConsultantConfirmedAbsent", label: "عدم حضور تأییدشده توسط مشاور" },
    { value: "SecretaryApproved", label: "تأیید منشی" },
    { value: "SecretaryRejected", label: "رد منشی" },
  ]}
  __init25() {this.pendingCount = 0}
  __init26() {this.editDialogOpen = false}
  __init27() {this.editSaving = false}
  __init28() {this.editingReservation = null}
  __init29() {this.editForm = {
    reservationDate: null ,
    reservationTime: "",
    patientCount: 1,
    patientCity: "",
    patientRegion: "",
    attendanceProbabilityPercent: 8,
    attendancePrediction: "",
    secondaryPhoneNumber: "",
    description: "",
    dentalServices: [] ,
  }}
   __init30() {this.dentalServiceOptions = DENTAL_SERVICE_OPTIONS}
   __init31() {this.dentalServicesLabel = formatDentalServices}
   __init32() {this.reservationDatePickerLabel = {
    fa: "تاریخ رزرو",
    en: "Reservation date",
  }}

   __init33() {this.loadRequestId = 0}
   __init34() {this.pollId = null}
   __init35() {this.loadSubscription = null}
  
   __init36() {this.searchDebounceId = null}
   __init37() {this.destroyed = false}
   __init38() {this.loadPending = false}
   __init39() {this.initialLoadStarted = false}
    __init40() {this.onVisibilityChange = () => {
    if (document.visibilityState === "visible" && this.profileReady) this.load();
  }}
   __init41() {this.ngModelBlurOptions = NG_MODEL_UPDATE_ON_BLUR}
  

  constructor(
     consultantApi,
     toast,
    reservationSync,
     cdr,
  ) {;this.consultantApi = consultantApi;this.toast = toast;this.cdr = cdr;ConsultantReservationsPanelComponent.prototype.__init.call(this);ConsultantReservationsPanelComponent.prototype.__init2.call(this);ConsultantReservationsPanelComponent.prototype.__init3.call(this);ConsultantReservationsPanelComponent.prototype.__init4.call(this);ConsultantReservationsPanelComponent.prototype.__init5.call(this);ConsultantReservationsPanelComponent.prototype.__init6.call(this);ConsultantReservationsPanelComponent.prototype.__init7.call(this);ConsultantReservationsPanelComponent.prototype.__init8.call(this);ConsultantReservationsPanelComponent.prototype.__init9.call(this);ConsultantReservationsPanelComponent.prototype.__init10.call(this);ConsultantReservationsPanelComponent.prototype.__init11.call(this);ConsultantReservationsPanelComponent.prototype.__init12.call(this);ConsultantReservationsPanelComponent.prototype.__init13.call(this);ConsultantReservationsPanelComponent.prototype.__init14.call(this);ConsultantReservationsPanelComponent.prototype.__init15.call(this);ConsultantReservationsPanelComponent.prototype.__init16.call(this);ConsultantReservationsPanelComponent.prototype.__init17.call(this);ConsultantReservationsPanelComponent.prototype.__init18.call(this);ConsultantReservationsPanelComponent.prototype.__init19.call(this);ConsultantReservationsPanelComponent.prototype.__init20.call(this);ConsultantReservationsPanelComponent.prototype.__init21.call(this);ConsultantReservationsPanelComponent.prototype.__init22.call(this);ConsultantReservationsPanelComponent.prototype.__init23.call(this);ConsultantReservationsPanelComponent.prototype.__init24.call(this);ConsultantReservationsPanelComponent.prototype.__init25.call(this);ConsultantReservationsPanelComponent.prototype.__init26.call(this);ConsultantReservationsPanelComponent.prototype.__init27.call(this);ConsultantReservationsPanelComponent.prototype.__init28.call(this);ConsultantReservationsPanelComponent.prototype.__init29.call(this);ConsultantReservationsPanelComponent.prototype.__init30.call(this);ConsultantReservationsPanelComponent.prototype.__init31.call(this);ConsultantReservationsPanelComponent.prototype.__init32.call(this);ConsultantReservationsPanelComponent.prototype.__init33.call(this);ConsultantReservationsPanelComponent.prototype.__init34.call(this);ConsultantReservationsPanelComponent.prototype.__init35.call(this);ConsultantReservationsPanelComponent.prototype.__init36.call(this);ConsultantReservationsPanelComponent.prototype.__init37.call(this);ConsultantReservationsPanelComponent.prototype.__init38.call(this);ConsultantReservationsPanelComponent.prototype.__init39.call(this);ConsultantReservationsPanelComponent.prototype.__init40.call(this);ConsultantReservationsPanelComponent.prototype.__init41.call(this);
    this.markDirty = createCoalescedMarkForCheck(
      this.cdr,
      () => this.destroyed,
    );
    this.realtimeSubscription = reservationSync.refreshRequested$.subscribe(() => {
      if (this.profileReady) this.load();
    });
  }

  ngOnInit() {
    document.addEventListener("visibilitychange", this.onVisibilityChange);
    if (this.profileReady) {
      this.loadInitial();
      this.startPolling();
    }
  }

  ngOnChanges(changes) {
    if (_optionalChain([changes, 'access', _ => _["profileReady"], 'optionalAccess', _2 => _2.currentValue]) === true) {
      this.loadInitial();
      this.startPolling();
    }
    if (
      changes["profileId"] &&
      !changes["profileId"].firstChange &&
      this.profileReady
    ) {
      this.load();
    }
  }

  ngOnDestroy() {
    this.destroyed = true;
    this.stopPolling();
    _optionalChain([this, 'access', _3 => _3.loadSubscription, 'optionalAccess', _4 => _4.unsubscribe, 'call', _5 => _5()]);
    this.realtimeSubscription.unsubscribe();
    if (this.searchDebounceId) clearTimeout(this.searchDebounceId);
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
  }

  setTab(tab) {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
    this.pageNumber = 1;
    this.load();
  }

  load() {
    if (!this.profileReady || !this.profileId) return;
    if (this.loading) {
      this.loadPending = true;
      return;
    }

    const requestId = ++this.loadRequestId;
    this.loading = true;
    this.feedback = "";
    this.markDirty();
    _optionalChain([this, 'access', _6 => _6.loadSubscription, 'optionalAccess', _7 => _7.unsubscribe, 'call', _8 => _8()]);

    if (this.activeTab === "pending") {
      this.loadSubscription = this.consultantApi
        .getDueConfirmations(this.profileId, {
          fromDate: this.fromDate ? toIranDateInputValue(this.fromDate) : undefined,
          toDate: this.toDate ? toIranDateInputValue(this.toDate) : undefined,
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
          next: (items) => {
            if (requestId !== this.loadRequestId) return;
            this.items = _nullishCoalesce(items, () => ( []));
            this.pendingCount = this.items.length;
            this.pendingCountChange.emit(this.pendingCount);
            this.markDirty();
          },
          error: (error) => {
            if (requestId !== this.loadRequestId) return;
            this.items = [];
            this.pendingCount = 0;
            this.pendingCountChange.emit(0);
            this.showFeedback(this.errorMessage(error), "error");
          },
        });
      return;
    }

    this.loadSubscription = this.consultantApi
      .getReservations({
        consultantProfileId: this.profileId,
        fromDate: this.fromDate ? toIranDateInputValue(this.fromDate) : undefined,
        toDate: this.toDate ? toIranDateInputValue(this.toDate) : undefined,
        searchText: this.cleanFilter(this.searchText),
        patientName: this.cleanFilter(this.patientNameFilter),
        patientPhoneNumber: this.cleanFilter(this.patientPhoneFilter),
        patientCity: this.cleanFilter(this.patientCityFilter),
        attendanceConfirmationStatus: this.attendanceStatusFilter || undefined,
        includeCanceled: false,
        onlySecretaryReviewed:
          this.activeTab === "completed" ? true : undefined,
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
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
          this.totalCount = response.totalCount;
          this.markDirty();
        },
        error: (error) => {
          if (requestId !== this.loadRequestId) return;
          this.items = [];
          this.showFeedback(this.errorMessage(error), "error");
        },
      });
  }

  goToPage(page) {
    if (page < 1 || page > this.totalPages) return;
    this.pageNumber = page;
    this.load();
  }

  applyFilters() {
    if (this.fromDate && this.toDate &&
        toIranDateInputValue(this.fromDate) > toIranDateInputValue(this.toDate)) {
      this.showFeedback("تاریخ شروع نباید بعد از تاریخ پایان باشد", "error");
      return;
    }
    this.pageNumber = 1;
    this.load();
  }

  clearDateFilters() {
    this.fromDate = null;
    this.toDate = null;
    this.applyFilters();
  }

  onSearchChange() {
    if (this.searchDebounceId) clearTimeout(this.searchDebounceId);
    this.searchDebounceId = setTimeout(() => this.applyFilters(), 400);
  }

   cleanFilter(value) {
    return value.trim() || undefined;
  }

  confirm(reservation, patientAttended) {
    const reservationId = this.reservationId(reservation);
    if (!this.profileId || !reservationId) return;

    const payload = {
      reservationId,
      consultantProfileId: this.profileId,
      patientAttended,
      note: (this.notes[reservationId] || "").trim() || null,
    };

    this.savingId = reservationId;
    this.consultantApi
      .confirmAttendance(payload)
      .pipe(finalize(() => (this.savingId = null)))
      .subscribe({
        next: (response) => {
          this.showFeedback(
            response.message ||
              (patientAttended
                ? "حضور بیمار ثبت شد و برای بررسی منشی ارسال شد"
                : "عدم حضور بیمار ثبت شد و برای بررسی منشی ارسال شد"),
            "success",
          );
          this.load();
        },
        error: (error) => this.showFeedback(this.errorMessage(error), "error"),
      });
  }

  emptyCopy() {
    if (this.activeTab === "pending") {
      return "رزروی در انتظار تایید حضور وجود ندارد.";
    }
    if (this.activeTab === "completed") {
      return "رزروی با بررسی نهایی منشی یافت نشد.";
    }
    return "رزروی برای نمایش وجود ندارد.";
  }

  reservationId(reservation) {
    const value =
      _nullishCoalesce(_nullishCoalesce(_nullishCoalesce(_nullishCoalesce(reservation.id, () => (
      reservation.Id)), () => (
      reservation.reservationId)), () => (
      reservation.ReservationId)), () => (
      null));
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

  patientName(reservation) {
    return reservation.patientName || reservation.PatientName || "بدون نام";
  }

  patientPhone(reservation) {
    return (
      reservation.patientPhoneNumber || reservation.PatientPhoneNumber || "-"
    );
  }

  patientCity(reservation) {
    return reservation.patientCity || reservation.PatientCity || "شهر ثبت نشده";
  }

  patientCount(reservation) {
    return _nullishCoalesce(_nullishCoalesce(reservation.patientCount, () => ( reservation.PatientCount)), () => ( 1));
  }

  doctorName(reservation) {
    return (
      _optionalChain([reservation, 'access', _9 => _9.doctorName, 'optionalAccess', _10 => _10.trim, 'call', _11 => _11()]) || _optionalChain([reservation, 'access', _12 => _12.DoctorName, 'optionalAccess', _13 => _13.trim, 'call', _14 => _14()]) || "-"
    );
  }

  reservationAt(reservation) {
    return reservation.reservationAt || reservation.ReservationAt || "";
  }

  reservationAtPersian(reservation) {
    return (
      _optionalChain([reservation, 'access', _15 => _15.reservationAtPersian, 'optionalAccess', _16 => _16.trim, 'call', _17 => _17()]) ||
      _optionalChain([reservation, 'access', _18 => _18.ReservationAtPersian, 'optionalAccess', _19 => _19.trim, 'call', _20 => _20()]) ||
      this.formatDateTime(this.reservationAt(reservation))
    );
  }

  probability(reservation) {
    return (
      _nullishCoalesce(_nullishCoalesce(reservation.attendanceProbabilityPercent, () => (
      reservation.AttendanceProbabilityPercent)), () => (
      "-"))
    );
  }

  attendancePrediction(reservation) {
    return (
      reservation.attendancePrediction ||
      reservation.AttendancePrediction ||
      "-"
    );
  }

  statusLabel(reservation) {
    return attendanceStatusPresentation(
      readAttendanceStatus(
        reservation,
        "attendanceConfirmationStatus",
        "AttendanceConfirmationStatus",
      ),
    ).label;
  }

  badgeClass(reservation) {
    return attendanceStatusPresentation(
      readAttendanceStatus(
        reservation,
        "attendanceConfirmationStatus",
        "AttendanceConfirmationStatus",
      ),
    ).badgeClass;
  }

  canConfirm(reservation) {
    if (this.activeTab === "pending") {
      return isAwaitingConsultantAttendanceConfirmation(reservation);
    }

    return canConsultantConfirmDueReservation(reservation);
  }

  isPendingNotYetDue(reservation) {
    return isPendingConsultantConfirmationNotYetDue(reservation);
  }

  isCompletedTab(reservation) {
    return (
      this.activeTab === "completed" &&
      isSecretaryReviewCompleted(
        readAttendanceStatus(
          reservation,
          "attendanceConfirmationStatus",
          "AttendanceConfirmationStatus",
        ),
      )
    );
  }

  scoreText(reservation) {
    const applied =
      _nullishCoalesce(reservation.isAttendanceScoreApplied, () => (
      reservation.IsAttendanceScoreApplied));
    const value =
      _nullishCoalesce(reservation.attendanceScoreValue, () => ( reservation.AttendanceScoreValue));
    if (applied && value !== null && value !== undefined) {
      return value > 0 ? `+${value}` : `${value}`;
    }

    return attendanceScoreLabel(
      _nullishCoalesce(reservation.secretaryApprovedConsultantConfirmation, () => (
        reservation.SecretaryApprovedConsultantConfirmation)),
    );
  }

  scoreClass(reservation) {
    const text = this.scoreText(reservation);
    if (text.startsWith("+")) return "success";
    if (text.startsWith("-")) return "danger";
    return "muted";
  }

  formatDateTime(value) {
    return formatIranDateTime(value);
  }

  formatAppointmentTime(value) {
    return formatReservationTime(value);
  }

  canEdit(reservation) {
    return canConsultantEditReservation(reservation);
  }

  openEditDialog(reservation) {
    if (!this.canEdit(reservation)) return;

    const reservationAt = this.reservationAt(reservation);
    const date = reservationAt ? new Date(reservationAt) : new Date();
    this.editingReservation = reservation;
    this.editForm = {
      reservationDate: Number.isFinite(date.getTime()) ? date : new Date(),
      reservationTime: toIranTimeInputValue(date),
      patientCount: this.patientCount(reservation),
      patientCity:
        this.patientCity(reservation) === "شهر ثبت نشده"
          ? ""
          : this.patientCity(reservation),
      patientRegion:
        reservation.patientRegion || reservation.PatientRegion || "",
      attendanceProbabilityPercent: Number(
        _nullishCoalesce(_nullishCoalesce(reservation.attendanceProbabilityPercent, () => (
          reservation.AttendanceProbabilityPercent)), () => (
          8)),
      ),
      attendancePrediction:
        reservation.attendancePrediction ||
        reservation.AttendancePrediction ||
        "بیمار گفت در تاریخ و ساعت رزرو شده در مطب حاضر می‌شود.",
      secondaryPhoneNumber:
        reservation.secondaryPhoneNumber ||
        reservation.SecondaryPhoneNumber ||
        "",
      description: reservation.description || reservation.Description || "",
      dentalServices: dentalServicesOf(reservation),
    };
    this.editDialogOpen = true;
    this.markDirty();
  }

  closeEditDialog() {
    this.editDialogOpen = false;
    this.editSaving = false;
    this.editingReservation = null;
    this.markDirty();
  }

  setEditReservationDate(date) {
    this.editForm.reservationDate = date;
  }

  toggleDentalService(service, checked) {
    const selected = new Set(this.editForm.dentalServices);
    checked ? selected.add(service) : selected.delete(service);
    this.editForm.dentalServices = [...selected];
  }

  submitEdit() {
    const reservationId = this.editingReservation
      ? this.reservationId(this.editingReservation)
      : null;
    if (!this.profileId || !reservationId) return;

    if (!this.editForm.reservationDate) {
      this.showFeedback("تاریخ و ساعت رزرو را وارد کنید", "error");
      return;
    }
    if (
      !Number.isInteger(Number(this.editForm.patientCount)) ||
      Number(this.editForm.patientCount) < 1 ||
      Number(this.editForm.patientCount) > 10
    ) {
      this.showFeedback("تعداد بیماران باید بین ۱ تا ۱۰ نفر باشد", "error");
      return;
    }
    if (!this.editForm.dentalServices.length) {
      this.showFeedback("انتخاب حداقل یک خدمت معتبر الزامی است", "error");
      return;
    }

    const reservationAt = combineIranDateAndTime(
      this.editForm.reservationDate,
      this.editForm.reservationTime,
    );
    if (!reservationAt) {
      this.showFeedback("تاریخ و ساعت رزرو را وارد کنید", "error");
      return;
    }

    if (
      !Number.isFinite(this.editForm.attendanceProbabilityPercent) ||
      this.editForm.attendanceProbabilityPercent < 0 ||
      this.editForm.attendanceProbabilityPercent > 100
    ) {
      this.showFeedback("احتمال حضور باید بین ۰ تا ۱۰۰ باشد", "error");
      return;
    }

    const payload = {
      reservationAt: reservationAt.toISOString(),
      patientCount: this.editForm.patientCount,
      patientCity: this.editForm.patientCity.trim(),
      patientRegion: this.editForm.patientRegion.trim(),
      attendanceProbabilityPercent: this.editForm.attendanceProbabilityPercent,
      attendancePrediction: this.editForm.attendancePrediction.trim(),
      secondaryPhoneNumber: this.editForm.secondaryPhoneNumber.trim() || null,
      description: this.editForm.description.trim() || null,
      dentalServices: this.editForm.dentalServices,
    };

    this.editSaving = true;
    this.consultantApi
      .updateReservation(reservationId, payload)
      .pipe(finalize(() => (this.editSaving = false)))
      .subscribe({
        next: (response) => {
          this.showFeedback(
            response.message || "زمان رزرو با موفقیت تغییر کرد",
            "success",
          );
          this.closeEditDialog();
          this.load();
        },
        error: (error) => this.showFeedback(this.errorMessage(error), "error"),
      });
  }

  minimumReservationDate() {
    return startOfIranDay(nowInIran());
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

   errorMessage(error) {
    return error instanceof Error && error.message
      ? error.message
      : "عملیات انجام نشد";
  }

   showFeedback(message, type) {
    this.feedback = message;
    this.feedbackType = type;
    if (type === "success") this.toast.success(message);
    else this.toast.error(message);
    this.markDirty();
  }
}
