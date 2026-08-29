import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from "@angular/core";
import { BaseOption } from "../../models/base-ui.models";
@Component({
  selector: "app-base-select-filter",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<label
    ><span>{{ label }}</span
    ><select [disabled]="disabled" (change)="onChange($event)">
      <option value="">{{ placeholder }}</option>
      @for (option of options; track option.value) {
        <option
          [value]="option.value"
          [selected]="option.value === value"
          [disabled]="option.disabled"
        >
          {{ option.label }}
        </option>
      }
    </select></label
  >`,
  styles: [
    `
      :host {
        display: block;
      }
      label {
        display: grid;
        gap: 0.25rem;
        color: var(--muted);
        font-size: 0.875rem;
      }
      select {
        min-height: 44px;
      }
    `,
  ],
})
export class BaseSelectFilterComponent {
  @Input() label = "فیلتر";
  @Input() placeholder = "همه";
  @Input() options: BaseOption[] = [];
  @Input() value: string | number | null = null;
  @Input() disabled = false;
  @Output() valueChange = new EventEmitter<string>();
  onChange(event: Event): void {
    this.valueChange.emit((event.target as HTMLSelectElement).value);
  }
}
