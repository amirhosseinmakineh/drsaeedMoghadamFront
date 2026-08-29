import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
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
export class BaseFormFieldComponent {
  @Input({ required: true }) label = "";
  @Input({ required: true }) forId = "";
  @Input() required = false;
  @Input() hint = "";
  @Input() error = "";
}
