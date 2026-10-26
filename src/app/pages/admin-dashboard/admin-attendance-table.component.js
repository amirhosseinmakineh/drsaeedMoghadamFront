 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,






} from "@angular/core";
import { finalize } from "rxjs";




import {

  TableComponent,
} from "../../shared/base/table/table.component";

@Component({
  selector: "app-admin-attendance-table",
  standalone: true,
  imports: [CommonModule, TableComponent],
  templateUrl: "./admin-attendance-table.component.html",
  styleUrl: "./admin-attendance-table.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAttendanceTableComponent  {
  Input() __init() {this.consultantProfileId = null}
  Input() __init2() {this.title = "حضور و غیاب مشاور"}

  __init3() {this.items = []}
  __init4() {this.loading = false}
  __init5() {this.feedback = ""}
  __init6() {this.pageNumber = 1}
  __init7() {this.pageSize = 10}
  __init8() {this.totalCount = 0}
  __init9() {this.totalPages = 1}
   __init10() {this.hasRequestedLoad = false}
   __init11() {this.loadRequestId = 0}

   __init12() {this.columns = [
    { key: "attendanceDate", label: "تاریخ" },
    { key: "checkInTime", label: "ورود" },
    { key: "checkOutTime", label: "خروج" },
    {
      key: "status",
      label: "وضعیت",
      value: (row) => this.statusLabel(row.status),
      badge: (row) => this.statusBadge(row.status),
    },
    {
      key: "description",
      label: "توضیح",
      value: (row) => row.description || "بدون توضیح",
    },
  ]}

  constructor(
     adminApi,
     cdr,
  ) {;this.adminApi = adminApi;this.cdr = cdr;AdminAttendanceTableComponent.prototype.__init.call(this);AdminAttendanceTableComponent.prototype.__init2.call(this);AdminAttendanceTableComponent.prototype.__init3.call(this);AdminAttendanceTableComponent.prototype.__init4.call(this);AdminAttendanceTableComponent.prototype.__init5.call(this);AdminAttendanceTableComponent.prototype.__init6.call(this);AdminAttendanceTableComponent.prototype.__init7.call(this);AdminAttendanceTableComponent.prototype.__init8.call(this);AdminAttendanceTableComponent.prototype.__init9.call(this);AdminAttendanceTableComponent.prototype.__init10.call(this);AdminAttendanceTableComponent.prototype.__init11.call(this);AdminAttendanceTableComponent.prototype.__init12.call(this);}

  ngOnInit() {
    if (!this.hasRequestedLoad) this.load();
  }

  ngOnChanges(changes) {
    if (changes["consultantProfileId"]) {
      this.pageNumber = 1;
      this.load();
    }
  }

  changePage(page) {
    this.pageNumber = page;
    this.load();
  }

  load() {
    this.hasRequestedLoad = true;

    if (!this.consultantProfileId) {
      this.items = [];
      this.totalCount = 0;
      this.totalPages = 1;
      this.loading = false;
      this.markDirty();
      return;
    }

    const requestId = ++this.loadRequestId;
    this.loading = true;
    this.feedback = "";
    this.markDirty();

    this.adminApi
      .getAttendance(this.consultantProfileId, this.pageNumber, this.pageSize)
      .pipe(
        finalize(() => {
          if (requestId === this.loadRequestId) {
            this.loading = false;
            this.markDirty();
          }
        }),
      )
      .subscribe({
        next: (response) => {
          if (requestId !== this.loadRequestId) return;
          this.items = _nullishCoalesce(response.items, () => ( []));
          this.totalCount = _nullishCoalesce(response.totalCount, () => ( this.items.length));
          this.totalPages = Math.max(
            1,
            response.totalPages || Math.ceil(this.totalCount / this.pageSize),
          );
          this.markDirty();
        },
        error: (error) => {
          if (requestId === this.loadRequestId) {
            this.feedback = this.errorMessage(
              error,
              "دریافت حضور و غیاب انجام نشد",
            );
            this.markDirty();
          }
        },
      });
  }

   markDirty() {
    this.cdr.markForCheck();
  }

   statusLabel(value) {
    const labels = {
      1: "حاضر",
      2: "غایب",
      3: "مرخصی",
      4: "مرخصی استعلاجی",
      5: "تأخیر",
      6: "مأموریت",
    };

    return _nullishCoalesce(labels[value], () => ( "نامشخص"));
  }

   statusBadge(value) {
    if (value === 1) return "success";
    if ([3, 4, 6].includes(value)) return "info";
    if (value === 5) return "warn";
    return "danger";
  }

   errorMessage(error, fallback) {
    return error instanceof Error && error.message ? error.message : fallback;
  }
}
