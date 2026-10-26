 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,

  EventEmitter,


} from "@angular/core";

@Component({
  selector: "app-base-data-table",
  standalone: true,
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./data-table.component.html",
  styleUrl: "./data-table.component.scss",
})
export class BaseDataTableComponent {constructor() { BaseDataTableComponent.prototype.__init.call(this);BaseDataTableComponent.prototype.__init2.call(this);BaseDataTableComponent.prototype.__init3.call(this);BaseDataTableComponent.prototype.__init4.call(this);BaseDataTableComponent.prototype.__init5.call(this);BaseDataTableComponent.prototype.__init6.call(this);BaseDataTableComponent.prototype.__init7.call(this);BaseDataTableComponent.prototype.__init8.call(this);BaseDataTableComponent.prototype.__init9.call(this); }
  Input() __init() {this.columns = []}
  Input() __init2() {this.rows = []}
  Input() __init3() {this.loading = false}
  Input() __init4() {this.emptyTitle = "داده‌ای برای نمایش وجود ندارد"}
  Input() __init5() {this.rowClickable = false}
  Input() __init6() {this.actionLabel = ""}
  Input() __init7() {this.actionLoading = null}
  Output() __init8() {this.rowClick = new EventEmitter()}
  Output() __init9() {this.actionClick = new EventEmitter()}
  selectRow(row) {
    if (this.rowClickable) {
      this.rowClick.emit(row);
    }
  }
  runAction(event, row) {
    event.stopPropagation();
    if (!_optionalChain([this, 'access', _ => _.actionLoading, 'optionalCall', _2 => _2(row)])) this.actionClick.emit(row);
  }
  cellValue(row, column) {
    return row[column.key];
  }
}
