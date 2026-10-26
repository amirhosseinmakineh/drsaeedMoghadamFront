import {
  ChangeDetectionStrategy,

  EventEmitter,


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
export class BasePageHeaderComponent {constructor() { BasePageHeaderComponent.prototype.__init.call(this);BasePageHeaderComponent.prototype.__init2.call(this);BasePageHeaderComponent.prototype.__init3.call(this);BasePageHeaderComponent.prototype.__init4.call(this);BasePageHeaderComponent.prototype.__init5.call(this); }
  Input({ required: true }) __init() {this.title = ""}
  Input() __init2() {this.subtitle = ""}
  Input() __init3() {this.icon = ""}
  Input() __init4() {this.backLabel = "بازگشت"}
  Output() __init5() {this.back = new EventEmitter()}
}
