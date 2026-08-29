import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from "@angular/core";
import { BaseOption } from "../../models/base-ui.models";
@Component({
  selector: "app-base-segmented-control",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div role="radiogroup" [attr.aria-label]="label">
    @for (option of options; track option.value) {
      <button
        type="button"
        role="radio"
        [attr.aria-checked]="option.value === value"
        [class.selected]="option.value === value"
        [disabled]="disabled || option.disabled"
        (click)="select(option.value)"
      >
        {{ option.label }}
      </button>
    }
  </div>`,
  styleUrl: "./segmented-control.component.scss",
})
export class BaseSegmentedControlComponent<T extends string | number> {
  @Input({ required: true }) label = "";
  @Input() options: BaseOption<T>[] = [];
  @Input() value: T | null = null;
  @Input() disabled = false;
  @Output() valueChange = new EventEmitter<T>();
  select(value: T): void {
    if (!this.disabled) {
      this.valueChange.emit(value);
    }
  }
}
