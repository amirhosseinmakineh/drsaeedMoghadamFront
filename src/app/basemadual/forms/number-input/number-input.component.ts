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
        [value]="focused ? editingValue : displayValue"
        [disabled]="disabled"
        (focus)="onFocus()"
        (input)="onInput($event)"
        (blur)="onBlur()"
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
  @Input() maxFractionDigits = 3;
  @Input() prefix = "";
  @Input() suffix = "";
  @Input() disabled = false;
  @Input() error = "";
  @Output() valueChange = new EventEmitter<number | null>();
  focused = false;
  editingValue = "";

  get displayValue(): string {
    return this.value === null
      ? ""
      : new Intl.NumberFormat("fa-IR", {
          maximumFractionDigits: this.maxFractionDigits,
        }).format(this.value);
  }

  onFocus(): void {
    this.focused = true;
    this.editingValue = this.value === null ? "" : String(this.value);
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const rawValue = input.value;
    let normalized = this.toEnglishDigits(rawValue)
      .replace(/[٬,]/g, "")
      .replace(/٫/g, ".")
      .replace(/[^\d.]/g, "");
    const decimalIndex = normalized.indexOf(".");
    if (decimalIndex >= 0) {
      const integer = normalized.slice(0, decimalIndex);
      const fraction = normalized
        .slice(decimalIndex + 1)
        .replaceAll(".", "")
        .slice(0, this.maxFractionDigits);
      normalized = `${integer}.${fraction}`;
    }
    this.editingValue = normalized;
    input.value = normalized;

    const parsed = Number(normalized);
    if (normalized === "" || normalized === "." || Number.isNaN(parsed)) {
      this.valueChange.emit(null);
      return;
    }
    const bounded = Math.min(
      this.max ?? parsed,
      Math.max(this.min ?? parsed, parsed),
    );
    this.valueChange.emit(bounded);
  }

  onBlur(): void {
    this.focused = false;
  }

  private toEnglishDigits(value: string): string {
    return value
      .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
      .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
  }
}
