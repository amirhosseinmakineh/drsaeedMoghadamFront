import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
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
export class BaseConfirmDialogComponent {
  @Input() open = false;
  @Input({ required: true }) title = "";
  @Input({ required: true }) message = "";
  @Input() confirmLabel = "تأیید";
  @Input() cancelLabel = "انصراف";
  @Input() variant: "default" | "danger" | "warning" = "default";
  @Input() loading = false;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  get confirmVariant(): "primary" | "danger" {
    return this.variant === "danger" ? "danger" : "primary";
  }
}
