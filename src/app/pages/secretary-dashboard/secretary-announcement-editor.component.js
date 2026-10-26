 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,


  EventEmitter,



} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { finalize } from "rxjs";






import { formatIranDateTime } from "../../utils/iran-datetime.util";

@Component({
  selector: "app-secretary-announcement-editor",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./secretary-announcement-editor.component.html",
  styleUrl: "./secretary-announcement-editor.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecretaryAnnouncementEditorComponent  {
  Input({ required: true }) 
  Output()  __init() {this.saved = new EventEmitter()}

  __init2() {this.announcement = ""}
  __init3() {this.saving = false}
   __init4() {this.dirty = false}

  constructor(
     api,
     reservationSync,
     toast,
     cdr,
  ) {;this.api = api;this.reservationSync = reservationSync;this.toast = toast;this.cdr = cdr;SecretaryAnnouncementEditorComponent.prototype.__init.call(this);SecretaryAnnouncementEditorComponent.prototype.__init2.call(this);SecretaryAnnouncementEditorComponent.prototype.__init3.call(this);SecretaryAnnouncementEditorComponent.prototype.__init4.call(this);}

  ngOnChanges() {
    if (this.dirty || this.saving) return;
    this.announcement =
      _nullishCoalesce(_nullishCoalesce(_nullishCoalesce(_nullishCoalesce(this.reservation.secretaryAnnouncementDescription, () => (
      this.reservation.SecretaryAnnouncementDescription)), () => (
      this.reservation.secretaryAnnouncement)), () => (
      this.reservation.SecretaryAnnouncement)), () => (
      ""));
  }

  markDirty() {
    this.dirty = true;
  }

  save() {
    const reservationId = Number(_nullishCoalesce(this.reservation.id, () => ( this.reservation.Id)));
    if (!Number.isFinite(reservationId)) {
      this.toast.error("شناسه رزرو در دسترس نیست");
      return;
    }
    if (!this.canEdit || this.canceled || this.saving) return;

    this.saving = true;
    this.api
      .updateSecretaryAnnouncement({
        reservationId,
        status:
          _nullishCoalesce(_nullishCoalesce(this.reservation.secretaryAnnouncementStatus, () => (
          this.reservation.SecretaryAnnouncementStatus)), () => (
          "NotCalled")),
        description: this.announcement.trim() || null,
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

  get canceled() {
    return (
      (_nullishCoalesce(this.reservation.isCanceled, () => ( this.reservation.IsCanceled))) === true
    );
  }

  get canEdit() {
    return this.api.canUpdateAnnouncement(this.reservation);
  }

  get updatedAt() {
    const value =
      _nullishCoalesce(this.reservation.secretaryAnnouncementUpdatedAt, () => (
      this.reservation.SecretaryAnnouncementUpdatedAt));
    return value ? formatIranDateTime(value) : "";
  }

  get controlId() {
    return `secretaryAnnouncement${_nullishCoalesce(_nullishCoalesce(this.reservation.id, () => ( this.reservation.Id)), () => ( 0))}`;
  }
}
