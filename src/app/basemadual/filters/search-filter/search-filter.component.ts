import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
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
export class BaseSearchFilterComponent implements OnChanges {
  @Input() label = "جستجو";
  @Input() placeholder = "جستجو کنید";
  @Input() value = "";
  @Input() disabled = false;
  @Input() debounceMilliseconds = 400;
  @Output() valueChange = new EventEmitter<string>();
  private readonly values = new Subject<string>();
  private readonly destroyRef = inject(DestroyRef);
  constructor() {
    this.values
      .pipe(
        debounceTime(this.debounceMilliseconds),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((value) => this.valueChange.emit(value));
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes["debounceMilliseconds"] &&
      !changes["debounceMilliseconds"].firstChange
    ) {
      this.valueChange.emit(this.value);
    }
  }
  onInput(event: Event): void {
    this.value = (event.target as HTMLInputElement).value;
    this.values.next(this.value);
  }
  clear(): void {
    this.value = "";
    this.valueChange.emit("");
  }
}
