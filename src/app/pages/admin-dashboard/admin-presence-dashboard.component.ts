import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { finalize } from "rxjs";
import {
  AdminDashboardService,
  UserPresenceEventItem,
  UserPresenceFilters,
  UserPresenceOverviewItem,
} from "../../core/admin/admin-dashboard.service";
import { BaseDatepickerComponent } from "../../shared/base/base-datepicker/base-datepicker.component";
import {
  TableColumn,
  TableComponent,
} from "../../shared/base/table/table.component";
import { NG_MODEL_UPDATE_ON_BLUR } from "../../shared/forms/ng-model-options";
import { createCoalescedMarkForCheck } from "../../shared/change-detection/coalesce-mark-for-check";
import {
  formatIranDate,
  startOfIranDay,
  toIranDateInputValue,
} from "../../utils/iran-datetime.util";

@Component({
  selector: "app-admin-presence-dashboard",
  standalone: true,
  imports: [CommonModule, FormsModule, BaseDatepickerComponent, TableComponent],
  templateUrl: "./admin-presence-dashboard.component.html",
  styleUrl: "./admin-presence-dashboard.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPresenceDashboardComponent implements OnInit {
  selectedDate = startOfIranDay();
  selectedDatePersian = "";
  phoneFilter = "";
  feedback = "";

  overviewItems: UserPresenceOverviewItem[] = [];
  overviewLoading = false;
  overviewTotalCount = 0;
  overviewTotalPages = 1;
  overviewFilters: UserPresenceFilters = this.createFilters();

  eventItems: UserPresenceEventItem[] = [];
  eventsLoading = false;
  eventsTotalCount = 0;
  eventsTotalPages = 1;
  eventsFilters: UserPresenceFilters = this.createFilters();

  readonly datePickerLabel = { fa: "تاریخ شمسی", en: "Persian date" };
  readonly ngModelBlurOptions = NG_MODEL_UPDATE_ON_BLUR;

  private overviewRequestId = 0;
  private eventsRequestId = 0;
  private readonly markDirty: () => void;

  readonly overviewColumns: TableColumn<UserPresenceOverviewItem>[] = [
    {
      key: "firstName",
      label: "مشاور",
      value: (row) => this.fullName(row),
    },
    {
      key: "phoneNumber",
      label: "موبایل",
      value: (row) => row.phoneNumber || row.PhoneNumber || "-",
    },
    {
      key: "isCurrentlyOnline",
      label: "آنلاین",
      value: (row) =>
        row.isCurrentlyOnline || row.IsCurrentlyOnline ? "بله" : "خیر",
      badge: (row) =>
        row.isCurrentlyOnline || row.IsCurrentlyOnline ? "success" : "danger",
    },
    {
      key: "consultantIsAvailable",
      label: "حضور",
      value: (row) =>
        row.consultantIsAvailable || row.ConsultantIsAvailable ? "حاضر" : "غایب",
      badge: (row) =>
        row.consultantIsAvailable || row.ConsultantIsAvailable
          ? "success"
          : "danger",
    },
    {
      key: "lastSeenAtPersian",
      label: "آخرین بازدید",
      value: (row) =>
        row.lastSeenAtPersian || row.LastSeenAtPersian || "ثبت نشده",
    },
    {
      key: "firstCheckInAtPersian",
      label: "ثبت حضور روز",
      value: (row) =>
        row.firstCheckInAtPersian || row.FirstCheckInAtPersian || "-",
    },
    {
      key: "lastCheckOutAtPersian",
      label: "ثبت عدم حضور",
      value: (row) =>
        row.lastCheckOutAtPersian || row.LastCheckOutAtPersian || "-",
    },
    {
      key: "firstOnlineAtPersian",
      label: "آنلاین شدن",
      value: (row) =>
        row.firstOnlineAtPersian || row.FirstOnlineAtPersian || "-",
    },
    {
      key: "lastOfflineAtPersian",
      label: "آفلاین شدن",
      value: (row) =>
        row.lastOfflineAtPersian || row.LastOfflineAtPersian || "-",
    },
  ];

  readonly eventColumns: TableColumn<UserPresenceEventItem>[] = [
    {
      key: "occurredAtPersian",
      label: "زمان",
      value: (row) => row.occurredAtPersian || row.OccurredAtPersian || "-",
    },
    {
      key: "firstName",
      label: "مشاور",
      value: (row) => this.fullName(row),
    },
    {
      key: "eventTypeLabel",
      label: "رویداد",
      value: (row) => row.eventTypeLabel || row.EventTypeLabel || "-",
      badge: (row) => this.eventBadge(row.eventType ?? row.EventType ?? 0),
    },
  ];

  constructor(
    private adminApi: AdminDashboardService,
    private cdr: ChangeDetectorRef,
  ) {
    this.markDirty = createCoalescedMarkForCheck(this.cdr, () => false);
  }

  ngOnInit(): void {
    this.syncSelectedDatePersian();
    this.loadAll();
  }

  onDateChange(date: Date): void {
    this.selectedDate = date;
    this.markDirty();
  }

  applyDate(): void {
    this.overviewFilters = {
      ...this.createFilters(),
      phoneNumber: this.phoneFilter.trim() || undefined,
    };
    this.eventsFilters = {
      ...this.createFilters(),
      phoneNumber: this.phoneFilter.trim() || undefined,
    };
    this.syncSelectedDatePersian();
    this.loadAll();
  }

  loadAll(): void {
    this.loadOverview();
    this.loadEvents();
  }

  changeOverviewPage(page: number): void {
    this.overviewFilters = { ...this.overviewFilters, pageNumber: page };
    this.loadOverview();
  }

  changeEventsPage(page: number): void {
    this.eventsFilters = { ...this.eventsFilters, pageNumber: page };
    this.loadEvents();
  }

  private loadOverview(): void {
    const requestId = ++this.overviewRequestId;
    this.overviewLoading = true;
    this.feedback = "";
    this.markDirty();

    this.adminApi
      .getUserPresenceOverview({
        ...this.overviewFilters,
        date: this.toDateString(this.selectedDate),
        phoneNumber: this.phoneFilter.trim() || undefined,
      })
      .pipe(
        finalize(() => {
          if (requestId === this.overviewRequestId) {
            this.overviewLoading = false;
            this.markDirty();
          }
        }),
      )
      .subscribe({
        next: (response) => {
          if (requestId !== this.overviewRequestId) return;
          this.overviewItems = response.items ?? [];
          this.overviewTotalCount =
            response.totalCount ?? this.overviewItems.length;
          this.overviewTotalPages = Math.max(
            1,
            response.totalPages ||
              Math.ceil(this.overviewTotalCount / this.overviewFilters.pageSize),
          );
          this.markDirty();
        },
        error: (error) => {
          if (requestId === this.overviewRequestId) {
            this.feedback = this.errorMessage(
              error,
              "دریافت وضعیت مشاوران انجام نشد",
            );
            this.markDirty();
          }
        },
      });
  }

  private loadEvents(): void {
    const requestId = ++this.eventsRequestId;
    this.eventsLoading = true;
    this.markDirty();

    this.adminApi
      .getUserPresenceEvents({
        ...this.eventsFilters,
        date: this.toDateString(this.selectedDate),
        phoneNumber: this.phoneFilter.trim() || undefined,
      })
      .pipe(
        finalize(() => {
          if (requestId === this.eventsRequestId) {
            this.eventsLoading = false;
            this.markDirty();
          }
        }),
      )
      .subscribe({
        next: (response) => {
          if (requestId !== this.eventsRequestId) return;
          this.eventItems = response.items ?? [];
          this.eventsTotalCount = response.totalCount ?? this.eventItems.length;
          this.eventsTotalPages = Math.max(
            1,
            response.totalPages ||
              Math.ceil(this.eventsTotalCount / this.eventsFilters.pageSize),
          );
          this.markDirty();
        },
        error: (error) => {
          if (requestId === this.eventsRequestId) {
            this.feedback = this.errorMessage(
              error,
              "دریافت رویدادهای مشاوران انجام نشد",
            );
            this.markDirty();
          }
        },
      });
  }

  private createFilters(): UserPresenceFilters {
    return {
      date: this.toDateString(this.selectedDate),
      pageNumber: 1,
      pageSize: 10,
    };
  }

  private syncSelectedDatePersian(): void {
    this.selectedDatePersian = formatIranDate(this.selectedDate);
  }

  private toDateString(date: Date): string {
    return toIranDateInputValue(date);
  }

  private fullName(
    row: Pick<
      UserPresenceOverviewItem,
      "firstName" | "lastName" | "FirstName" | "LastName"
    >,
  ): string {
    return [row.firstName || row.FirstName, row.lastName || row.LastName]
      .filter(Boolean)
      .join(" ")
      .trim();
  }

  private eventBadge(eventType: number): string {
    if ([1, 3, 5].includes(eventType)) return "success";
    if ([2, 4, 6].includes(eventType)) return "danger";
    return "info";
  }

  private errorMessage(error: unknown, fallback: string): string {
    return error instanceof Error && error.message ? error.message : fallback;
  }
}
