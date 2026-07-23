import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { finalize } from "rxjs";
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
import { formatIranDateTime, startOfIranDay, toIranDateInputValue } from "../../utils/iran-datetime.util";

type ReservationTableMode = "system" | "consultant";
type ReservationView = "reservations" | "attendanceConfirmations";

@Component({
  selector: "app-admin-reservations-table",
  standalone: true,
  imports: [CommonModule, FormsModule, BaseDatepickerComponent, TableComponent],
  templateUrl: "./admin-reservations-table.component.html",
  styles: [
    `
      .admin-panel {
        display: grid;
        gap: 16px;
        padding: 18px;
        border: 1px solid var(--line);
        border-radius: 30px;
        background: var(--surface);
        box-shadow: var(--shadow);
      }
      .panel-heading {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
        align-items: flex-start;
      }
      .panel-heading span {
        display: inline-flex;
        margin-bottom: 8px;
        padding: 5px 12px;
        border-radius: 999px;
        background: color-mix(in srgb, var(--brand) 14%, transparent);
        color: var(--brand);
        font-weight: 950;
      }
      .panel-heading h2 {
        margin: 0;
        font-size: 1.35rem;
      }
      .panel-heading p {
        margin: 8px 0 0;
        color: var(--muted);
        font-weight: 800;
        font-size: 0.92rem;
      }
      .view-switch {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .view-switch button {
        border: 1px solid var(--line);
        border-radius: 999px;
        padding: 8px 14px;
        background: var(--surface);
        font-weight: 900;
      }
      .view-switch button.active {
        background: color-mix(in srgb, var(--brand) 14%, var(--surface));
        border-color: color-mix(in srgb, var(--brand) 30%, var(--line));
        color: var(--brand);
      }
      .calendar-block {
        display: grid;
        gap: 12px;
        padding: 14px;
        border: 1px dashed var(--line);
        border-radius: 24px;
        background: color-mix(in srgb, var(--surface-muted) 55%, var(--surface));
      }
      .calendar-toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: center;
      }
      .export-bar {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      .export-action {
        max-width: 100%;
        white-space: normal;
        text-align: center;
      }
      .export-action,
      .primary-filter,
      .secondary-action.compact {
        border: 0;
        border-radius: 999px;
        padding: 10px 16px;
        font-weight: 900;
        cursor: pointer;
      }
      .export-action {
        background: color-mix(in srgb, var(--brand) 14%, var(--surface));
        color: var(--brand);
      }
      .primary-filter {
        background: var(--brand);
        color: #fff;
      }
      .filter-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 12px;
        align-items: end;
      }
      .checkbox-field {
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 44px;
      }
      .feedback {
        margin: 0;
      }
      @media (max-width: 980px) {
        .filter-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .export-action {
          flex: 1 1 220px;
        }
      }
      @media (max-width: 760px) {
        .admin-panel {
          padding: 14px;
          border-radius: 24px;
        }
        .filter-grid {
          grid-template-columns: 1fr;
        }
        .panel-heading {
          display: grid;
        }
        .export-action {
          width: 100%;
          flex: 1 1 100%;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminReservationsTableComponent implements OnInit, OnChanges {
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
      label: "زمان رزرو",
      value: (row) => this.formatDateTime(this.reservationAt(row)),
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
    private cdr: ChangeDetectorRef,
  ) {}

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
