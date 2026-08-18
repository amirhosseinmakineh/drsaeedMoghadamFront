import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription, finalize } from "rxjs";
import {
  SecretaryDashboardService,
  SecretaryReservation,
  SecretaryReservationActivity,
  SecretaryAnnouncementStatus,
} from "../../core/secretary/secretary-dashboard.service";
import { ToastService } from "../../core/toast/toast.service";
import {
  AttendanceConfirmationStatus,
  attendanceStatusPresentation,
  readAttendanceStatus,
} from "../../core/reservation/reservation-attendance";
import {
  BaseDatepickerComponent,
  BaseDialogComponent,
} from "../../shared/base";
import { SecretaryDashboardPreset } from "./secretary-overview.component";
import { ReservationSyncService } from "../../core/reservation/reservation-sync.service";
import { formatReservationTime } from "../../utils/iran-datetime.util";

// This workflow status is returned for display/actions and is deliberately not
// used by the attendance filter sent to SecretaryReservations.
enum ReservationRequestStatus {
  PendingSecretaryReview = 1,
  Confirmed = 2,
  Rescheduled = 3,
  Rejected = 4,
  Canceled = 5,
  WaitingPatientConfirmation = 6,
  NeedsFollowUp = 7,
  Attended = 8,
  NoShow = 9,
}

type QuickFilter = "all" | "pending" | "confirmed" | "followup" | "rejected";
type DialogMode =
  | "details"
  | "confirm"
  | "reschedule"
  | "reject"
  | "contact"
  | "note"
  | "followup"
  | "visit";

