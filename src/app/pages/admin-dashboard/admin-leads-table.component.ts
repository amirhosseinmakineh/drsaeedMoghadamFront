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
import { FormsModule } from "@angular/forms";
import { finalize } from "rxjs";
import {
  AdminDashboardService,
  LeadAssignmentItem,
  LeadFilters,
} from "../../core/admin/admin-dashboard.service";
import {
  downloadBlob,
  reportFileName,
} from "../../utils/file-download.util";
import {
  LeadAssignmentState,
  leadAssignmentStatePresentation,
  readLeadAssignmentState,
} from "../../core/lead/lead-assignment-state";
import {
  TableColumn,
  TableComponent,
} from "../../shared/base/table/table.component";
import { NG_MODEL_UPDATE_ON_BLUR } from "../../shared/forms/ng-model-options";
import {
  ADMIN_LEAD_STATE_FILTER_OPTIONS,
  ADMIN_LEAD_TYPE_FILTER_OPTIONS,
  leadAssignmentStateLabel,
  leadAssignmentTypeLabel,
  resolveLeadAssignmentState,
  resolveLeadAssignmentType,
} from "../../core/lead/lead-enums";
import { formatIranDateTime } from "../../utils/iran-datetime.util";

type LeadTableMode = "system" | "consultant";

