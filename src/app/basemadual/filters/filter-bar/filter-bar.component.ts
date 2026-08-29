import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
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
export class BaseFilterBarComponent {
  @Input() applyLabel = "اعمال فیلتر";
  @Input() resetLabel = "پاک کردن";
  @Input() disabled = false;
  @Input() compact = false;
  @Output() apply = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();
}
