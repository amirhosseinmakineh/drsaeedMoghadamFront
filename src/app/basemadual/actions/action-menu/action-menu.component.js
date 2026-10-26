import {
  ChangeDetectionStrategy,

  EventEmitter,


  signal,
} from "@angular/core";
@Component({
  selector: "app-base-action-menu",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div>
    <button
      type="button"
      [attr.aria-label]="label"
      [attr.aria-expanded]="open()"
      (click)="toggle()"
    >
      ⋮
    </button>
    @if (open()) {
      <section><ng-content /></section>
    }
  </div>`,
  styles: [
    `
      :host {
        display: inline-block;
      }
      div {
        position: relative;
      }
      button {
        min-width: 44px;
        min-height: 44px;
        border: 1px solid var(--line);
        border-radius: 0.75rem;
        background: var(--surface);
      }
      section {
        position: absolute;
        z-index: 20;
        inset-inline-end: 0;
        inset-block-start: calc(100% + 0.25rem);
        min-width: 10rem;
        padding: 0.5rem;
        border: 1px solid var(--line);
        border-radius: 0.75rem;
        background: var(--surface);
        box-shadow: var(--shadow);
      }
    `,
  ],
})
export class BaseActionMenuComponent {constructor() { BaseActionMenuComponent.prototype.__init.call(this);BaseActionMenuComponent.prototype.__init2.call(this);BaseActionMenuComponent.prototype.__init3.call(this); }
  Input() __init() {this.label = "عملیات"}
  Output() __init2() {this.openChange = new EventEmitter()}
   __init3() {this.open = signal(false)}
  toggle() {
    const next = !this.open();
    this.open.set(next);
    this.openChange.emit(next);
  }
}
