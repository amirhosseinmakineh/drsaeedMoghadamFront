import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from "@angular/core";
@Component({
  selector: "app-base-page-header",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<header>
    <button
      type="button"
      class="back"
      [attr.aria-label]="backLabel"
      (click)="back.emit()"
    >
      ‹
    </button>
    <div class="copy">
      @if (icon) {
        <span class="icon" aria-hidden="true">{{ icon }}</span>
      }
      <div>
        <h2>{{ title }}</h2>
        @if (subtitle) {
          <p>{{ subtitle }}</p>
        }
      </div>
    </div>
    <div class="actions"><ng-content /></div>
  </header>`,
  styleUrl: "./page-header.component.scss",
})
export class BasePageHeaderComponent {
  @Input({ required: true }) title = "";
  @Input() subtitle = "";
  @Input() icon = "";
  @Input() backLabel = "بازگشت";
  @Output() back = new EventEmitter<void>();
}
