import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from "@angular/core";
import { BaseTableColumn } from "../../models/base-ui.models";
@Component({
  selector: "app-base-data-table",
  standalone: true,
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./data-table.component.html",
  styleUrl: "./data-table.component.scss",
})
export class BaseDataTableComponent<T extends object> {
  @Input() columns: BaseTableColumn<T>[] = [];
  @Input() rows: T[] = [];
  @Input() loading = false;
  @Input() emptyTitle = "داده‌ای برای نمایش وجود ندارد";
  @Input() rowClickable = false;
  @Input() actionLabel = "";
  @Input() actionLoading: ((row: T) => boolean) | null = null;
  @Output() rowClick = new EventEmitter<T>();
  @Output() actionClick = new EventEmitter<T>();
  selectRow(row: T): void {
    if (this.rowClickable) {
      this.rowClick.emit(row);
    }
  }
  runAction(event: Event, row: T): void {
    event.stopPropagation();
    if (!this.actionLoading?.(row)) this.actionClick.emit(row);
  }
  cellValue(row: T, column: BaseTableColumn<T>): unknown {
    return row[column.key];
  }
}
