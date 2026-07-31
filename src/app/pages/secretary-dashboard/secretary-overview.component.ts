import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from "@angular/core";
import { Subscription, finalize } from "rxjs";
import {
  AttendanceConfirmationStatus,
  readAttendanceStatus,
} from "../../core/reservation/reservation-attendance";
import {
  SecretaryDashboardService,
  SecretaryReservation,
} from "../../core/secretary/secretary-dashboard.service";
import { FaIconComponent } from "../../shared/ui/fa-icon/fa-icon.component";

export type SecretaryDashboardPreset =
  | "pending"
  | "confirmed-today"
  | "followups-today"
  | "no-show";

interface DashboardCard {
  preset: SecretaryDashboardPreset;
  title: string;
  description: string;
  icon: string;
  count: number;
  tone: string;
}

@Component({
  selector: "app-secretary-overview",
  standalone: true,
  imports: [CommonModule, FaIconComponent],
  templateUrl: "./secretary-overview.component.html",
  styleUrl: "./secretary-overview.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecretaryOverviewComponent implements OnChanges, OnDestroy {
  @Input() profileReady = false;
  @Output() openList = new EventEmitter<SecretaryDashboardPreset>();

  loading = false;
  errorMessage = "";
  reservations: SecretaryReservation[] = [];

  private loadSubscription: Subscription | null = null;
  private requestId = 0;

  constructor(
    private secretaryApi: SecretaryDashboardService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["profileReady"]?.currentValue === true) this.load();
  }

  ngOnDestroy(): void {
    this.loadSubscription?.unsubscribe();
  }

  get cards(): DashboardCard[] {
    return [
      {
        preset: "pending",
        title: "درخواست‌های رزرو جدید",
        description: "در انتظار بررسی منشی",
        icon: "calendar",
        count: this.pendingRequests.length,
        tone: "info",
      },
      {
        preset: "confirmed-today",
        title: "رزروهای تاییدشده امروز",
        description: "مراجعه‌های قطعی امروز",
        icon: "check",
        count: this.confirmedToday.length,
        tone: "success",
      },
      {
        preset: "followups-today",
        title: "پیگیری‌های امروز",
        description: "تماس و یادآوری امروز",
        icon: "phone",
        count: this.followUpsToday.length,
        tone: "warning",
      },
      {
        preset: "no-show",
        title: "عدم مراجعه",
        description: "بیماران مراجعه‌نکرده",
        icon: "close",
        count: this.noShows.length,
        tone: "danger",
      },
    ];
  }

  get pendingRequests(): SecretaryReservation[] {
    return this.activeReservations.filter(
      (item) => this.reviewStatus(item) === 1,
    );
  }

  get confirmedToday(): SecretaryReservation[] {
    return this.activeReservations
      .filter(
        (item) =>
          this.isToday(this.reservationAt(item)) &&
          [2, 3].includes(this.reviewStatus(item) ?? 0),
      )
      .sort((left, right) => this.timeOf(left) - this.timeOf(right));
  }

  get followUpsToday(): SecretaryReservation[] {
    return this.activeReservations
      .filter(
        (item) =>
          this.isToday(this.followUpAt(item)) ||
          this.isToday(this.reminderAt(item)) ||
          this.readBoolean(item, "needsFollowUp", "NeedsFollowUp") === true,
      )
      .sort((left, right) => this.priorityOf(right) - this.priorityOf(left));
  }

  get noShows(): SecretaryReservation[] {
    const now = Date.now();
    return this.activeReservations.filter((item) => {
      const reservationTime = this.timeOf(item);
      return (
        reservationTime > 0 &&
        reservationTime < now &&
        this.readBoolean(
          item,
          "consultantSaysPatientAttended",
          "ConsultantSaysPatientAttended",
        ) === false &&
        readAttendanceStatus(item, "attendanceConfirmationStatus") ===
          AttendanceConfirmationStatus.SecretaryApproved
      );
    });
  }

  get upcomingReservations(): SecretaryReservation[] {
    const now = Date.now();
    return this.activeReservations
      .filter((item) => this.timeOf(item) >= now)
      .sort((left, right) => this.timeOf(left) - this.timeOf(right))
      .slice(0, 5);
  }

  get unconfirmedReservations(): SecretaryReservation[] {
    return this.activeReservations
      .filter(
        (item) =>
          this.readBoolean(
            item,
            "isConfirmedWithPatient",
            "IsConfirmedWithPatient",
          ) === false,
      )
      .slice(0, 5);
  }

  get recentActivities(): SecretaryReservation[] {
    return [...this.reservations]
      .filter((item) => Boolean(this.activityAt(item)))
      .sort(
        (left, right) =>
          this.dateTimeOf(this.activityAt(right)) -
          this.dateTimeOf(this.activityAt(left)),
      )
      .slice(0, 5);
  }

  load(): void {
    if (!this.profileReady) return;
    const requestId = ++this.requestId;
    this.loading = true;
    this.errorMessage = "";
    this.loadSubscription?.unsubscribe();
    this.loadSubscription = this.secretaryApi
      .getDashboardReservations()
      .pipe(
        finalize(() => {
          if (requestId !== this.requestId) return;
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (items) => {
          if (requestId !== this.requestId) return;
          this.reservations = items ?? [];
          this.cdr.markForCheck();
        },
        error: (error) => {
          if (requestId !== this.requestId) return;
          this.reservations = [];
          this.errorMessage =
            error instanceof Error && error.message
              ? error.message
              : "اطلاعات داشبورد دریافت نشد";
          this.cdr.markForCheck();
        },
      });
  }

  patientName(item: SecretaryReservation): string {
    return item.patientName ?? item.PatientName ?? "بیمار بدون نام";
  }

  reservationAt(item: SecretaryReservation): string {
    return item.reservationAt ?? item.ReservationAt ?? "";
  }

  formatDateTime(value: string): string {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return "زمان ثبت نشده";
    return new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "Asia/Tehran",
    }).format(date);
  }

  trackReservation(_: number, item: SecretaryReservation): number | string {
    return item.id ?? item.Id ?? this.reservationAt(item);
  }

  private get activeReservations(): SecretaryReservation[] {
    return this.reservations.filter(
      (item) => !(item.isCanceled ?? item.IsCanceled ?? false),
    );
  }

  private reviewStatus(item: SecretaryReservation): number | null {
    const value =
      item.secretaryReservationReviewStatus ??
      item.SecretaryReservationReviewStatus;
    const status = Number(value);
    return Number.isFinite(status) ? status : null;
  }

  private followUpAt(item: SecretaryReservation): string {
    return item.followUpAt ?? item.FollowUpAt ?? "";
  }

  private reminderAt(item: SecretaryReservation): string {
    return item.reminderAt ?? item.ReminderAt ?? "";
  }

  private activityAt(item: SecretaryReservation): string {
    return (
      item.lastActivityAt ??
      item.LastActivityAt ??
      item.secretaryReviewedAt ??
      item.SecretaryReviewedAt ??
      ""
    );
  }

  private priorityOf(item: SecretaryReservation): number {
    return Number(item.followUpPriority ?? item.FollowUpPriority ?? 0) || 0;
  }

  private timeOf(item: SecretaryReservation): number {
    return this.dateTimeOf(this.reservationAt(item));
  }

  private dateTimeOf(value: string): number {
    const time = new Date(value).getTime();
    return Number.isFinite(time) ? time : 0;
  }

  private isToday(value: string): boolean {
    if (!value) return false;
    const time = this.dateTimeOf(value);
    if (!time) return false;
    return (
      this.tehranDateKey(new Date(time)) === this.tehranDateKey(new Date())
    );
  }

  private tehranDateKey(date: Date): string {
    return new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Tehran",
    }).format(date);
  }

  private readBoolean(
    item: SecretaryReservation,
    camelKey: keyof SecretaryReservation,
    pascalKey: keyof SecretaryReservation,
  ): boolean | null {
    const value = item[camelKey] ?? item[pascalKey];
    return typeof value === "boolean" ? value : null;
  }
}
