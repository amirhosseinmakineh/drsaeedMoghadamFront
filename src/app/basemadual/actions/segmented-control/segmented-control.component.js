import {
  ChangeDetectionStrategy,

  EventEmitter,


} from "@angular/core";

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
export class BaseSegmentedControlComponent {constructor() { BaseSegmentedControlComponent.prototype.__init.call(this);BaseSegmentedControlComponent.prototype.__init2.call(this);BaseSegmentedControlComponent.prototype.__init3.call(this);BaseSegmentedControlComponent.prototype.__init4.call(this);BaseSegmentedControlComponent.prototype.__init5.call(this); }
  Input({ required: true }) __init() {this.label = ""}
  Input() __init2() {this.options = []}
  Input() __init3() {this.value = null}
  Input() __init4() {this.disabled = false}
  Output() __init5() {this.valueChange = new EventEmitter()}
  select(value) {
    if (!this.disabled) {
      this.valueChange.emit(value);
    }
  }
}
