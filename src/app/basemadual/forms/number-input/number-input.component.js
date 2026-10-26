 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }import {
  ChangeDetectionStrategy,

  EventEmitter,


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
export class BaseNumberInputComponent {constructor() { BaseNumberInputComponent.prototype.__init.call(this);BaseNumberInputComponent.prototype.__init2.call(this);BaseNumberInputComponent.prototype.__init3.call(this);BaseNumberInputComponent.prototype.__init4.call(this);BaseNumberInputComponent.prototype.__init5.call(this);BaseNumberInputComponent.prototype.__init6.call(this);BaseNumberInputComponent.prototype.__init7.call(this);BaseNumberInputComponent.prototype.__init8.call(this);BaseNumberInputComponent.prototype.__init9.call(this);BaseNumberInputComponent.prototype.__init10.call(this);BaseNumberInputComponent.prototype.__init11.call(this); }
  Input({ required: true }) __init() {this.inputId = ""}
  Input() __init2() {this.label = ""}
  Input() __init3() {this.value = null}
  Input() 
  Input() 
  Input() __init4() {this.maxFractionDigits = 3}
  Input() __init5() {this.prefix = ""}
  Input() __init6() {this.suffix = ""}
  Input() __init7() {this.disabled = false}
  Input() __init8() {this.error = ""}
  Output() __init9() {this.valueChange = new EventEmitter()}
  __init10() {this.focused = false}
  __init11() {this.editingValue = ""}

  get displayValue() {
    return this.value === null
      ? ""
      : new Intl.NumberFormat("fa-IR", {
          maximumFractionDigits: this.maxFractionDigits,
        }).format(this.value);
  }

  onFocus() {
    this.focused = true;
    this.editingValue = this.value === null
      ? ""
      : this.formatEditingValue(String(this.value));
  }

  onInput(event) {
    const input = event.target ;
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
    this.editingValue = this.formatEditingValue(normalized);
    input.value = this.editingValue;

    const parsed = Number(normalized);
    if (normalized === "" || normalized === "." || Number.isNaN(parsed)) {
      this.valueChange.emit(null);
      return;
    }
    const bounded = Math.min(
      _nullishCoalesce(this.max, () => ( parsed)),
      Math.max(_nullishCoalesce(this.min, () => ( parsed)), parsed),
    );
    this.valueChange.emit(bounded);
  }

  onBlur() {
    this.focused = false;
  }

   formatEditingValue(value) {
    if (!value) return "";

    const hasDecimalSeparator = value.includes(".");
    const [integerPart = "", fractionPart = ""] = value.split(".");
    const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, "٬");

    return hasDecimalSeparator
      ? `${groupedInteger}.${fractionPart}`
      : groupedInteger;
  }

   toEnglishDigits(value) {
    return value
      .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
      .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
  }
}
