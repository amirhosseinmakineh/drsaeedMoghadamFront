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

type PresenceTab = "overview" | "events";

@Component({
  selector: "app-admin-presence-dashboard",
  standalone: true,
  imports: [CommonModule, FormsModule, BaseDatepickerComponent, TableComponent],
  template: `
    <section class="admin-panel presence-panel">
      <header class="panel-heading">
        <div>
          <span>حضور و آنلاین</span>
          <h2>وضعیت آنلاین و فعالیت کاربران</h2>
          @if (selectedDatePersian) {
            <p>تاریخ انتخاب‌شده: {{ selectedDatePersian }}</p>
          }
        </div>
        <button
          class="secondary-action compact"
          type="button"
          [disabled]="overviewLoading || eventsLoading"
          (click)="reloadActiveTab()"
        >
          بروزرسانی
        </button>
      </header>

      <form class="date-filter" (ngSubmit)="applyDateFilter()">
        <label>
          انتخاب روز
          <app-base-datepicker
            [label]="datePickerLabel"
            [selectedDate]="selectedDate"
            [allowToday]="true"
            (dateChange)="onDateChange($event)"
          ></app-base-datepicker>
        </label>
        <button class="primary-filter" type="submit">نمایش اطلاعات این روز</button>
      </form>

      <div class="tab-bar" role="tablist" aria-label="نمای حضور">
        <button
          type="button"
          role="tab"
          [class.active]="activeTab === 'overview'"
          (click)="setTab('overview')"
        >
          خلاصه کاربران
        </button>
        <button
          type="button"
          role="tab"
          [class.active]="activeTab === 'events'"
          (click)="setTab('events')"
        >
          رویدادهای روز
        </button>
      </div>

      @if (activeTab === "overview") {
        <form class="filter-grid" (ngSubmit)="applyOverviewFilters()">
          <label>
            نام
            <input
              [(ngModel)]="overviewFilters.firstName"
              [ngModelOptions]="ngModelBlurOptions"
              name="presenceFirstName"
            />
          </label>
          <label>
            نام خانوادگی
            <input
              [(ngModel)]="overviewFilters.lastName"
              [ngModelOptions]="ngModelBlurOptions"
              name="presenceLastName"
            />
          </label>
          <label>
            موبایل
            <input
              [(ngModel)]="overviewFilters.phoneNumber"
              [ngModelOptions]="ngModelBlurOptions"
              name="presencePhone"
            />
          </label>
          <label>
            نقش
            <input
              [(ngModel)]="overviewFilters.roleName"
              [ngModelOptions]="ngModelBlurOptions"
              name="presenceRole"
            />
          </label>
          <label>
            وضعیت آنلاین
            <select
              [(ngModel)]="overviewOnlineFilter"
              [ngModelOptions]="ngModelBlurOptions"
              name="presenceOnline"
            >
              <option value="all">همه</option>
              <option value="online">فقط آنلاین</option>
              <option value="offline">فقط آفلاین</option>
            </select>
          </label>
          <button class="primary-filter" type="submit">اعمال فیلتر</button>
        </form>

        <app-base-table
          [columns]="overviewColumns"
          [data]="overviewItems"
          [showAdd]="false"
          [showEdit]="false"
          [showDelete]="false"
          [loading]="overviewLoading"
          [currentPage]="overviewFilters.pageNumber"
          [pageSize]="overviewFilters.pageSize"
          [totalCount]="overviewTotalCount"
          [totalPages]="overviewTotalPages"
          emptyText="کاربری برای این روز یافت نشد"
          (pageChange)="changeOverviewPage($event)"
        ></app-base-table>
      }

      @if (activeTab === "events") {
        <form class="filter-grid events-filter" (ngSubmit)="applyEventsFilters()">
          <label>
            جستجو (نام یا موبایل)
            <input
              [(ngModel)]="eventsFilters.search"
              [ngModelOptions]="ngModelBlurOptions"
              name="presenceSearch"
            />
          </label>
          <label>
            نوع رویداد
            <select
              [(ngModel)]="eventsTypeFilter"
              [ngModelOptions]="ngModelBlurOptions"
              name="presenceEventType"
            >
              <option value="">همه رویدادها</option>
              <option value="1">ورود به سیستم</option>
              <option value="2">خروج از سیستم</option>
              <option value="3">آنلاین شدن</option>
              <option value="4">آفلاین شدن</option>
              <option value="5">ثبت حضور</option>
              <option value="6">ثبت عدم حضور</option>
            </select>
          </label>
          <button class="primary-filter" type="submit">اعمال فیلتر</button>
        </form>

        <app-base-table
          [columns]="eventColumns"
          [data]="eventItems"
          [showAdd]="false"
          [showEdit]="false"
          [showDelete]="false"
          [loading]="eventsLoading"
          [currentPage]="eventsFilters.pageNumber"
          [pageSize]="eventsFilters.pageSize"
          [totalCount]="eventsTotalCount"
          [totalPages]="eventsTotalPages"
          emptyText="رویدادی برای این روز ثبت نشده است"
          (pageChange)="changeEventsPage($event)"
        ></app-base-table>
      }

      @if (feedback) {
        <p class="feedback error">{{ feedback }}</p>
      }
    </section>
  `,
  styles: [
    `
      .presence-panel {
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
        font-weight: 800;
      }
      .date-filter {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 12px;
        align-items: end;
        padding: 14px;
        border: 1px dashed var(--line);
        border-radius: 22px;
        background: color-mix(in srgb, var(--brand) 5%, var(--surface));
      }
      .tab-bar {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .tab-bar button {
        min-height: 42px;
        border: 1px solid var(--line);
        border-radius: 999px;
        padding: 8px 16px;
        background: var(--surface-muted);
        color: var(--text);
        font: inherit;
        font-weight: 900;
      }
      .tab-bar button.active {
        border-color: transparent;
        background: linear-gradient(135deg, var(--brand), var(--brand-2));
        color: #1b1712;
      }
      .filter-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
        align-items: end;
      }
      .events-filter {
        grid-template-columns: repeat(2, minmax(0, 1fr)) auto;
      }
      label {
        display: grid;
        gap: 8px;
        color: var(--muted);
        font-weight: 950;
      }
      input,
      select {
        min-height: 48px;
        border: 1px solid var(--line);
        border-radius: 16px;
        padding: 10px 12px;
        background: var(--surface);
        color: var(--text);
        font: inherit;
      }
      .primary-filter {
        min-height: 50px;
        border: 0;
        border-radius: 18px;
        background: linear-gradient(135deg, var(--brand), var(--brand-2));
        color: #1b1712;
        font: inherit;
        font-weight: 950;
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
        .presence-panel {
          padding: 14px;
          border-radius: 24px;
        }
        .date-filter,
        .filter-grid,
        .events-filter {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPresenceDashboardComponent implements OnInit {
  activeTab: PresenceTab = "overview";
  selectedDate = new Date();
  selectedDatePersian = "";
  feedback = "";

  overviewItems: UserPresenceOverviewItem[] = [];
  overviewLoading = false;
  overviewTotalCount = 0;
  overviewTotalPages = 1;
  overviewOnlineFilter: "all" | "online" | "offline" = "all";

  eventItems: UserPresenceEventItem[] = [];
  eventsLoading = false;
  eventsTotalCount = 0;
  eventsTotalPages = 1;
  eventsTypeFilter = "";

  overviewFilters: UserPresenceFilters = this.createFilters();
  eventsFilters: UserPresenceFilters = this.createFilters();

  readonly datePickerLabel = { fa: "تاریخ شمسی", en: "Persian date" };
  readonly ngModelBlurOptions = NG_MODEL_UPDATE_ON_BLUR;

  private overviewRequestId = 0;
  private eventsRequestId = 0;
  private readonly markDirty: () => void;

  readonly overviewColumns: TableColumn<UserPresenceOverviewItem>[] = [
    {
      key: "firstName",
      label: "نام کامل",
      value: (row) => this.fullName(row),
    },
    {
      key: "phoneNumber",
      label: "موبایل",
      value: (row) => row.phoneNumber || row.PhoneNumber || "-",
    },
    {
      key: "roleName",
      label: "نقش",
      value: (row) => this.roleLabel(row.roleName || row.RoleName || ""),
      badge: () => "info",
    },
    {
      key: "isCurrentlyOnline",
      label: "وضعیت فعلی",
      value: (row) =>
        row.isCurrentlyOnline || row.IsCurrentlyOnline ? "آنلاین" : "آفلاین",
      badge: (row) =>
        row.isCurrentlyOnline || row.IsCurrentlyOnline ? "success" : "danger",
    },
    {
      key: "lastSeenAtPersian",
      label: "آخرین بازدید",
      value: (row) =>
        row.lastSeenAtPersian || row.LastSeenAtPersian || "ثبت نشده",
    },
    {
      key: "firstLoginAtPersian",
      label: "اولین ورود روز",
      value: (row) =>
        row.firstLoginAtPersian || row.FirstLoginAtPersian || "-",
    },
    {
      key: "lastLogoutAtPersian",
      label: "آخرین خروج روز",
      value: (row) =>
        row.lastLogoutAtPersian || row.LastLogoutAtPersian || "-",
    },
    {
      key: "firstOnlineAtPersian",
      label: "اولین آنلاین",
      value: (row) =>
        row.firstOnlineAtPersian || row.FirstOnlineAtPersian || "-",
    },
    {
      key: "lastOfflineAtPersian",
      label: "آخرین آفلاین",
      value: (row) =>
        row.lastOfflineAtPersian || row.LastOfflineAtPersian || "-",
    },
    {
      key: "firstCheckInAtPersian",
      label: "ثبت حضور",
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
      key: "eventCountForDay",
      label: "تعداد رویداد",
      value: (row) => String(row.eventCountForDay ?? row.EventCountForDay ?? 0),
      badge: () => "warn",
    },
  ];

  readonly eventColumns: TableColumn<UserPresenceEventItem>[] = [
    {
      key: "occurredAtPersian",
      label: "زمان (شمسی)",
      value: (row) => row.occurredAtPersian || row.OccurredAtPersian || "-",
    },
    {
      key: "firstName",
      label: "نام کامل",
      value: (row) => this.fullName(row),
    },
    {
      key: "phoneNumber",
      label: "موبایل",
      value: (row) => row.phoneNumber || row.PhoneNumber || "-",
    },
    {
      key: "roleName",
      label: "نقش",
      value: (row) => this.roleLabel(row.roleName || row.RoleName || ""),
      badge: () => "info",
    },
    {
      key: "eventTypeLabel",
      label: "رویداد",
      value: (row) => row.eventTypeLabel || row.EventTypeLabel || "-",
      badge: (row) => this.eventBadge(row.eventType ?? row.EventType ?? 0),
    },
    {
      key: "description",
      label: "توضیح",
      value: (row) => row.description || row.Description || "-",
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
    this.loadOverview();
    this.loadEvents();
  }

  onDateChange(date: Date): void {
    this.selectedDate = date;
    this.markDirty();
  }

  applyDateFilter(): void {
    this.overviewFilters = {
      ...this.createFilters(),
      firstName: this.overviewFilters.firstName,
      lastName: this.overviewFilters.lastName,
      phoneNumber: this.overviewFilters.phoneNumber,
      roleName: this.overviewFilters.roleName,
      isCurrentlyOnline: this.resolveOnlineFilter(),
    };
    this.eventsFilters = {
      ...this.createFilters(),
      search: this.eventsFilters.search,
      eventType: this.resolveEventTypeFilter(),
    };
    this.syncSelectedDatePersian();
    this.reloadActiveTab();
  }

  setTab(tab: PresenceTab): void {
    this.activeTab = tab;
    this.markDirty();
  }

  reloadActiveTab(): void {
    if (this.activeTab === "overview") {
      this.loadOverview();
      return;
    }
    this.loadEvents();
  }

  applyOverviewFilters(): void {
    this.overviewFilters = {
      ...this.overviewFilters,
      pageNumber: 1,
      date: this.toDateString(this.selectedDate),
      isCurrentlyOnline: this.resolveOnlineFilter(),
    };
    this.loadOverview();
  }

  applyEventsFilters(): void {
    this.eventsFilters = {
      ...this.eventsFilters,
      pageNumber: 1,
      date: this.toDateString(this.selectedDate),
      eventType: this.resolveEventTypeFilter(),
    };
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
        isCurrentlyOnline: this.resolveOnlineFilter(),
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
          const firstItem = this.overviewItems[0];
          if (firstItem?.selectedDatePersian || firstItem?.SelectedDatePersian) {
            this.selectedDatePersian =
              firstItem.selectedDatePersian || firstItem.SelectedDatePersian || "";
          }
          this.markDirty();
        },
        error: (error) => {
          if (requestId === this.overviewRequestId) {
            this.feedback = this.errorMessage(
              error,
              "دریافت وضعیت حضور کاربران انجام نشد",
            );
            this.markDirty();
          }
        },
      });
  }

  private loadEvents(): void {
    const requestId = ++this.eventsRequestId;
    this.eventsLoading = true;
    this.feedback = "";
    this.markDirty();

    this.adminApi
      .getUserPresenceEvents({
        ...this.eventsFilters,
        date: this.toDateString(this.selectedDate),
        eventType: this.resolveEventTypeFilter(),
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
              "دریافت رویدادهای حضور انجام نشد",
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
    this.selectedDatePersian = this.selectedDate.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  private resolveOnlineFilter(): boolean | null {
    if (this.overviewOnlineFilter === "online") return true;
    if (this.overviewOnlineFilter === "offline") return false;
    return null;
  }

  private resolveEventTypeFilter(): number | null {
    if (!this.eventsTypeFilter) return null;
    const value = Number(this.eventsTypeFilter);
    return Number.isFinite(value) ? value : null;
  }

  private toDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  private fullName(
    row: Pick<UserPresenceOverviewItem, "firstName" | "lastName" | "FirstName" | "LastName">,
  ): string {
    return [row.firstName || row.FirstName, row.lastName || row.LastName]
      .filter(Boolean)
      .join(" ")
      .trim();
  }

  private roleLabel(role: string): string {
    const labels: Record<string, string> = {
      Admin: "مدیر",
      Consultant: "مشاور",
      Secretary: "منشی",
      Patient: "بیمار",
      NormalUser: "کاربر",
      User: "کاربر",
    };
    return (labels[role] ?? role) || "-";
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
