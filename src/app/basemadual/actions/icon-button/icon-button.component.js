import {
  ChangeDetectionStrategy,

  EventEmitter,


} from "@angular/core";
@Component({
  selector: "app-base-icon-button",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<button
    type="button"
    [attr.aria-label]="label"
    [disabled]="disabled"
    (click)="pressed.emit()"
  >
    <ng-content />
  </button>`,
  styles: [
    `
      button {
        display: grid;
        place-items: center;
        min-width: 44px;
        min-height: 44px;
        border: 1px solid var(--line);
        border-radius: 0.75rem;
        background: var(--surface);
        color: var(--text);
      }
      button:focus-visible {
        outline: 3px solid color-mix(in srgb, var(--brand) 40%, transparent);
        outline-offset: 2px;
      }
    `,
  ],
})
export class BaseIconButtonComponent {constructor() { BaseIconButtonComponent.prototype.__init.call(this);BaseIconButtonComponent.prototype.__init2.call(this);BaseIconButtonComponent.prototype.__init3.call(this); }
  Input({ required: true }) __init() {this.label = ""}
  Input() __init2() {this.disabled = false}
  Output() __init3() {this.pressed = new EventEmitter()}
}
