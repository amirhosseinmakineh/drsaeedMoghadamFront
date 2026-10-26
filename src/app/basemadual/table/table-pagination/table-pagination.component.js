import {
  ChangeDetectionStrategy,

  EventEmitter,




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
export class BaseTablePaginationComponent  {constructor() { BaseTablePaginationComponent.prototype.__init.call(this);BaseTablePaginationComponent.prototype.__init2.call(this);BaseTablePaginationComponent.prototype.__init3.call(this);BaseTablePaginationComponent.prototype.__init4.call(this);BaseTablePaginationComponent.prototype.__init5.call(this);BaseTablePaginationComponent.prototype.__init6.call(this);BaseTablePaginationComponent.prototype.__init7.call(this);BaseTablePaginationComponent.prototype.__init8.call(this); }
  Input() __init() {this.currentPage = 1}
  Input() __init2() {this.totalCount = 0}
  Input() __init3() {this.pageSize = 20}
  Input() __init4() {this.disabled = false}
  Output() __init5() {this.pageChange = new EventEmitter()}
  __init6() {this.totalPages = 1}
  __init7() {this.previousDisabled = true}
  __init8() {this.nextDisabled = true}
  ngOnChanges(changes) {
    if (changes) {
      this.updateState();
    }
  }
  changePage(page) {
    if (page >= 1 && page <= this.totalPages && !this.disabled) {
      this.pageChange.emit(page);
    }
  }
   updateState() {
    this.totalPages = Math.max(
      1,
      Math.ceil(this.totalCount / Math.max(1, this.pageSize)),
    );
    this.previousDisabled = this.disabled || this.currentPage <= 1;
    this.nextDisabled = this.disabled || this.currentPage >= this.totalPages;
  }
}
