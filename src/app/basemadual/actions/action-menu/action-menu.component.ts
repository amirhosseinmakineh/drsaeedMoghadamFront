import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
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
export class BaseActionMenuComponent {
  @Input() label = "عملیات";
  @Output() openChange = new EventEmitter<boolean>();
  readonly open = signal(false);
  toggle(): void {
    const next = !this.open();
    this.open.set(next);
    this.openChange.emit(next);
  }
}
