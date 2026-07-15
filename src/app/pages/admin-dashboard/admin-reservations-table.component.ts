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

type ReservationTableMode = "system" | "consultant";
type ReservationView = "reservations" | "attendanceConfirmations";

@Component({
  selector: "app-admin-reservations-table",
  standalone: true,
  imports: [CommonModule, FormsModule, BaseDatepickerComponent, TableComponent],
  template: `
    <section class="admin-panel">
      <header class="panel-heading">
        <div>
          <span>{{ view === "attendanceConfirmations" ? "تایید حضور" : "رزروها" }}</span>
          <h2>{{ title }}</h2>
          @if (filterByDate && selectedDatePersian) {
            <p>بیماران روز: {{ selectedDatePersian }}</p>
          }
        </div>
        <button
          class="secondary-action compact"
          type="button"
          [disabled]="loading"
          (click)="load()"
        >
          بروزرسانی
        </button>
      </header>

      <div class="view-switch">
        <button
          type="button"
          [class.active]="view === 'reservations'"
          (click)="setView('reservations')"
        >
          لیست رزروها
        </button>
        <button
          type="button"
          [class.active]="view === 'attendanceConfirmations'"
          (click)="setView('attendanceConfirmations')"
        >
          تایید حضور مشاوران
        </button>
      </div>

      <div class="calendar-block">
        <div class="calendar-toolbar">
          <label class="checkbox-field">
            <input
              type="checkbox"
              [(ngModel)]="filterByDate"
              name="filterByDate"
              (change)="onFilterByDateToggle()"
            />
            نمایش بر اساس روز انتخاب‌شده
          </label>
        </div>
        @if (filterByDate) {
          <app-base-datepicker
            [label]="datePickerLabel"
            [selectedDate]="selectedDate"
            [allowToday]="true"
            (dateChange)="onDateChange($event)"
          ></app-base-datepicker>
        }
      </div>

      <div class="export-bar">
        <button
          class="export-action"
          type="button"
          [disabled]="exportingReservations"
          (click)="exportReservations()"
        >
          {{
            exportingReservations
              ? "در حال آماده‌سازی..."
              : "دانلود گزارش رزروها"
          }}
        </button>
        <button
          class="export-action"
          type="button"
          [disabled]="exportingAttendance"
          (click)="exportAttendanceConfirmations()"
        >
          {{
            exportingAttendance
              ? "در حال آماده‌سازی..."
              : "دانلود گزارش تایید حضور مشاوران"
          }}
        </button>
      </div>

      <form class="filter-grid" (ngSubmit)="applyFilters()">
        <label>
          وضعیت
          <select
            [(ngModel)]="filters.attendanceConfirmationStatus"
            [ngModelOptions]="ngModelBlurOptions"
            name="reservationStatus"
          >
            <option [ngValue]="null">همه</option>
            <option [ngValue]="1">منتظر اعلام مشاور</option>
            <option [ngValue]="2">مشاور: بیمار آمده</option>
            <option [ngValue]="3">مشاور: بیمار نیامده</option>
            <option [ngValue]="4">تایید نهایی منشی</option>
            <option [ngValue]="5">رد نهایی منشی</option>
          </select>
        </label>
        <label class="checkbox-field">
          <input
            type="checkbox"
            [(ngModel)]="filters.includeCanceled"
            name="includeCanceled"
          />
          نمایش لغوشده‌ها
        </label>
        <button class="primary-filter" type="submit">اعمال فیلتر</button>
      </form>

      @if (feedback) {
        <p class="feedback error">{{ feedback }}</p>
      }

      <app-base-table
        [columns]="columns"
        [data]="items"
        [showAdd]="false"
        [showEdit]="false"
        [showDelete]="false"
        [loading]="loading"
        [currentPage]="filters.pageNumber"
        [pageSize]="filters.pageSize"
        [totalCount]="totalCount"
        [totalPages]="totalPages"
        [emptyText]="emptyText()"
        (pageChange)="changePage($event)"
      ></app-base-table>
    </section>
  `,
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
  selectedDate = new Date();
  selectedDatePersian = "";
  filterByDate = true;
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
    includeCanceled: false,
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

  onFilterByDateToggle(): void {
    this.syncDateFilter();
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
    if (this.filterByDate && this.selectedDatePersian) {
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
    if (this.filterByDate) {
      this.filters.date = this.toDateString(this.selectedDate);
      delete this.filters.from;
      delete this.filters.to;
      return;
    }

    delete this.filters.date;
    delete this.filters.from;
    delete this.filters.to;
  }

  private exportFilters(): {
    from?: string;
    to?: string;
    consultantProfileId?: number;
  } {
    const consultantProfileId = this.filters.consultantProfileId ?? undefined;
    if (!this.filterByDate) {
      return { consultantProfileId };
    }

    const date = this.toDateString(this.selectedDate);
    return {
      consultantProfileId,
      from: date,
      to: date,
    };
  }

  private syncSelectedDatePersian(): void {
    if (!this.filterByDate) {
      this.selectedDatePersian = "";
      return;
    }

    this.selectedDatePersian = this.selectedDate.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  private toDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("fa-IR");
  }

  private errorMessage(error: unknown, fallback: string): string {
    return error instanceof Error && error.message ? error.message : fallback;
  }
}
