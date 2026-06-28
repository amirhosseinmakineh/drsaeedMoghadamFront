import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '../../ui/fa-icon/fa-icon.component';

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
  tone?: 'default' | 'primary' | 'danger';
  disabled?: boolean | ((row: T) => boolean);
  visible?: boolean | ((row: T) => boolean);
}

export interface TableActionClick<T = unknown> {
  action: string;
  row: T;
}

@Component({
  selector: 'app-base-table, app-table',
  standalone: true,
  imports: [CommonModule, FormsModule, FaIconComponent],
  template: `
    <section class="base-table">
      <header *ngIf="title || subtitle || searchable || showAdd" class="table-header">
        <div>
          <h2 *ngIf="title">{{ title }}</h2>
          <p *ngIf="subtitle">{{ subtitle }}</p>
        </div>

        <div class="table-tools">
          <label *ngIf="searchable" class="search-box">
            <app-fa-icon name="search"></app-fa-icon>
            <input
              type="search"
              [ngModel]="searchTerm"
              (ngModelChange)="onSearchChange($event)"
              [placeholder]="searchPlaceholder"
              aria-label="جستجوی جدول"
            />
          </label>

          <button *ngIf="showAdd" class="table-action add" type="button" (click)="addClick.emit()">
            <app-fa-icon name="plus"></app-fa-icon>
            {{ addLabel }}
          </button>
        </div>
      </header>

      <div class="table-shell" [class.loading]="loading">
        <table>
          <thead>
            <tr>
              <th *ngFor="let column of columns" scope="col">{{ column.label }}</th>
              <th *ngIf="actionItems.length" scope="col">عملیات</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of visibleRows">
              <td *ngFor="let column of columns" [attr.data-label]="column.label">
                <span [class]="column.badge ? 'cell-badge ' + column.badge(row) : ''">
                  {{ getCellValue(row, column) }}
                </span>
              </td>
              <td *ngIf="actionItems.length" data-label="عملیات">
                <div class="row-actions">
                  <ng-container *ngFor="let item of actionItems">
                    <button
                      *ngIf="isActionVisible(item, row)"
                      class="table-action"
                      [class.primary]="item.tone === 'primary'"
                      [class.danger]="item.tone === 'danger'"
                      type="button"
                      [disabled]="isActionDisabled(item, row)"
                      (click)="emitAction(item, row)"
                    >
                      <app-fa-icon *ngIf="item.icon" [name]="item.icon"></app-fa-icon>
                      {{ item.label }}
                    </button>
                  </ng-container>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="!loading && !visibleRows.length" class="empty-table">
          {{ emptyText }}
        </div>

        <div *ngIf="loading" class="table-loading">
          در حال دریافت اطلاعات...
        </div>
      </div>

      <nav *ngIf="showPagination" class="table-pagination" aria-label="صفحه‌بندی جدول">
        <button type="button" (click)="previousPage()" [disabled]="currentPage <= 1">قبلی</button>
        <span>صفحه {{ currentPage }} از {{ resolvedTotalPages }}</span>
        <button type="button" (click)="nextPage()" [disabled]="currentPage >= resolvedTotalPages">بعدی</button>
      </nav>
    </section>
  `,
  styles: [`
  .base-table {
    display:grid;
    gap:14px
  }
  .table-header {
    display:flex;
    align-items:flex-start;
    justify-content:space-between;
    gap:14px
  }
  h2 {
    margin:0;
    color:var(--text);
    font-size:1.25rem
  }
  p {
    margin:6px 0 0;
    color:var(--muted)
  }
  .table-tools {
    display:flex;
    align-items:center;
    justify-content:flex-end;
    gap:10px;
    flex-wrap:wrap
  }
  .search-box {
    display:flex;
    align-items:center;
    gap:8px;
    min-width:min(280px,100%);
    padding:0 12px;
    border:1px solid var(--line);
    border-radius:18px;
    background:var(--surface-muted);
    color:var(--muted)
  }
  .search-box input {
    border:0;
    background:transparent;
    padding:11px 0;
    box-shadow:none
  }
  .table-shell {
    position:relative;
    overflow:hidden;
    border:1px solid var(--line);
    border-radius:24px;
    background:color-mix(in srgb,var(--surface) 88%,transparent)
  }
  table {
    width:100%;
    border-collapse:collapse
  }
  th,td {
    padding:14px 16px;
    text-align:start;
    border-bottom:1px solid var(--line);
    vertical-align:middle
  }
  th {
    color:var(--muted);
    font-size:.84rem;
    font-weight:950;
    background:color-mix(in srgb,var(--surface-muted) 80%,transparent)
  }
  td {
    color:var(--text);
    font-weight:800
  }
  tbody tr:last-child td {
    border-bottom:0
  }
  .row-actions {
    display:flex;
    gap:8px;
    flex-wrap:wrap
  }
  .table-action {
    display:inline-flex;
    align-items:center;
    justify-content:center;
    gap:7px;
    min-height:36px;
    border:1px solid var(--line);
    border-radius:999px;
    padding:8px 12px;
    background:var(--surface-muted);
    color:var(--text);
    font:inherit;
    font-size:.82rem;
    font-weight:950;
    cursor:pointer
  }
  .table-action.primary,.table-action.add {
    background:linear-gradient(135deg,var(--brand),var(--brand-2));
    color:#1b1712;
    border-color:transparent
  }
  .table-action.danger {
    background:color-mix(in srgb,var(--danger) 18%,var(--surface-muted));
    color:#fecaca
  }
  .table-action:disabled {
    cursor:not-allowed;
    opacity:.58
  }
  .cell-badge {
    display:inline-flex;
    align-items:center;
    justify-content:center;
    min-height:30px;
    border-radius:999px;
    padding:5px 10px;
    background:var(--surface-muted);
    color:var(--text);
    font-size:.82rem
  }
  .cell-badge.success {
    background:color-mix(in srgb,#22c55e 16%,transparent);
    color:#bbf7d0
  }
  .cell-badge.warn {
    background:color-mix(in srgb,#f59e0b 16%,transparent);
    color:#fde68a
  }
  .cell-badge.danger {
    background:color-mix(in srgb,var(--danger) 16%,transparent);
    color:#fecaca
  }
  .cell-badge.info {
    background:color-mix(in srgb,var(--brand) 16%,transparent);
    color:var(--brand)
  }
  .empty-table,.table-loading {
    padding:28px;
    text-align:center;
    color:var(--muted);
    font-weight:900
  }
  .table-loading {
    position:absolute;
    inset:0;
    display:grid;
    place-items:center;
    background:color-mix(in srgb,var(--surface) 76%,transparent)
  }
  .table-pagination {
    display:flex;
    align-items:center;
    justify-content:center;
    gap:10px
  }
  .table-pagination button {
    border:1px solid var(--line);
    border-radius:999px;
    padding:9px 16px;
    background:var(--surface-muted);
    color:var(--text);
    font:inherit;
    font-weight:950
  }
  .table-pagination button:disabled {
    opacity:.45;
    cursor:not-allowed
  }
  .table-pagination span {
    color:var(--muted);
    font-weight:950
  }
  @media (max-width:760px) {
    .table-header,.table-tools {
      display:grid;
      grid-template-columns:1fr;
      width:100%
    }
    .search-box {
      min-width:0
    }
    .table-action.add {
      width:100%
    }
    .table-shell {
      overflow:visible;
      border:0;
      background:transparent
    }
    table,thead,tbody,tr,th,td {
      display:block
    }
    thead {
      display:none
    }
    tbody {
      display:grid;
      gap:10px
    }
    tr {
      padding:12px;
      border:1px solid var(--line);
      border-radius:22px;
      background:color-mix(in srgb,var(--surface) 90%,transparent);
      box-shadow:0 12px 34px rgba(0,0,0,.16)
    }
    td {
      display:grid;
      grid-template-columns:minmax(92px,.7fr) 1fr;
      gap:10px;
      padding:8px 0;
      border-bottom:1px dashed var(--line);
      font-size:.9rem
    }
    td:last-child {
      border-bottom:0
    }
    td::before {
      content:attr(data-label);
      color:var(--muted);
      font-weight:950
    }
    .row-actions {
      justify-content:flex-start
    }
    .table-action {
      min-height:34px;
      padding:7px 10px
    }
  }
    `]
})
export class TableComponent<T extends object = Record<string, unknown>> {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() columns: TableColumn<T>[] = [];
  @Input() data: T[] = [];
  @Input() showAdd = false;
  @Input() showEdit = true;
  @Input() showDelete = true;
  @Input() addLabel = 'افزودن';
  @Input() editLabel = 'ویرایش';
  @Input() deleteLabel = 'حذف';
  @Input() customActions: TableAction<T>[] = [];
  @Input() searchable = false;
  @Input() searchPlaceholder = 'جستجو';
  @Input() searchTerm = '';
  @Input() loading = false;
  @Input() emptyText = 'موردی برای نمایش وجود ندارد';
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

