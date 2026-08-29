import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from "@angular/core";
@Component({
  selector: "app-base-textarea-input",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<label [for]="inputId">{{ label }}</label
    ><textarea
      [id]="inputId"
      [rows]="rows"
      [value]="value"
      [placeholder]="placeholder"
      [disabled]="disabled"
      (input)="onInput($event)"
    ></textarea>
    @if (error) {
      <small role="alert">{{ error }}</small>
    }`,
  styles: [
    `
      :host {
        display: grid;
        gap: 0.25rem;
      }
      label {
        color: var(--muted);
        font-size: 0.875rem;
      }
      textarea {
        min-height: 7rem;
      }
      small {
        color: var(--danger);
      }
    `,
  ],
})
export class BaseTextareaInputComponent {
  @Input({ required: true }) inputId = "";
  @Input() label = "";
  @Input() value = "";
  @Input() placeholder = "";
  @Input() rows = 4;
  @Input() disabled = false;
  @Input() error = "";
  @Output() valueChange = new EventEmitter<string>();
  onInput(event: Event): void {
    this.valueChange.emit((event.target as HTMLTextAreaElement).value);
  }
}
