import {
  ChangeDetectionStrategy,

  EventEmitter,


} from "@angular/core";
import { BaseModalComponent } from "../modal/modal.component";
import { BaseButtonComponent } from "../../actions/base-button/base-button.component";
@Component({
  selector: "app-base-confirm-dialog",
  standalone: true,
  imports: [BaseModalComponent, BaseButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-base-modal
    [open]="open"
    [title]="title"
    [closeOnBackdrop]="!loading"
    (close)="cancel.emit()"
    ><p>{{ message }}</p>
    <div baseModalFooter>
      <app-base-button variant="secondary" [disabled]="loading" (pressed)="cancel.emit()">{{
        cancelLabel
      }}</app-base-button
      ><app-base-button
        [variant]="confirmVariant"
        [loading]="loading"
        (pressed)="confirm.emit()"
        >{{ confirmLabel }}</app-base-button
      >
    </div></app-base-modal
  >`,
})
export class BaseConfirmDialogComponent {constructor() { BaseConfirmDialogComponent.prototype.__init.call(this);BaseConfirmDialogComponent.prototype.__init2.call(this);BaseConfirmDialogComponent.prototype.__init3.call(this);BaseConfirmDialogComponent.prototype.__init4.call(this);BaseConfirmDialogComponent.prototype.__init5.call(this);BaseConfirmDialogComponent.prototype.__init6.call(this);BaseConfirmDialogComponent.prototype.__init7.call(this);BaseConfirmDialogComponent.prototype.__init8.call(this);BaseConfirmDialogComponent.prototype.__init9.call(this); }
  Input() __init() {this.open = false}
  Input({ required: true }) __init2() {this.title = ""}
  Input({ required: true }) __init3() {this.message = ""}
  Input() __init4() {this.confirmLabel = "تأیید"}
  Input() __init5() {this.cancelLabel = "انصراف"}
  Input() __init6() {this.variant = "default"}
  Input() __init7() {this.loading = false}
  Output() __init8() {this.confirm = new EventEmitter()}
  Output() __init9() {this.cancel = new EventEmitter()}
  get confirmVariant() {
    return this.variant === "danger" ? "danger" : "primary";
  }
}
