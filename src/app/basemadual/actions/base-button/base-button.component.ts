import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from "@angular/core";
import { BaseButtonVariant } from "../../models/base-ui.models";
@Component({
  selector: "app-base-button",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<button
    [class]="variant"
    [type]="type"
    [disabled]="disabled || loading"
    (click)="pressed.emit()"
  >
    @if (loading) {
      <span class="spinner" aria-hidden="true"></span>
    }
    <ng-content />
  </button>`,
  styleUrl: "./base-button.component.scss",
})
export class BaseButtonComponent {
  @Input() variant: BaseButtonVariant = "primary";
  @Input() type: "button" | "submit" | "reset" = "button";
  @Input() disabled = false;
  @Input() loading = false;
  @Output() pressed = new EventEmitter<void>();
}
