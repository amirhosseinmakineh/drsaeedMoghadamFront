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
  SecretaryConsultantOption,
  SecretaryDashboardService,
  SecretaryReservation,
} from "../../core/secretary/secretary-dashboard.service";
import { BaseDatepickerComponent } from "../../shared/base/base-datepicker/base-datepicker.component";
import { NG_MODEL_UPDATE_ON_BLUR } from "../../shared/forms/ng-model-options";
import {
  formatIranDate,
  formatIranDateTime,
  formatIranTime,
  nowInIran,
  toIranDateInputValue,
} from "../../utils/iran-datetime.util";

@Component({
  selector: "app-secretary-schedule",
  standalone: true,
  imports: [CommonModule, FormsModule, BaseDatepickerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./secretary-schedule.component.html",
  styles: [
    `
      .schedule-panel {
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
      .filters {
        display: grid;
        grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr) auto;
        gap: 12px;
        align-items: end;
      }
      .consultant-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .consultant-chips button {
        border: 1px solid var(--line);
        border-radius: 999px;
        padding: 8px 12px;
        background: var(--surface-muted);
        font: inherit;
        font-weight: 900;
        cursor: pointer;
      }
      .consultant-chips button.active {
        border-color: color-mix(in srgb, var(--brand) 40%, var(--line));
        background: color-mix(in srgb, var(--brand) 14%, transparent);
        color: var(--brand);
      }
      .schedule-table {
        display: grid;
        gap: 10px;
      }
      .schedule-row {
        display: grid;
        grid-template-columns: 110px minmax(0, 1fr);
        gap: 12px;
        padding: 12px 14px;
        border: 1px solid var(--line);
        border-radius: 18px;
        background: var(--surface-muted);
      }
      .schedule-row strong {
        color: var(--brand);
      }
      .schedule-row small {
        display: block;
        color: var(--muted);
        font-weight: 800;
      }
      .secondary-action,
      .primary-action {
        min-height: 44px;
        border-radius: 16px;
        padding: 10px 16px;
        font: inherit;
        font-weight: 950;
      }
      .secondary-action {
        border: 1px solid var(--line);
        background: var(--surface-muted);
      }
      .primary-action {
        border: 0;
        background: linear-gradient(135deg, var(--brand), var(--brand-2));
        color: #1b1712;
      }
      label {
        display: grid;
        gap: 7px;
        color: var(--muted);
        font-weight: 850;
      }
      select {
        width: 100%;
        border: 1px solid var(--line);
        border-radius: 16px;
        padding: 11px 12px;
        background: var(--surface-muted);
        color: var(--text);
        font: inherit;
      }
      .feedback,
      .empty-copy {
        margin: 0;
        padding: 12px 14px;
        border-radius: 20px;
        font-weight: 950;
      }
      .feedback.error {
        background: color-mix(in srgb, var(--danger) 15%, var(--surface));
        color: #991b1b;
      }
      .empty-copy {
        border: 1px dashed var(--line);
        color: var(--muted);
      }
      @media (max-width: 760px) {
        .filters,
        .schedule-row {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class SecretaryScheduleComponent implements OnInit, OnChanges {
  @Input() profileReady = false;

  readonly datePickerLabel = { fa: "تاریخ نوبت‌ها", en: "Appointment date" };
  readonly ngModelBlurOptions = NG_MODEL_UPDATE_ON_BLUR;
  readonly preferredConsultantNames = ["سمانه", "غزل"];

  selectedDate = nowInIran();
  selectedDateLabel = "";
  consultantProfileId: number | null = null;
  consultants: SecretaryConsultantOption[] = [];
  items: SecretaryReservation[] = [];
  loading = false;
  feedback = "";

  constructor(
    private secretaryApi: SecretaryDashboardService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.syncSelectedDateLabel();
    if (this.profileReady) {
      this.loadConsultants();
      this.load();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["profileReady"]?.currentValue === true) {
      this.loadConsultants();
      this.load();
    }
  }

  onDateChange(date: Date): void {
    this.selectedDate = date;
    this.syncSelectedDateLabel();
    this.load();
  }

  applyFilters(): void {
    this.load();
  }

  selectConsultant(profileId: number | null): void {
    this.consultantProfileId = profileId;
    this.load();
  }

  isPreferredConsultant(option: SecretaryConsultantOption): boolean {
    const firstName = option.firstName.trim();
    return this.preferredConsultantNames.some((name) =>
      firstName.includes(name),
    );
  }

  load(): void {
    if (!this.profileReady) return;

    this.loading = true;
    this.feedback = "";
    this.cdr.markForCheck();

    this.secretaryApi
      .getReservations({
        date: toIranDateInputValue(this.selectedDate),
        consultantProfileId: this.consultantProfileId,
        includeCanceled: false,
        pageNumber: 1,
        pageSize: 200,
      })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (response) => {
          this.items = [...(response.items ?? [])].sort(
            (left, right) =>
              new Date(this.reservationAt(left)).getTime() -
              new Date(this.reservationAt(right)).getTime(),
          );
        },
        error: (error) => {
          this.feedback =
            error instanceof Error && error.message
              ? error.message
              : "دریافت برنامه نوبت‌ها انجام نشد";
        },
      });
  }

  private loadConsultants(): void {
    this.secretaryApi.getConsultantOptions().subscribe({
      next: (consultants) => {
        this.consultants = consultants;
        const preferred = consultants.find((option) =>
          this.isPreferredConsultant(option),
        );
        if (preferred && this.consultantProfileId == null) {
          this.consultantProfileId = preferred.profileId;
          this.load();
        }
        this.cdr.markForCheck();
      },
    });
  }

  private syncSelectedDateLabel(): void {
    this.selectedDateLabel = formatIranDate(this.selectedDate);
  }

  reservationAt(item: SecretaryReservation): string {
    return item.reservationAt ?? item.ReservationAt ?? "";
  }

  patientName(item: SecretaryReservation): string {
    return item.patientName ?? item.PatientName ?? "بدون نام";
  }

  patientPhone(item: SecretaryReservation): string {
    return item.patientPhoneNumber ?? item.PatientPhoneNumber ?? "-";
  }

  consultantName(item: SecretaryReservation): string {
    return (
      item.consultantFullName?.trim() || item.ConsultantFullName?.trim() || "-"
    );
  }

  formatReservation(value: string): string {
    return formatIranDateTime(value);
  }

  formatReservationTime(value: string): string {
    return formatIranTime(value);
  }
}
