import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
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
export class BaseIconButtonComponent {
  @Input({ required: true }) label = "";
  @Input() disabled = false;
  @Output() pressed = new EventEmitter<void>();
}
