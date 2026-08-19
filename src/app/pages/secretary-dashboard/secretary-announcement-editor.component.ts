import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { finalize } from "rxjs";
import { AuthService } from "../../core/auth/auth.service";
import { ReservationSyncService } from "../../core/reservation/reservation-sync.service";
import {
  SecretaryDashboardService,
  SecretaryReservation,
} from "../../core/secretary/secretary-dashboard.service";
import { ToastService } from "../../core/toast/toast.service";
import { formatIranDateTime } from "../../utils/iran-datetime.util";

@Component({
  selector: "app-secretary-announcement-editor",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./secretary-announcement-editor.component.html",
  styleUrl: "./secretary-announcement-editor.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecretaryAnnouncementEditorComponent implements OnChanges {
  @Input({ required: true }) reservation!: SecretaryReservation;
  @Output() readonly saved = new EventEmitter<void>();

  announcement = "";
  saving = false;
  private dirty = false;

  constructor(
    private api: SecretaryDashboardService,
    private auth: AuthService,
    private reservationSync: ReservationSyncService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnChanges(): void {
    if (this.dirty || this.saving) return;
    this.announcement =
      this.reservation.secretaryAnnouncement ??
      this.reservation.SecretaryAnnouncement ??
      "";
  }

  markDirty(): void {
    this.dirty = true;
  }

  save(): void {
    const reservationId = Number(this.reservation.id ?? this.reservation.Id);
    const secretaryUserId = this.auth.user()?.userId;
    if (!Number.isFinite(reservationId) || !secretaryUserId) {
      this.toast.error("شناسه رزرو یا شناسه کاربر منشی در دسترس نیست");
      return;
    }
    if (!this.canEdit || this.canceled || this.saving) return;

    this.saving = true;
    this.api
      .updateSecretaryAnnouncement({
        reservationId,
        secretaryUserId,
        secretaryAnnouncement: this.announcement.trim() || null,
      })
      .pipe(
        finalize(() => {
          this.saving = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (response) => {
          this.dirty = false;
          this.toast.success(response.message || "اعلام منشی با موفقیت ثبت شد");
          this.reservationSync.requestRefresh();
          this.saved.emit();
        },
        error: (error) =>
          this.toast.error(
            error instanceof Error && error.message
              ? error.message
              : "ثبت اعلام منشی انجام نشد",
          ),
      });
  }

  get canceled(): boolean {
    return (
      (this.reservation.isCanceled ?? this.reservation.IsCanceled) === true
    );
  }

  get canEdit(): boolean {
    return this.api.canUpdateAnnouncement(this.reservation);
  }

  get updatedAt(): string {
    const value =
      this.reservation.secretaryAnnouncementUpdatedAt ??
      this.reservation.SecretaryAnnouncementUpdatedAt;
    return value ? formatIranDateTime(value) : "";
  }

  get controlId(): string {
    return `secretaryAnnouncement${this.reservation.id ?? this.reservation.Id ?? 0}`;
  }
}
