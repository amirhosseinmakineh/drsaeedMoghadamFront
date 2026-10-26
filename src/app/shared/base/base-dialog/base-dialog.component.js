import { CommonModule } from "@angular/common";
import { EventEmitter, } from "@angular/core";

import { FaIconComponent } from "../../ui/fa-icon/fa-icon.component";

@Component({
  selector: "app-base-dialog",
  standalone: true,
  imports: [CommonModule, FaIconComponent],
  templateUrl: "./base-dialog.component.html",
  styleUrl: "./base-dialog.component.scss",
})
export class BaseDialogComponent {constructor() { BaseDialogComponent.prototype.__init.call(this);BaseDialogComponent.prototype.__init2.call(this);BaseDialogComponent.prototype.__init3.call(this);BaseDialogComponent.prototype.__init4.call(this);BaseDialogComponent.prototype.__init5.call(this);BaseDialogComponent.prototype.__init6.call(this);BaseDialogComponent.prototype.__init7.call(this);BaseDialogComponent.prototype.__init8.call(this);BaseDialogComponent.prototype.__init9.call(this);BaseDialogComponent.prototype.__init10.call(this);BaseDialogComponent.prototype.__init11.call(this);BaseDialogComponent.prototype.__init12.call(this);BaseDialogComponent.prototype.__init13.call(this); }
  Input() __init() {this.open = false}
  Input() __init2() {this.language = "fa"}
  Input() __init3() {this.title = ""}
  Input() __init4() {this.subtitle = ""}
  Input() __init5() {this.showFooter = true}
  Input() __init6() {this.closable = true}
  Input() __init7() {this.confirmDisabled = false}
  Input() __init8() {this.size = "default"}
  Input() __init9() {this.confirmText = "تایید"}
  Input() __init10() {this.cancelText = "انصراف"}
  Output() __init11() {this.openChange = new EventEmitter()}
  Output() __init12() {this.confirmClick = new EventEmitter()}
  Output() __init13() {this.closed = new EventEmitter()}

  confirm() {
    if (this.confirmDisabled) return;
    this.confirmClick.emit();
  }

  onBackdropClick(event) {
    if (event.target !== event.currentTarget) return;

    event.preventDefault();
    event.stopPropagation();
    this.close();
  }

  close() {
    if (!this.closable) return;

    this.open = false;
    this.openChange.emit(this.open);
    this.closed.emit();
  }
}