const SECRETARY_ANNOUNCEMENT_OPTIONS: ReadonlyArray<{
  value: SecretaryAnnouncementStatus;
  label: string;
}> = [
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
})) satisfies ReadonlyArray<{
  value: AttendanceConfirmationStatus;
  label: string;
}>;

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
  implements OnInit, OnChanges, OnDestroy
{
  @Input() profileReady = false;
  @Input() preset: SecretaryDashboardPreset | null = null;

  readonly statusOptions = STATUS_OPTIONS;
  readonly quickFilters: { value: QuickFilter; label: string }[] = [
    { value: "all", label: "همه درخواست‌ها" },
    { value: "pending", label: "منتظر تایید مشاور" },
    { value: "confirmed", label: "تایید نهایی منشی" },
    { value: "followup", label: "نیاز به پیگیری" },
    { value: "rejected", label: "رد نهایی منشی" },
  ];
  readonly secretaryAnnouncementOptions = SECRETARY_ANNOUNCEMENT_OPTIONS;

  items: SecretaryReservation[] = [];
  totalCount = 0;
  pageNumber = 1;
  pageSize = 20;
  totalPages = 1;
  loading = false;
  saving = false;
  errorMessage = "";
  quickFilter: QuickFilter = "all";
  searchText = "";
  consultantName = "";
  statusFilter: AttendanceConfirmationStatus | null = null;
  reservationStatus = "";
  secretaryAnnouncementFilter: SecretaryAnnouncementStatus | null = null;
  reservationDate: Date | null = null;
  fromDate: Date | null = null;
  toDate: Date | null = null;
  dateFilterMode: "exact" | "range" = "exact";
  sortDirection: "asc" | "desc" = "desc";

  selected: SecretaryReservation | null = null;
  dialogMode: DialogMode | null = null;
  history: SecretaryReservationActivity[] = [];
  historyLoading = false;
  note = "";
  reasonCode: number | null = null;
  rejectionText = "";
  newDate: Date | null = null;
  newTime = "";
  contactResult: SecretaryAnnouncementStatus = "NotCalled";
  followUpDate: Date | null = null;
  followUpTime = "";
  visitResult = 2;

  private loadSubscription: Subscription | null = null;
  private requestId = 0;

  constructor(
    private api: SecretaryDashboardService,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService,
    private reservationSync: ReservationSyncService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.restoreFromUrl();
    if (this.profileReady) this.load();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["preset"]?.currentValue) {
      this.applyPreset(changes["preset"].currentValue);
    }
    if (changes["profileReady"]?.currentValue === true) this.load();
  }

  ngOnDestroy(): void {
    this.loadSubscription?.unsubscribe();
  }

  setQuickFilter(value: QuickFilter): void {
    this.quickFilter = value;
    this.statusFilter = this.statusForQuickFilter(value);
    this.applyFilters();
  }

  applyFilters(): void {
    this.pageNumber = 1;
    this.syncUrl();
    this.load();
  }

  searchReservations(): void {
    this.searchText = this.searchText.trim();
    this.consultantName = this.consultantName.trim();
    this.applyFilters();
  }

  clearFilters(): void {
    this.quickFilter = "all";
    this.searchText = "";
    this.consultantName = "";
    this.statusFilter = null;
    this.reservationStatus = "";
    this.secretaryAnnouncementFilter = null;
    this.reservationDate = null;
    this.fromDate = null;
    this.toDate = null;
    this.sortDirection = "desc";
    this.applyFilters();
  }

  clearDateFilters(): void {
    this.reservationDate = null;
    this.fromDate = null;
    this.toDate = null;
    this.applyFilters();
  }

  setDateFilterMode(mode: "exact" | "range"): void {
    this.dateFilterMode = mode;
    if (mode === "exact") {
      this.fromDate = null;
      this.toDate = null;
    } else {
      this.reservationDate = null;
    }
  }

  dateFilterLabel(): string {
    const activeCount = [
      this.reservationDate,
      this.fromDate,
      this.toDate,
    ].filter(Boolean).length;
    if (!activeCount) return "فیلتر تاریخ";
    if (this.reservationDate) return "تاریخ رزرو انتخاب شده";
    return activeCount === 2 ? "بازه تاریخ انتخاب شده" : "یک تاریخ انتخاب شده";
  }

  changePageSize(): void {
    this.pageNumber = 1;
    this.syncUrl();
    this.load();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.pageNumber) return;
    this.pageNumber = page;
    this.syncUrl();
    this.load();
  }

  load(): void {
    if (!this.profileReady) return;
    const currentRequest = ++this.requestId;
    this.loading = true;
    this.errorMessage = "";
    this.loadSubscription?.unsubscribe();
    this.loadSubscription = this.api
      .getReservations({
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
        includeCanceled: true,
        searchText: this.searchText.trim() || undefined,
        consultantName: this.consultantName.trim() || undefined,
        attendanceConfirmationStatus: this.statusFilter,
        reservationStatus: this.reservationStatus || null,
        secretaryAnnouncementStatus: this.secretaryAnnouncementFilter,
        reservationDate: this.toDateParam(this.reservationDate),
        from: this.toDateParam(this.fromDate),
        to: this.toDateParam(this.toDate),
        followUpDueOn:
          this.quickFilter === "followup" ? this.todayParam() : undefined,
        visitResultStatus: null,
        sortDirection: this.sortDirection,
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
          this.items = response.items ?? [];
          this.totalCount = response.totalCount ?? 0;
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

  openDialog(item: SecretaryReservation, mode: DialogMode): void {
    if (mode !== "details" && !this.hasManagementAccess(item)) return;
    this.selected = item;
    this.dialogMode = mode;
    this.note = "";
    this.reasonCode = null;
    this.rejectionText = "";
    this.newDate = null;
    this.newTime = "";
    this.followUpDate = null;
    this.followUpTime = "";
    this.contactResult = this.secretaryAnnouncementStatus(item);
    if (mode === "details") this.loadHistory(item);
  }

  closeDialog(): void {
    if (this.saving) return;
    this.dialogMode = null;
    this.selected = null;
    this.history = [];
  }

  submitDialog(): void {
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
      request = this.api.rescheduleReservation(id, {
        reservationAt: this.combineDateTime(this.newDate!, this.newTime),
        reason: this.rejectionText.trim() || null,
        note: this.note.trim() || null,
      });
    } else if (this.dialogMode === "reject") {
      request = this.api.rejectReservation(id, {
        reasonCode: this.reasonCode!,
        reason: this.resolvedRejectionReason(),
      });
    } else if (this.dialogMode === "contact") {
      request = this.api.updateSecretaryAnnouncement({
        reservationId: id,
        status: this.contactResult,
        description: this.note.trim() || null,
      });
    } else if (this.dialogMode === "note") {
      request = this.api.addReservationNote(id, this.note.trim());
    } else if (this.dialogMode === "followup") {
      request = this.api.createFollowUp(
        id,
        this.combineDateTime(this.followUpDate!, this.followUpTime),
        this.note.trim(),
      );
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

  canManage(item: SecretaryReservation): boolean {
    return (
      this.hasManagementAccess(item) &&
      this.status(item) === ReservationRequestStatus.PendingSecretaryReview
    );
  }

  hasManagementAccess(item: SecretaryReservation): boolean {
    return this.api.canManageReservation(item);
  }

  canRecordVisit(item: SecretaryReservation): boolean {
    return (
      this.hasManagementAccess(item) &&
      [
        ReservationRequestStatus.Confirmed,
        ReservationRequestStatus.Rescheduled,
      ].includes(this.status(item) as ReservationRequestStatus)
    );
  }

  phoneHref(item: SecretaryReservation): string | null {
    const phone = this.patientPhone(item).replace(/[^\d+]/g, "");
    return phone && phone !== "-" ? `tel:${phone}` : null;
  }

  statusLabel(item: SecretaryReservation): string {
    return attendanceStatusPresentation(this.attendanceStatus(item)).label;
  }

  statusClass(item: SecretaryReservation): string {
    return attendanceStatusPresentation(this.attendanceStatus(item)).badgeClass;
  }

  secretaryAnnouncementStatus(item: SecretaryReservation): SecretaryAnnouncementStatus {
    return item.secretaryAnnouncementStatus ?? item.SecretaryAnnouncementStatus ?? "NotCalled";
  }

  secretaryAnnouncementLabel(item: SecretaryReservation): string {
    const status = this.secretaryAnnouncementStatus(item);
    if (status === "Confirmed") return "🟢 تایید شده";
    if (status === "NoAnswer") return "🟠 پاسخ نداد";
    if (status === "CancelledByPatient") return "🔴 لغو شده";
    if (status === "NotCalled") return "⚪ تماس نشده";
    return SECRETARY_ANNOUNCEMENT_OPTIONS.find((option) => option.value === status)?.label ?? status;
  }

  secretaryAnnouncementClass(item: SecretaryReservation): string {
    const status = this.secretaryAnnouncementStatus(item);
    return status === "Confirmed" ? "success" : status === "CancelledByPatient" ? "danger" : status === "NoAnswer" ? "warn" : "muted";
  }

  reservationId(item: SecretaryReservation): number | null {
    const value = Number(item.id ?? item.Id);
    return Number.isFinite(value) ? value : null;
  }
  patientName(item: SecretaryReservation): string {
    return (
      item.patientName?.trim() || item.PatientName?.trim() || "بیمار بدون نام"
    );
  }
  patientPhone(item: SecretaryReservation): string {
    return (
      item.patientPhoneNumber?.trim() || item.PatientPhoneNumber?.trim() || "-"
    );
  }
  consultantNameOf(item: SecretaryReservation): string {
    return (
      item.consultantFullName?.trim() || item.ConsultantFullName?.trim() || "-"
    );
  }
  serviceName(item: SecretaryReservation): string {
    return (
      item.requestedServiceName?.trim() ||
      item.businessName?.trim() ||
      item.BusinessName?.trim() ||
      "ثبت نشده"
    );
  }
  consultantReport(item: SecretaryReservation): string {
    return (
      item.consultantReport?.trim() ||
      item.description?.trim() ||
      item.Description?.trim() ||
      "گزارشی ثبت نشده"
    );
  }
  reservationAt(item: SecretaryReservation): string {
    return item.reservationAt || item.ReservationAt || "";
  }
  formatDate(value?: string | null): string {
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
  formatAppointmentTime(value?: string | null): string {
    return formatReservationTime(value);
  }

  private status(item: SecretaryReservation): number {
    return Number(
      item.reservationRequestStatus ??
        item.secretaryReservationReviewStatus ??
        item.SecretaryReservationReviewStatus ??
        0,
    );
  }

  private attendanceStatus(
    item: SecretaryReservation,
  ): AttendanceConfirmationStatus | null {
    return readAttendanceStatus(item, "attendanceConfirmationStatus");
  }

  private loadHistory(item: SecretaryReservation): void {
    const id = this.reservationId(item);
    if (!id) return;
    this.historyLoading = true;
    this.api
      .getReservationHistory(id)
      .pipe(
        finalize(() => {
          this.historyLoading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (history) => {
          this.history = history;
          this.cdr.markForCheck();
        },
        error: () => {
          this.history = [];
          this.cdr.markForCheck();
        },
      });
  }

  private validateDialog(item: SecretaryReservation): string | null {
    if (this.dialogMode === "reschedule") {
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
    if (this.dialogMode === "note" && !this.note.trim())
      return "متن یادداشت الزامی است";
    if (this.dialogMode === "followup") {
      if (!this.followUpDate || !this.followUpTime || !this.note.trim())
        return "تاریخ، ساعت و دلیل پیگیری الزامی است";
      if (
        new Date(
          this.combineDateTime(this.followUpDate, this.followUpTime),
        ).getTime() <= Date.now()
      )
        return "زمان پیگیری باید در آینده باشد";
    }
    return null;
  }

  private resolvedRejectionReason(): string {
    return this.reasonCode === 1
      ? "عدم ظرفیت"
      : this.reasonCode === 2
        ? "عدم پاسخ بیمار"
        : this.reasonCode === 3
          ? "درخواست لغو شده"
          : this.rejectionText.trim();
  }

  private combineDateTime(date: Date, time: string): string {
    const [hours, minutes] = time.split(":").map(Number);
    const value = new Date(date);
    value.setHours(hours, minutes, 0, 0);
    return value.toISOString();
  }

  private statusForQuickFilter(
    filter: QuickFilter,
  ): AttendanceConfirmationStatus | null {
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

  private applyPreset(preset: SecretaryDashboardPreset): void {
    this.preset = preset;
    this.quickFilter = "all";
    this.statusFilter = null;
    this.secretaryAnnouncementFilter =
      preset === "secretary-confirmed" ? "Confirmed" :
      preset === "secretary-no-answer" ? "NoAnswer" :
      preset === "secretary-cancelled" ? "CancelledByPatient" : "NotCalled";
    this.applyFilters();
  }

  private restoreFromUrl(): void {
    const params = this.route.snapshot.queryParamMap;
    const filter = params.get("requestFilter") as QuickFilter | null;
    if (filter && this.quickFilters.some((item) => item.value === filter))
      this.quickFilter = filter;
    const restoredStatus = Number(params.get("attendanceStatus"));
    this.statusFilter =
      params.has("attendanceStatus") &&
      STATUS_OPTIONS.some((option) => option.value === restoredStatus)
        ? (restoredStatus as AttendanceConfirmationStatus)
        : this.statusForQuickFilter(this.quickFilter);
    this.searchText = params.get("requestSearch") ?? "";
    this.consultantName = params.get("consultant") ?? "";
    this.reservationStatus = params.get("reservationStatus") ?? "";
    const announcement = params.get("secretaryAnnouncementStatus") as SecretaryAnnouncementStatus | null;
    this.secretaryAnnouncementFilter = SECRETARY_ANNOUNCEMENT_OPTIONS.some((option) => option.value === announcement) ? announcement : null;
    this.reservationDate = this.readDateParam(params.get("reservationDate"));
    this.fromDate = this.readDateParam(params.get("requestFrom"));
    this.toDate = this.readDateParam(params.get("requestTo"));
    this.dateFilterMode = this.fromDate || this.toDate ? "range" : "exact";
    this.sortDirection =
      params.get("requestDirection") === "asc" ? "asc" : "desc";
    this.pageNumber = Math.max(1, Number(params.get("requestPage")) || 1);
    this.pageSize = [10, 20, 50].includes(Number(params.get("requestPageSize")))
      ? Number(params.get("requestPageSize"))
      : 20;
  }

  private syncUrl(): void {
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
        reservationDate: this.toDateParam(this.reservationDate) ?? null,
        requestFrom: this.toDateParam(this.fromDate) ?? null,
        requestTo: this.toDateParam(this.toDate) ?? null,
        requestSort: null,
        requestDirection:
          this.sortDirection !== "desc" ? this.sortDirection : null,
        requestPage: this.pageNumber > 1 ? this.pageNumber : null,
        requestPageSize: this.pageSize !== 20 ? this.pageSize : null,
      },
    });
  }

  private toDateParam(value: Date | null): string | undefined {
    return value ? value.toISOString().slice(0, 10) : undefined;
  }
  private readDateParam(value: string | null): Date | null {
    if (!value) return null;
    const date = new Date(`${value}T12:00:00`);
    return Number.isFinite(date.getTime()) ? date : null;
  }
  private todayParam(): string {
    return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Tehran" });
  }
  private errorText(error: unknown, fallback: string): string {
    return error instanceof Error && error.message ? error.message : fallback;
  }
}
