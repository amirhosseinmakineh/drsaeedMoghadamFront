import { ChangeDetectionStrategy, } from "@angular/core";
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
export class BaseStatCardComponent {constructor() { BaseStatCardComponent.prototype.__init.call(this);BaseStatCardComponent.prototype.__init2.call(this);BaseStatCardComponent.prototype.__init3.call(this);BaseStatCardComponent.prototype.__init4.call(this);BaseStatCardComponent.prototype.__init5.call(this);BaseStatCardComponent.prototype.__init6.call(this); }
  Input({ required: true }) __init() {this.title = ""}
  Input() __init2() {this.value = "—"}
  Input() __init3() {this.subtitle = ""}
  Input() __init4() {this.icon = ""}
  Input() __init5() {this.trend = ""}
  Input() __init6() {this.loading = false}
}
