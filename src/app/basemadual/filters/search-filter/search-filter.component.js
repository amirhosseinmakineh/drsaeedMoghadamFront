import {
  ChangeDetectionStrategy,

  DestroyRef,
  EventEmitter,




  inject,
} from "@angular/core";
import { Subject, debounceTime } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
@Component({
  selector: "app-base-search-filter",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<label
    ><span>{{ label }}</span>
    <div>
      <input
        type="search"
        [value]="value"
        [placeholder]="placeholder"
        [disabled]="disabled"
        (input)="onInput($event)"
      />
      @if (value) {
        <button
          type="button"
          aria-label="پاک کردن جستجو"
          [disabled]="disabled"
          (click)="clear()"
        >
          ×
        </button>
      }
    </div></label
  >`,
  styleUrl: "./search-filter.component.scss",
})
export class BaseSearchFilterComponent  {
  Input() __init() {this.label = "جستجو"}
  Input() __init2() {this.placeholder = "جستجو کنید"}
  Input() __init3() {this.value = ""}
  Input() __init4() {this.disabled = false}
  Input() __init5() {this.debounceMilliseconds = 400}
  Output() __init6() {this.valueChange = new EventEmitter()}
    __init7() {this.values = new Subject()}
    __init8() {this.destroyRef = inject(DestroyRef)}
  constructor() {;BaseSearchFilterComponent.prototype.__init.call(this);BaseSearchFilterComponent.prototype.__init2.call(this);BaseSearchFilterComponent.prototype.__init3.call(this);BaseSearchFilterComponent.prototype.__init4.call(this);BaseSearchFilterComponent.prototype.__init5.call(this);BaseSearchFilterComponent.prototype.__init6.call(this);BaseSearchFilterComponent.prototype.__init7.call(this);BaseSearchFilterComponent.prototype.__init8.call(this);
    this.values
      .pipe(
        debounceTime(this.debounceMilliseconds),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((value) => this.valueChange.emit(value));
  }
  ngOnChanges(changes) {
    if (
      changes["debounceMilliseconds"] &&
      !changes["debounceMilliseconds"].firstChange
    ) {
      this.valueChange.emit(this.value);
    }
  }
  onInput(event) {
    this.value = (event.target ).value;
    this.values.next(this.value);
  }
  clear() {
    this.value = "";
    this.valueChange.emit("");
  }
}
