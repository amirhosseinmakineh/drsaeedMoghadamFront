import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from "@angular/core";
@Component({
  selector: "app-base-table-pagination",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<nav aria-label="صفحه‌بندی">
    <button
      type="button"
      [disabled]="previousDisabled"
      (click)="changePage(currentPage - 1)"
    >
      قبلی</button
    ><span>صفحه {{ currentPage }} از {{ totalPages }}</span
    ><button
      type="button"
      [disabled]="nextDisabled"
      (click)="changePage(currentPage + 1)"
    >
      بعدی
    </button>
  </nav>`,
  styleUrl: "./table-pagination.component.scss",
})
export class BaseTablePaginationComponent implements OnChanges {
  @Input() currentPage = 1;
  @Input() totalCount = 0;
  @Input() pageSize = 20;
  @Input() disabled = false;
  @Output() pageChange = new EventEmitter<number>();
  totalPages = 1;
  previousDisabled = true;
  nextDisabled = true;
  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      this.updateState();
    }
  }
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages && !this.disabled) {
      this.pageChange.emit(page);
    }
  }
  private updateState(): void {
    this.totalPages = Math.max(
      1,
      Math.ceil(this.totalCount / Math.max(1, this.pageSize)),
    );
    this.previousDisabled = this.disabled || this.currentPage <= 1;
    this.nextDisabled = this.disabled || this.currentPage >= this.totalPages;
  }
}
