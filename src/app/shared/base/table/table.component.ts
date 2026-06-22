import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface TableColumn<T = Record<string, unknown>> {
  key: keyof T | string;
  label: string;
}

export interface TableAction<T = unknown> {
  action: string;
  label: string;
  disabled?: boolean | ((row: T) => boolean);
  visible?: boolean | ((row: T) => boolean);
}

export interface TableActionClick<T = unknown> {
  action: string;
  row: T;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section>
      <input
        type="search"
        [ngModel]="searchTerm"
        (ngModelChange)="onSearchChange($event)"
        placeholder="Search"
        aria-label="Search table"
      />

      <table>
        <thead>
          <tr>
            <th *ngFor="let column of columns" scope="col">{{ column.label }}</th>
            <th *ngIf="actionItems.length" scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of paginatedData">
            <td *ngFor="let column of columns">{{ getCellValue(row, column) }}</td>
            <td *ngIf="actionItems.length">
              <ng-container *ngFor="let item of actionItems">
                <button
                  *ngIf="isActionVisible(item, row)"
                  type="button"
                  [disabled]="isActionDisabled(item, row)"
                  (click)="emitAction(item, row)"
                >
                  {{ item.label }}
                </button>
              </ng-container>
            </td>
          </tr>
        </tbody>
      </table>

      <nav aria-label="Table pagination">
        <button type="button" (click)="previousPage()" [disabled]="currentPage === 1">Previous</button>
        <span>{{ currentPage }} / {{ totalPages }}</span>
        <button type="button" (click)="nextPage()" [disabled]="currentPage === totalPages">Next</button>
      </nav>
    </section>
  `
})
export class TableComponent<T extends object = Record<string, unknown>> {
  @Input() columns: TableColumn<T>[] = [];
  @Input() data: T[] = [];
  @Input() actions: TableAction<T>[] = [];
  @Input() customActions: TableAction<T>[] = [];
  @Input() pageSize = 10;

  @Output() actionClick = new EventEmitter<TableActionClick<T>>();

  searchTerm = '';
  currentPage = 1;

  get actionItems(): TableAction<T>[] {
    return this.customActions.length ? this.customActions : this.actions;
  }

  get filteredData(): T[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.data;
    }

    return this.data.filter((row) =>
      this.columns.some((column) => String(this.getCellValue(row, column) ?? '').toLowerCase().includes(term))
    );
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredData.length / this.pageSize));
  }

  get paginatedData(): T[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredData.slice(start, start + this.pageSize);
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.currentPage = 1;
  }

  previousPage(): void {
    this.currentPage = Math.max(1, this.currentPage - 1);
  }

  nextPage(): void {
    this.currentPage = Math.min(this.totalPages, this.currentPage + 1);
  }

  getCellValue(row: T, column: TableColumn<T>): unknown {
    return row[column.key as keyof T];
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
