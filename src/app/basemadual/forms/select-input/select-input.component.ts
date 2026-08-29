import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from "@angular/core";
import { BaseOption } from "../../models/base-ui.models";
@Component({
  selector: "app-base-select-input",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<label [for]="inputId">{{ label }}</label
    ><select [id]="inputId" [disabled]="disabled" (change)="onChange($event)">
      <option value="">{{ placeholder }}</option>
      @for (option of options; track option.value) {
        <option
          [value]="option.value"
          [disabled]="option.disabled"
          [selected]="option.value === value"
        >
          {{ option.label }}
        </option>
      }
    </select>
    @if (error) {
      <small role="alert">{{ error }}</small>
    }`,
  styles: [
    `
      :host {
        display: grid;
        gap: 0.25rem;
      }
      label {
        color: var(--muted);
        font-size: 0.875rem;
      }
      select {
        min-height: 44px;
      }
      small {
        color: var(--danger);
      }
    `,
  ],
})
export class BaseSelectInputComponent {
  @Input({ required: true }) inputId = "";
  @Input() label = "";
  @Input() placeholder = "انتخاب کنید";
  @Input() options: BaseOption[] = [];
  @Input() value: string | number | null = null;
  @Input() disabled = false;
  @Input() error = "";
  @Output() valueChange = new EventEmitter<string>();
  onChange(event: Event): void {
    this.valueChange.emit((event.target as HTMLSelectElement).value);
  }
}
