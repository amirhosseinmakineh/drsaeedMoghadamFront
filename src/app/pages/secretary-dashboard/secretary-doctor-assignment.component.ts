import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Subscription, finalize } from "rxjs";
import {
  SecretaryDashboardService,
  SecretaryReservation,
} from "../../core/secretary/secretary-dashboard.service";
import { ToastService } from "../../core/toast/toast.service";
import { BaseDatepickerComponent } from "../../shared/base";

@Component({
  selector: "app-secretary-doctor-assignment",
  standalone: true,
  imports: [CommonModule, FormsModule, BaseDatepickerComponent],
  templateUrl: "./secretary-doctor-assignment.component.html",
  styleUrl: "./secretary-doctor-assignment.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecretaryDoctorAssignmentComponent implements OnDestroy {
  reservationDate: Date | null = null;
  fromTime = "";
  toTime = "";
  reservations: SecretaryReservation[] = [];
  selectedReservationId: number | null = null;
  selectedReservation: SecretaryReservation | null = null;
  doctorName = "";
  loading = false;
  detailsLoading = false;
  saving = false;
  filtersApplied = false;
  errorMessage = "";

  private requestSubscription: Subscription | null = null;

  constructor(
    private api: SecretaryDashboardService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnDestroy(): void {
    this.requestSubscription?.unsubscribe();
  }

  applyFilters(): void {
    if (!this.reservationDate || !this.fromTime || !this.toTime) {
      this.errorMessage = "تاریخ، ساعت شروع و ساعت پایان را وارد کنید.";
      return;
    }
    if (this.fromTime >= this.toTime) {
      this.errorMessage = "ساعت پایان باید بعد از ساعت شروع باشد.";
      return;
    }

    this.requestSubscription?.unsubscribe();
    this.loading = true;
    this.filtersApplied = true;
    this.errorMessage = "";
    this.clearSelection();
    this.requestSubscription = this.api
      .getReservations({
        fromDate: this.dateParam(this.reservationDate),
        toDate: this.dateParam(this.reservationDate),
        fromTime: this.fromTime,
        toTime: this.toTime,
        includeCanceled: false,
        sortDirection: "asc",
        pageNumber: 1,
        pageSize: 200,
      })
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (response) => {
          this.reservations = response.items;
        },
        error: (error: Error) => {
          this.reservations = [];
          this.errorMessage = error.message;
        },
      });
  }

  selectReservation(): void {
    const reservationId = Number(this.selectedReservationId);
    if (!Number.isFinite(reservationId) || this.detailsLoading) return;

    this.detailsLoading = true;
    this.errorMessage = "";
    this.selectedReservation = null;
    this.api.getReservationDetails(reservationId)
      .pipe(finalize(() => {
        this.detailsLoading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (reservation) => {
          this.selectedReservation = reservation;
          this.doctorName = this.doctorNameOf(reservation) === "-"
            ? ""
            : this.doctorNameOf(reservation);
        },
        error: (error: Error) => {
          this.errorMessage = error.message;
        },
      });
  }

  saveDoctor(): void {
    const doctorName = this.doctorName.trim();
    const reservationId = this.selectedReservationId;
    if (!doctorName || reservationId == null || this.saving) return;

    this.saving = true;
    this.errorMessage = "";
    this.api.assignDoctor(reservationId, doctorName)
      .pipe(finalize(() => {
        this.saving = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: () => {
          if (this.selectedReservation) {
            this.selectedReservation = {
              ...this.selectedReservation,
              doctorName,
              DoctorName: doctorName,
            };
          }
          this.toast.success("دکتر با موفقیت به بیمار تخصیص داده شد.");
        },
        error: (error: Error) => {
          this.errorMessage = error.message;
          this.toast.error(error.message);
        },
      });
  }

  reservationId(item: SecretaryReservation): number | null {
    const id = Number(item.id ?? item.Id);
    return Number.isFinite(id) ? id : null;
  }

  patientName(item: SecretaryReservation): string {
    return item.patientName?.trim() || item.PatientName?.trim() || "بیمار بدون نام";
  }

  patientPhone(item: SecretaryReservation): string {
    return item.patientPhoneNumber?.trim() || item.PatientPhoneNumber?.trim() || "-";
  }

  consultantName(item: SecretaryReservation): string {
    return item.consultantFullName?.trim() || item.ConsultantFullName?.trim() || "-";
  }

  doctorNameOf(item: SecretaryReservation): string {
    return item.doctorName?.trim() || item.DoctorName?.trim() || "-";
  }

  reservationDateLabel(item: SecretaryReservation): string {
    const value = item.reservationAt ?? item.ReservationAt;
    return this.formatDatePart(value, { dateStyle: "medium" });
  }

  reservationTimeLabel(item: SecretaryReservation): string {
    const value = item.reservationAt ?? item.ReservationAt;
    return this.formatDatePart(value, { hour: "2-digit", minute: "2-digit" });
  }

  private clearSelection(): void {
    this.reservations = [];
    this.selectedReservationId = null;
    this.selectedReservation = null;
    this.doctorName = "";
  }

  private dateParam(value: Date): string {
    return value.toLocaleDateString("en-CA", { timeZone: "Asia/Tehran" });
  }

  private formatDatePart(
    value: string | null | undefined,
    options: Intl.DateTimeFormatOptions,
  ): string {
    if (!value) return "-";
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return "-";
    return new Intl.DateTimeFormat("fa-IR", {
      ...options,
      timeZone: "Asia/Tehran",
    }).format(date);
  }
}
