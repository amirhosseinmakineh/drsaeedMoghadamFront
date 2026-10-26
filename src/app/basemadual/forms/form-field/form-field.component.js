import { ChangeDetectionStrategy, } from "@angular/core";
@Component({
  selector: "app-base-form-field",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div>
    <label [for]="forId"
      >{{ label }}
      @if (required) {
        <span aria-hidden="true"> *</span>
      }</label
    ><ng-content />
    @if (hint && !error) {
      <small>{{ hint }}</small>
    }
    @if (error) {
      <small class="error" role="alert">{{ error }}</small>
    }
  </div>`,
  styleUrl: "./form-field.component.scss",
})
export class BaseFormFieldComponent {constructor() { BaseFormFieldComponent.prototype.__init.call(this);BaseFormFieldComponent.prototype.__init2.call(this);BaseFormFieldComponent.prototype.__init3.call(this);BaseFormFieldComponent.prototype.__init4.call(this);BaseFormFieldComponent.prototype.__init5.call(this); }
  Input({ required: true }) __init() {this.label = ""}
  Input({ required: true }) __init2() {this.forId = ""}
  Input() __init3() {this.required = false}
  Input() __init4() {this.hint = ""}
  Input() __init5() {this.error = ""}
}
