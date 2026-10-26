 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,


  EventEmitter,




} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { FaIconComponent } from "../../ui/fa-icon/fa-icon.component";






















@Component({
  selector: "app-base-table, app-table",
  standalone: true,
  imports: [CommonModule, FormsModule, FaIconComponent],
  templateUrl: "./table.component.html",
  styleUrl: "./table.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent

{
  Input() __init() {this.title = ""}
  Input() __init2() {this.subtitle = ""}
  Input() __init3() {this.columns = []}
  Input() __init4() {this.data = []}
  Input() __init5() {this.showAdd = false}
  Input() __init6() {this.showEdit = true}
  Input() __init7() {this.showDelete = true}
  Input() __init8() {this.addLabel = "افزودن"}
  Input() __init9() {this.editLabel = "ویرایش"}
  Input() __init10() {this.deleteLabel = "حذف"}
  Input() __init11() {this.customActions = []}
  Input() __init12() {this.searchable = false}
  Input() __init13() {this.searchPlaceholder = "جستجو"}
  Input() __init14() {this.searchTerm = ""}
  Input() __init15() {this.loading = false}
  Input() __init16() {this.emptyText = "موردی برای نمایش وجود ندارد"}
  Input() __init17() {this.showPagination = true}
  Input() __init18() {this.serverSide = true}
  Input() __init19() {this.currentPage = 1}
  Input() __init20() {this.pageSize = 10}
  Input() __init21() {this.totalCount = 0}
  Input() __init22() {this.totalPages = 0}

  Output() __init23() {this.addClick = new EventEmitter()}
  Output() __init24() {this.actionClick = new EventEmitter()}
  Output() __init25() {this.pageChange = new EventEmitter()}
  Output() __init26() {this.searchChange = new EventEmitter()}

   __init27() {this.appliedSearchTerm = ""}
   __init28() {this.searchDebounceId = null}

  constructor( cdr) {;this.cdr = cdr;TableComponent.prototype.__init.call(this);TableComponent.prototype.__init2.call(this);TableComponent.prototype.__init3.call(this);TableComponent.prototype.__init4.call(this);TableComponent.prototype.__init5.call(this);TableComponent.prototype.__init6.call(this);TableComponent.prototype.__init7.call(this);TableComponent.prototype.__init8.call(this);TableComponent.prototype.__init9.call(this);TableComponent.prototype.__init10.call(this);TableComponent.prototype.__init11.call(this);TableComponent.prototype.__init12.call(this);TableComponent.prototype.__init13.call(this);TableComponent.prototype.__init14.call(this);TableComponent.prototype.__init15.call(this);TableComponent.prototype.__init16.call(this);TableComponent.prototype.__init17.call(this);TableComponent.prototype.__init18.call(this);TableComponent.prototype.__init19.call(this);TableComponent.prototype.__init20.call(this);TableComponent.prototype.__init21.call(this);TableComponent.prototype.__init22.call(this);TableComponent.prototype.__init23.call(this);TableComponent.prototype.__init24.call(this);TableComponent.prototype.__init25.call(this);TableComponent.prototype.__init26.call(this);TableComponent.prototype.__init27.call(this);TableComponent.prototype.__init28.call(this);}

  ngOnChanges(changes) {
    if (changes["searchTerm"] && !changes["searchTerm"].firstChange) {
      this.appliedSearchTerm = this.searchTerm;
    }

    if (_optionalChain([changes, 'access', _ => _["searchTerm"], 'optionalAccess', _2 => _2.firstChange])) {
      this.appliedSearchTerm = this.searchTerm;
    }

    this.cdr.markForCheck();
  }

  get actionItems() {
    return [...this.defaultActions, ...this.customActions];
  }

  get defaultActions() {
    const items = [];

    if (this.showEdit) {
      items.push({
        action: "edit",
        label: this.editLabel,
        icon: "edit",
        tone: "default",
      });
    }

    if (this.showDelete) {
      items.push({
        action: "delete",
        label: this.deleteLabel,
        icon: "trash",
        tone: "danger",
      });
    }

    return items;
  }

  get filteredData() {
    if (this.serverSide) return this.data;

    const term = this.appliedSearchTerm.trim().toLowerCase();

    if (!term) {
      return this.data;
    }

    return this.data.filter((row) =>
      this.columns.some((column) =>
        String(_nullishCoalesce(this.getCellValue(row, column), () => ( "")))
          .toLowerCase()
          .includes(term),
      ),
    );
  }

  get resolvedTotalPages() {
    if (this.serverSide) {
      return Math.max(
        1,
        this.totalPages || Math.ceil(this.totalCount / this.pageSize),
      );
    }

    return Math.max(1, Math.ceil(this.filteredData.length / this.pageSize));
  }

  get visibleRows() {
    if (this.serverSide) return this.data;

    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredData.slice(start, start + this.pageSize);
  }

  onSearchChange(value) {
    this.searchTerm = value;

    if (this.searchDebounceId) {
      clearTimeout(this.searchDebounceId);
    }

    this.searchDebounceId = setTimeout(() => {
      this.searchDebounceId = null;
      this.appliedSearchTerm = value;
      this.currentPage = 1;
      this.searchChange.emit(value);
      this.cdr.markForCheck();
    }, 300);
  }

  previousPage() {
    this.setPage(this.currentPage - 1);
  }

  nextPage() {
    this.setPage(this.currentPage + 1);
  }

  getCellValue(row, column) {
    const value = column.value ? column.value(row) : row[column.key ];

    if (typeof value === "boolean") {
      return value ? "بله" : "خیر";
    }

    return value;
  }

   setPage(page) {
    const nextPage = Math.min(Math.max(1, page), this.resolvedTotalPages);
    if (nextPage === this.currentPage) return;

    this.currentPage = nextPage;
    this.pageChange.emit(nextPage);
    this.cdr.markForCheck();
  }

  emitAction(action, row) {
    this.actionClick.emit({ action: action.action, row });
  }

  isActionVisible(action, row) {
    if (typeof action.visible === "function") {
      return action.visible(row);
    }

    return _nullishCoalesce(action.visible, () => ( true));
  }

  isActionDisabled(action, row) {
    if (typeof action.disabled === "function") {
      return action.disabled(row);
    }

    return _nullishCoalesce(action.disabled, () => ( false));
  }
}