@Component({
  selector: "app-admin-leads-table",
  standalone: true,
  imports: [CommonModule, FormsModule, TableComponent],
  templateUrl: "./admin-leads-table.component.html",
  styleUrl: "./admin-leads-table.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLeadsTableComponent implements OnChanges, OnInit {
  @Input() mode: LeadTableMode = "system";
  @Input() profileId: number | null = null;
  @Input() title = "مدیریت لیدها";
  @Input() description = "مشاهده و فیلتر لیدها بر اساس وضعیت و نوع تخصیص";

  items: LeadAssignmentItem[] = [];
  loading = false;
  exporting = false;
  feedback = "";
  phoneFilter = "";
  checkedLeadIds = new Set<number>();
  totalCount = 0;
  totalPages = 1;
  filters: LeadFilters = {
    leadAssignmentState: null,
    leadAssignmentType: null,
    pageNumber: 1,
    pageSize: 10,
  };
  private hasRequestedLoad = false;
  private loadRequestId = 0;
  readonly ngModelBlurOptions = NG_MODEL_UPDATE_ON_BLUR;
  readonly stateFilterOptions = ADMIN_LEAD_STATE_FILTER_OPTIONS;
  readonly typeFilterOptions = ADMIN_LEAD_TYPE_FILTER_OPTIONS;

  readonly columns: TableColumn<LeadAssignmentItem>[] = [
    { key: "id", label: "شناسه", value: (row) => this.leadId(row) ?? "-" },
    {
      key: "userName",
      label: "نام مراجعه‌کننده",
      value: (row) => this.leadName(row),
    },
    {
      key: "phoneNumber",
      label: "موبایل",
      value: (row) => this.leadPhone(row),
    },
    {
      key: "createdAt",
      label: "تاریخ ایجاد لید",
      value: (row) => this.formatDateTime(this.leadCreatedAt(row)),
    },
    {
      key: "contactedAt",
      label: "تاریخ تماس",
      value: (row) => this.formatDateTime(this.leadContactedAt(row)),
    },
    {
      key: "checked",
      label: "بررسی",
      value: (row) => (this.isLeadChecked(row) ? "بررسی شد" : "بررسی نشده"),
      badge: (row) => (this.isLeadChecked(row) ? "success" : "warn"),
    },
    {
      key: "leadAssignmentState",
      label: "وضعیت",
      value: (row) => leadAssignmentStatePresentation(this.leadState(row)).label,
      badge: (row) =>
        leadAssignmentStatePresentation(this.leadState(row)).badge,
    },
    {
      key: "leadAssignmentType",
      label: "نوع",
      value: (row) => this.typeLabel(this.leadType(row)),
      badge: () => "info",
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
    if (changes["profileId"] || changes["mode"]) {
      this.filters.pageNumber = 1;
      this.load();
    }
  }

  applyFilters(): void {
    this.filters.pageNumber = 1;
    this.load();
  }

  toggleLeadChecked(row: LeadAssignmentItem): void {
    const id = this.leadId(row);
    if (!id) return;
    if (this.checkedLeadIds.has(id)) this.checkedLeadIds.delete(id);
    else this.checkedLeadIds.add(id);
    this.cdr.markForCheck();
  }

  isLeadChecked(row: LeadAssignmentItem): boolean {
    const id = this.leadId(row);
    return id ? this.checkedLeadIds.has(id) : false;
  }

  leadPhoneHref(row: LeadAssignmentItem): string | null {
    const phone = this.leadPhone(row);
    return phone && phone !== "-" ? `tel:${phone}` : null;
  }

  changePage(page: number): void {
    this.filters.pageNumber = page;
    this.load();
  }

  exportLeadsReport(): void {
    if (this.exporting || this.mode !== "system") return;

    this.exporting = true;
    this.feedback = "";
    this.cdr.markForCheck();

    this.adminApi
      .exportLeadsReport()
      .pipe(
        finalize(() => {
          this.exporting = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (blob) => downloadBlob(blob, reportFileName("leads-report")),
        error: (error) => {
          this.feedback =
            error instanceof Error && error.message
              ? error.message
              : "خطا در دریافت گزارش. لطفاً دوباره تلاش کنید.";
          this.cdr.markForCheck();
        },
      });
  }

  load(): void {
    this.hasRequestedLoad = true;

    if (this.mode === "consultant" && !this.profileId) {
      this.items = [];
      this.totalCount = 0;
      this.totalPages = 1;
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    const requestId = ++this.loadRequestId;
    this.loading = true;
    this.feedback = "";
    this.cdr.markForCheck();

    const query: LeadFilters = {
      ...this.filters,
      profileId:
        this.mode === "consultant" ? (this.profileId ?? undefined) : undefined,
    };

    const request =
      this.mode === "consultant"
        ? this.adminApi.getConsultantLeads(query)
        : this.adminApi.getSystemLeads(query);

    request
      .pipe(
        finalize(() => {
          if (requestId === this.loadRequestId) {
            this.loading = false;
            this.cdr.markForCheck();
          }
        }),
      )
      .subscribe({
        next: (response) => {
          if (requestId !== this.loadRequestId) return;
          const items = response.items ?? [];
          this.items = this.phoneFilter.trim()
            ? items.filter((row) =>
                this.leadPhone(row).includes(this.phoneFilter.trim()),
              )
            : items;
          this.totalCount = this.phoneFilter.trim()
            ? this.items.length
            : (response.totalCount ?? this.items.length);
          this.totalPages = Math.max(
            1,
            response.totalPages ||
              Math.ceil(this.totalCount / this.filters.pageSize),
          );
          this.cdr.markForCheck();
        },
        error: (error) => {
          if (requestId === this.loadRequestId) {
            this.feedback = this.errorMessage(error, "دریافت لیدها انجام نشد");
            this.cdr.markForCheck();
          }
        },
      });
  }

  private leadName(row: LeadAssignmentItem): string {
    return (
      row.userName ||
      row.UserName ||
      row.fullName ||
      row.FullName ||
      [row.firstName, row.lastName].filter(Boolean).join(" ").trim() ||
      [row.FirstName, row.LastName].filter(Boolean).join(" ").trim() ||
      row.user?.userName ||
      row.user?.UserName ||
      row.user?.fullName ||
      row.user?.FullName ||
      row.user?.name ||
      row.user?.Name ||
      [row.user?.firstName, row.user?.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      [row.user?.FirstName, row.user?.LastName]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      row.User?.userName ||
      row.User?.UserName ||
      row.User?.fullName ||
      row.User?.FullName ||
      row.User?.name ||
      row.User?.Name ||
      [row.User?.firstName, row.User?.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      [row.User?.FirstName, row.User?.LastName]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      row.lead?.fullName ||
      row.lead?.FullName ||
      row.lead?.name ||
      row.lead?.Name ||
      [row.lead?.firstName, row.lead?.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      [row.lead?.FirstName, row.lead?.LastName]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      row.Lead?.fullName ||
      row.Lead?.FullName ||
      row.Lead?.name ||
      row.Lead?.Name ||
      [row.Lead?.firstName, row.Lead?.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      [row.Lead?.FirstName, row.Lead?.LastName]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      "بدون نام"
    );
  }

  private leadPhone(row: LeadAssignmentItem): string {
    return (
      row.phoneNumber ||
      row.PhoneNumber ||
      row.mobile ||
      row.Mobile ||
      row.userPhoneNumber ||
      row.UserPhoneNumber ||
      row.leadPhoneNumber ||
      row.LeadPhoneNumber ||
      row.user?.phoneNumber ||
      row.user?.PhoneNumber ||
      row.user?.mobile ||
      row.user?.Mobile ||
      row.User?.phoneNumber ||
      row.User?.PhoneNumber ||
      row.User?.mobile ||
      row.User?.Mobile ||
      row.lead?.phoneNumber ||
      row.lead?.PhoneNumber ||
      row.lead?.mobile ||
      row.lead?.Mobile ||
      row.Lead?.phoneNumber ||
      row.Lead?.PhoneNumber ||
      row.Lead?.mobile ||
      row.Lead?.Mobile ||
      "-"
    );
  }

  private leadState(row: LeadAssignmentItem): number | null {
    return resolveLeadAssignmentState(
      row.leadAssignmentState ??
        row.LeadAssignmentState ??
        row.state ??
        row.State ??
        row.status ??
        row.Status ??
        null,
    );
  }

  private leadType(row: LeadAssignmentItem): number | null {
    return resolveLeadAssignmentType(
      row.leadAssignmentType ??
        row.LeadAssignmentType ??
        row.assignmentType ??
        row.AssignmentType ??
        row.type ??
        row.Type ??
        null,
    );
  }

  private leadId(row: LeadAssignmentItem): number | null {
    return this.numberOrNull(
      row.id ?? row.Id ?? row.leadAssignmentId ?? row.LeadAssignmentId ?? null,
    );
  }

  private numberOrNull(value: unknown): number | null {
    if (value === null || value === undefined || value === "") return null;
    const numeric = typeof value === "number" ? value : Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

  private stateLabel(value: number | null): string {
    return leadAssignmentStateLabel(value);
  }

  private stateBadge(value: number | null): string {
    if (value === 1 || value === 2) return "info";
    if (value === 5) return "success";
    if (value === 4 || value === 6) return "warn";
    return "danger";
  }

  private typeLabel(value: number | null): string {
    return leadAssignmentTypeLabel(value);
  }

  private errorMessage(error: unknown, fallback: string): string {
    return error instanceof Error && error.message ? error.message : fallback;
  }

  private leadCreatedAt(row: LeadAssignmentItem): string {
    return row.createdAt || row.CreatedAt || "";
  }

  private leadContactedAt(row: LeadAssignmentItem): string {
    return row.contactedAt || row.ContactedAt || "";
  }

  private formatDateTime(value: string): string {
    return formatIranDateTime(value);
  }
}
