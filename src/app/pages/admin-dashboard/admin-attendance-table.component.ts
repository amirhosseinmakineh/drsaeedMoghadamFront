import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { finalize } from "rxjs";
import {
  AdminDashboardService,
  AttendanceItem,
} from "../../core/admin/admin-dashboard.service";
import {
  TableColumn,
  TableComponent,
} from "../../shared/base/table/table.component";

@Component({
  selector: "app-admin-attendance-table",
  standalone: true,
  imports: [CommonModule, TableComponent],
  templateUrl: "./admin-attendance-table.component.html",
  styles: [
    `
      .admin-panel {
        display: grid;
        gap: 16px;
        padding: 18px;
        border: 1px solid var(--line);
        border-radius: 30px;
        background: var(--surface);
        box-shadow: var(--shadow);
      }
      .panel-heading {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
        align-items: flex-start;
      }
      .panel-heading span {
        display: inline-flex;
        margin-bottom: 8px;
        padding: 5px 12px;
        border-radius: 999px;
        background: color-mix(in srgb, var(--brand) 14%, transparent);
        color: var(--brand);
        font-weight: 950;
      }
      .panel-heading h2 {
        margin: 0;
        font-size: 1.35rem;
      }
      .panel-heading p {
        margin: 8px 0 0;
        color: var(--muted);
      }
      .secondary-action {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        min-height: 48px;
        border: 1px solid var(--line);
        border-radius: 18px;
        padding: 12px 16px;
        background: var(--surface-muted);
        color: var(--text);
        font: inherit;
        font-weight: 950;
      }
      .secondary-action:disabled {
        cursor: not-allowed;
        opacity: 0.55;
      }
      .compact {
        min-height: 40px;
        border-radius: 999px;
        padding: 9px 13px;
        font-size: 0.86rem;
      }
      .feedback {
        margin: 0;
        padding: 10px 12px;
        border-radius: 18px;
        font-weight: 900;
      }
      .feedback.error {
        background: color-mix(in srgb, var(--danger) 14%, var(--surface));
        color: #991b1b;
      }
      @media (max-width: 760px) {
        .admin-panel {
          padding: 14px;
          border-radius: 24px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAttendanceTableComponent implements OnChanges, OnInit {
  @Input() consultantProfileId: number | null = null;
  @Input() title = "حضور و غیاب مشاور";

  items: AttendanceItem[] = [];
  loading = false;
  feedback = "";
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 1;
  private hasRequestedLoad = false;
  private loadRequestId = 0;

  readonly columns: TableColumn<AttendanceItem>[] = [
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
  ];

  constructor(
    private adminApi: AdminDashboardService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    if (!this.hasRequestedLoad) this.load();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["consultantProfileId"]) {
      this.pageNumber = 1;
      this.load();
    }
  }

  changePage(page: number): void {
    this.pageNumber = page;
    this.load();
  }

  load(): void {
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
          this.items = response.items ?? [];
          this.totalCount = response.totalCount ?? this.items.length;
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

  private markDirty(): void {
    this.cdr.markForCheck();
  }

  private statusLabel(value: number): string {
    const labels: Record<number, string> = {
      1: "حاضر",
      2: "غایب",
      3: "مرخصی",
      4: "مرخصی استعلاجی",
      5: "تأخیر",
      6: "مأموریت",
    };

    return labels[value] ?? "نامشخص";
  }

  private statusBadge(value: number): string {
    if (value === 1) return "success";
    if ([3, 4, 6].includes(value)) return "info";
    if (value === 5) return "warn";
    return "danger";
  }

  private errorMessage(error: unknown, fallback: string): string {
    return error instanceof Error && error.message ? error.message : fallback;
  }
}