  get actionItems(): TableAction<T>[] {
    return [...this.defaultActions, ...this.customActions];
  }

  get defaultActions(): TableAction<T>[] {
    const items: TableAction<T>[] = [];

    if (this.showEdit) {
      items.push({ action: 'edit', label: this.editLabel, icon: 'edit', tone: 'default' });
    }

    if (this.showDelete) {
      items.push({ action: 'delete', label: this.deleteLabel, icon: 'trash', tone: 'danger' });
    }

    return items;
  }

  get filteredData(): T[] {
    if (this.serverSide) return this.data;

    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.data;
    }

    return this.data.filter((row) =>
      this.columns.some((column) => String(this.getCellValue(row, column) ?? '').toLowerCase().includes(term))
    );
  }

  get resolvedTotalPages(): number {
    if (this.serverSide) {
      return Math.max(1, this.totalPages || Math.ceil(this.totalCount / this.pageSize));
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
    this.currentPage = 1;
    this.searchChange.emit(value);
  }

  previousPage(): void {
    this.setPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.setPage(this.currentPage + 1);
  }

  getCellValue(row: T, column: TableColumn<T>): unknown {
    const value = column.value ? column.value(row) : row[column.key as keyof T];

    if (typeof value === 'boolean') {
      return value ? 'بله' : 'خیر';
    }

    return value;
  }

  private setPage(page: number): void {
    const nextPage = Math.min(Math.max(1, page), this.resolvedTotalPages);
    if (nextPage === this.currentPage) return;

    this.currentPage = nextPage;
    this.pageChange.emit(nextPage);
  }

  emitAction(action: TableAction<T>, row: T): void {
    this.actionClick.emit({ action: action.action, row });
  }

  isActionVisible(action: TableAction<T>, row: T): boolean {
    if (typeof action.visible === 'function') {
      return action.visible(row);
    }

    return action.visible ?? true;
  }

  isActionDisabled(action: TableAction<T>, row: T): boolean {
    if (typeof action.disabled === 'function') {
      return action.disabled(row);
    }

    return action.disabled ?? false;
  }
}
