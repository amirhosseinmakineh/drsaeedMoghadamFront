import {
  ChangeDetectionStrategy,

  EventEmitter,


} from "@angular/core";

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
export class BaseButtonComponent {constructor() { BaseButtonComponent.prototype.__init.call(this);BaseButtonComponent.prototype.__init2.call(this);BaseButtonComponent.prototype.__init3.call(this);BaseButtonComponent.prototype.__init4.call(this);BaseButtonComponent.prototype.__init5.call(this); }
  Input() __init() {this.variant = "primary"}
  Input() __init2() {this.type = "button"}
  Input() __init3() {this.disabled = false}
  Input() __init4() {this.loading = false}
  Output() __init5() {this.pressed = new EventEmitter()}
}
