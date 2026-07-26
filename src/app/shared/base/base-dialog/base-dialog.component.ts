import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { LanguageCode } from "../../../models/clinic.model";
import { FaIconComponent } from "../../ui/fa-icon/fa-icon.component";

@Component({
  selector: "app-base-dialog",
  standalone: true,
  imports: [CommonModule, FaIconComponent],
  templateUrl: "./base-dialog.component.html",
  styleUrl: "./base-dialog.component.scss",
})
export class BaseDialogComponent {
  @Input() open = false;
  @Input() language: LanguageCode = "fa";
  @Input() title = "";
  @Input() subtitle = "";
  @Input() showFooter = true;
  @Input() closable = true;
  @Input() confirmDisabled = false;
  @Input() size: "default" | "wide" = "default";
  @Input() confirmText = "تایید";
  @Input() cancelText = "انصراف";
  @Output() openChange = new EventEmitter<boolean>();
  @Output() confirmClick = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  confirm(): void {
    if (this.confirmDisabled) return;
    this.confirmClick.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target !== event.currentTarget) return;

    event.preventDefault();
    event.stopPropagation();
    this.close();
  }

  close(): void {
    if (!this.closable) return;

    this.open = false;
    this.openChange.emit(this.open);
    this.closed.emit();
  }
}
