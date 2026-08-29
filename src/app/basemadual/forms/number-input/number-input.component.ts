import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from "@angular/core";
@Component({
  selector: "app-base-number-input",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<label [for]="inputId">{{ label }}</label>
    <div>
      @if (prefix) {
        <span>{{ prefix }}</span>
      }
      <input
        [id]="inputId"
        type="text"
        inputmode="decimal"
        [value]="displayValue"
        [disabled]="disabled"
        (input)="onInput($event)"
      />
      @if (suffix) {
        <span>{{ suffix }}</span>
      }
    </div>
    @if (error) {
      <small role="alert">{{ error }}</small>
    }`,
  styleUrl: "./number-input.component.scss",
})
export class BaseNumberInputComponent {
  @Input({ required: true }) inputId = "";
  @Input() label = "";
  @Input() value: number | null = null;
  @Input() min?: number;
  @Input() max?: number;
  @Input() prefix = "";
  @Input() suffix = "";
  @Input() disabled = false;
  @Input() error = "";
  @Output() valueChange = new EventEmitter<number | null>();
  get displayValue(): string {
    return this.value === null
      ? ""
      : new Intl.NumberFormat("fa-IR").format(this.value);
  }
  onInput(event: Event): void {
    const rawValue = (event.target as HTMLInputElement).value;
    const parsed = Number(this.toEnglishDigits(rawValue).replaceAll(",", ""));
    if (rawValue.trim() === "" || Number.isNaN(parsed)) {
      this.valueChange.emit(null);
      return;
    }
    const bounded = Math.min(
      this.max ?? parsed,
      Math.max(this.min ?? parsed, parsed),
    );
    this.valueChange.emit(bounded);
  }
  private toEnglishDigits(value: string): string {
    return value.replace(/[۰-۹]/g, (digit) =>
      String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)),
    );
  }
}
