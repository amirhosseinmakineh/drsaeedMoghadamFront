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
import { finalize, Subscription } from "rxjs";
import {
  AdminDashboardService,
  SecretaryReservation,
  SecretaryReservationFilters,
} from "../../core/admin/admin-dashboard.service";
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
  TableColumn,
  TableComponent,
} from "../../shared/base/table/table.component";
import { NG_MODEL_UPDATE_ON_BLUR } from "../../shared/forms/ng-model-options";
import { formatIranDateTime, formatReservationTime, startOfIranDay, toIranDateInputValue } from "../../utils/iran-datetime.util";
import { ReservationSyncService } from "../../core/reservation/reservation-sync.service";

type ReservationTableMode = "system" | "consultant";
type ReservationView = "reservations" | "attendanceConfirmations";

@Component({
  selector: "app-admin-reservations-table",
  standalone: true,
  imports: [CommonModule, FormsModule, BaseDatepickerComponent, TableComponent],
  templateUrl: "./admin-reservations-table.component.html",
  styleUrl: "./admin-reservations-table.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminReservationsTableComponent implements OnInit, OnChanges, OnDestroy {
  @Input() mode: ReservationTableMode = "system";
  @Input() profileId: number | null = null;
  @Input() title = "مدیریت رزروها و تایید حضور";

  readonly ngModelBlurOptions = NG_MODEL_UPDATE_ON_BLUR;
  readonly datePickerLabel = { fa: "انتخاب روز", en: "Select day" };

  view: ReservationView = "reservations";
  selectedDate = startOfIranDay();
  selectedDatePersian = "";
  items: SecretaryReservation[] = [];
  loading = false;
  exportingReservations = false;
  exportingAttendance = false;
  feedback = "";
  totalCount = 0;
  totalPages = 1;
  private readonly refreshSubscription: Subscription;

  filters: SecretaryReservationFilters = {
    pageNumber: 1,
    pageSize: 10,
    attendanceConfirmationStatus: null,
  };

  readonly columns: TableColumn<SecretaryReservation>[] = [
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
      key: "secretaryAnnouncement",
      label: "اعلام منشی",
      value: (row) =>
        row.secretaryAnnouncement?.trim() ||
        row.SecretaryAnnouncement?.trim() ||
        "-",
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
          row.consultantSaysPatientAttended ?? row.ConsultantSaysPatientAttended,
        ),
    },
    {
      key: "city",
      label: "شهر",
      value: (row) => this.patientCity(row),
    },
  ];

  constructor(
    private adminApi: AdminDashboardService,
    reservationSync: ReservationSyncService,
    private cdr: ChangeDetectorRef,
  ) {
    this.refreshSubscription = reservationSync.refreshRequested$.subscribe(() => this.load());
  }

  ngOnDestroy(): void {
    this.refreshSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.syncProfileFilter();
    this.syncDateFilter();
    this.syncSelectedDatePersian();
    this.load();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["profileId"] || changes["mode"]) {
      this.syncProfileFilter();
      this.filters.pageNumber = 1;
      this.load();
    }
  }

  setView(view: ReservationView): void {
    this.view = view;
    this.filters.pageNumber = 1;
    this.load();
  }

  onDateChange(date: Date): void {
    this.selectedDate = date;
    this.syncDateFilter();
    this.syncSelectedDatePersian();
    this.filters.pageNumber = 1;
    this.load();
  }

  applyFilters(): void {
    this.syncDateFilter();
    this.syncSelectedDatePersian();
    this.filters.pageNumber = 1;
    this.load();
  }

  changePage(page: number): void {
    this.filters.pageNumber = page;
    this.load();
  }

  load(): void {
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
        }),
      )
      .subscribe({
        next: (response) => {
          this.items = response.items ?? [];
          this.totalCount = response.totalCount ?? this.items.length;
          this.totalPages = Math.max(
            1,
            response.totalPages ??
              Math.ceil(this.totalCount / this.filters.pageSize),
          );
        },
        error: (error) => {
          this.feedback = this.errorMessage(error, "دریافت رزروها انجام نشد");
        },
      });
  }

  exportReservations(): void {
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

  exportAttendanceConfirmations(): void {
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

  emptyText(): string {
    if (this.selectedDatePersian) {
      return this.view === "attendanceConfirmations"
        ? `تایید حضوری برای ${this.selectedDatePersian} وجود ندارد.`
        : `رزروی برای ${this.selectedDatePersian} وجود ندارد.`;
    }

    return this.view === "attendanceConfirmations"
      ? "تایید حضوری برای نمایش وجود ندارد."
      : "رزروی برای نمایش وجود ندارد.";
  }

  private syncProfileFilter(): void {
    this.filters.consultantProfileId =
      this.mode === "consultant" && this.profileId ? this.profileId : null;
  }

  private syncDateFilter(): void {
    this.filters.date = this.toDateString(this.selectedDate);
    delete this.filters.from;
    delete this.filters.to;
    delete this.filters.includeCanceled;
  }

  private exportFilters(): {
    from?: string;
    to?: string;
    consultantProfileId?: number;
  } {
    const consultantProfileId = this.filters.consultantProfileId ?? undefined;
    const date = this.toDateString(this.selectedDate);
    return {
      consultantProfileId,
      from: date,
      to: date,
    };
  }

  private syncSelectedDatePersian(): void {
    this.selectedDatePersian = this.selectedDate.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Tehran",
    });
  }

  private toDateString(date: Date): string {
    return toIranDateInputValue(date);
  }

  private patientName(row: SecretaryReservation): string {
    return row.patientName ?? row.PatientName ?? "-";
  }

  private patientPhone(row: SecretaryReservation): string {
    return row.patientPhoneNumber ?? row.PatientPhoneNumber ?? "-";
  }

  private patientCity(row: SecretaryReservation): string {
    return row.patientCity ?? row.PatientCity ?? "-";
  }

  private consultantName(row: SecretaryReservation): string {
    return row.consultantFullName ?? row.ConsultantFullName ?? "-";
  }

  private reservationAt(row: SecretaryReservation): string {
    return row.reservationAt ?? row.ReservationAt ?? "";
  }

  private formatDateTime(value: string): string {
    return formatIranDateTime(value);
  }

  private errorMessage(error: unknown, fallback: string): string {
    return error instanceof Error && error.message ? error.message : fallback;
  }
}
