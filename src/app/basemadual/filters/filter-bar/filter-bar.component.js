import {
  ChangeDetectionStrategy,

  EventEmitter,


} from "@angular/core";
@Component({
  selector: "app-base-filter-bar",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section [class.compact]="compact">
    <div class="fields"><ng-content /></div>
    <div class="actions">
      <button
        type="button"
        class="reset"
        [disabled]="disabled"
        (click)="reset.emit()"
      >
        {{ resetLabel }}</button
      ><button
        type="button"
        class="apply"
        [disabled]="disabled"
        (click)="apply.emit()"
      >
        {{ applyLabel }}</button
      ><ng-content select="[baseFilterAction]" />
    </div>
  </section>`,
  styleUrl: "./filter-bar.component.scss",
})
export class BaseFilterBarComponent {constructor() { BaseFilterBarComponent.prototype.__init.call(this);BaseFilterBarComponent.prototype.__init2.call(this);BaseFilterBarComponent.prototype.__init3.call(this);BaseFilterBarComponent.prototype.__init4.call(this);BaseFilterBarComponent.prototype.__init5.call(this);BaseFilterBarComponent.prototype.__init6.call(this); }
  Input() __init() {this.applyLabel = "اعمال فیلتر"}
  Input() __init2() {this.resetLabel = "پاک کردن"}
  Input() __init3() {this.disabled = false}
  Input() __init4() {this.compact = false}
  Output() __init5() {this.apply = new EventEmitter()}
  Output() __init6() {this.reset = new EventEmitter()}
}
