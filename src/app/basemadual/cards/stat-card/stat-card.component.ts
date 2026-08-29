import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
@Component({
  selector: "app-base-stat-card",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<article>
    @if (loading) {
      <div class="skeleton" aria-label="در حال بارگذاری"></div>
    } @else {
      <div class="heading">
        <span>{{ title }}</span>
        @if (icon) {
          <span aria-hidden="true">{{ icon }}</span>
        }
      </div>
      <strong>{{ value }}</strong>
      @if (subtitle) {
        <small>{{ subtitle }}</small>
      }
      @if (trend) {
        <b>{{ trend }}</b>
      }
    }
  </article>`,
  styleUrl: "./stat-card.component.scss",
})
export class BaseStatCardComponent {
  @Input({ required: true }) title = "";
  @Input() value: string | number = "—";
  @Input() subtitle = "";
  @Input() icon = "";
  @Input() trend = "";
  @Input() loading = false;
}
