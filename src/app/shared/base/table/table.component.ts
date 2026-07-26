import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { FaIconComponent } from "../../ui/fa-icon/fa-icon.component";

export interface TableColumn<T = Record<string, unknown>> {
  key: keyof T | string;
  label: string;
  value?: (row: T) => string | number | boolean | null | undefined;
  badge?: (row: T) => string;
}

export interface TableAction<T = unknown> {
  action: string;
  label: string;
  icon?: string;
  tone?: "default" | "primary" | "danger";
  disabled?: boolean | ((row: T) => boolean);
  visible?: boolean | ((row: T) => boolean);
}

export interface TableActionClick<T = unknown> {
  action: string;
  row: T;
}

@Component({
  selector: "app-base-table, app-table",
  standalone: true,
  imports: [CommonModule, FormsModule, FaIconComponent],
  templateUrl: "./table.component.html",
  styleUrl: "./table.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent<T extends object = Record<string, unknown>>
  implements OnChanges
{
  @Input() title = "";
  @Input() subtitle = "";
  @Input() columns: TableColumn<T>[] = [];
  @Input() data: T[] = [];
  @Input() showAdd = false;
  @Input() showEdit = true;
  @Input() showDelete = true;
  @Input() addLabel = "افزودن";
  @Input() editLabel = "ویرایش";
  @Input() deleteLabel = "حذف";
  @Input() customActions: TableAction<T>[] = [];
  @Input() searchable = false;
  @Input() searchPlaceholder = "جستجو";
  @Input() searchTerm = "";
  @Input() loading = false;
  @Input() emptyText = "موردی برای نمایش وجود ندارد";
  @Input() showPagination = true;
  @Input() serverSide = true;
  @Input() currentPage = 1;
  @Input() pageSize = 10;
  @Input() totalCount = 0;
  @Input() totalPages = 0;

  @Output() addClick = new EventEmitter<void>();
  @Output() actionClick = new EventEmitter<TableActionClick<T>>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() searchChange = new EventEmitter<string>();

  private appliedSearchTerm = "";
  private searchDebounceId: ReturnType<typeof setTimeout> | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["searchTerm"] && !changes["searchTerm"].firstChange) {
      this.appliedSearchTerm = this.searchTerm;
    }

    if (changes["searchTerm"]?.firstChange) {
      this.appliedSearchTerm = this.searchTerm;
    }

    this.cdr.markForCheck();
  }

  get actionItems(): TableAction<T>[] {
    return [...this.defaultActions, ...this.customActions];
  }

  get defaultActions(): TableAction<T>[] {
    const items: TableAction<T>[] = [];

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

  get filteredData(): T[] {
    if (this.serverSide) return this.data;

    const term = this.appliedSearchTerm.trim().toLowerCase();

    if (!term) {
      return this.data;
    }

    return this.data.filter((row) =>
      this.columns.some((column) =>
        String(this.getCellValue(row, column) ?? "")
          .toLowerCase()
          .includes(term),
      ),
    );
  }

  get resolvedTotalPages(): number {
    if (this.serverSide) {
      return Math.max(
        1,
        this.totalPages || Math.ceil(this.totalCount / this.pageSize),
      );
    }

    return Math.max(1, Math.ceil(this.filteredData.length / this.pageSize));
  }

  get visibleRows(): T[] {
    if (this.serverSide) return this.data;

    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredData.slice(start, start + this.pageSize);
  }

  onSearchChange(value: string): void {
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

  previousPage(): void {
    this.setPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.setPage(this.currentPage + 1);
  }

  getCellValue(row: T, column: TableColumn<T>): unknown {
    const value = column.value ? column.value(row) : row[column.key as keyof T];

    if (typeof value === "boolean") {
      return value ? "بله" : "خیر";
    }

    return value;
  }

  private setPage(page: number): void {
    const nextPage = Math.min(Math.max(1, page), this.resolvedTotalPages);
    if (nextPage === this.currentPage) return;

    this.currentPage = nextPage;
    this.pageChange.emit(nextPage);
    this.cdr.markForCheck();
  }

  emitAction(action: TableAction<T>, row: T): void {
    this.actionClick.emit({ action: action.action, row });
  }

  isActionVisible(action: TableAction<T>, row: T): boolean {
    if (typeof action.visible === "function") {
      return action.visible(row);
    }

    return action.visible ?? true;
  }

  isActionDisabled(action: TableAction<T>, row: T): boolean {
    if (typeof action.disabled === "function") {
      return action.disabled(row);
    }

    return action.disabled ?? false;
  }
}
