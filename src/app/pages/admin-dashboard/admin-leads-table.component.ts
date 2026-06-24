import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AdminDashboardService, LeadAssignmentItem, LeadFilters } from '../../core/admin/admin-dashboard.service';
import { TableColumn, TableComponent } from '../../shared/base/table/table.component';

type LeadTableMode = 'system' | 'consultant';

@Component({
  selector: 'app-admin-leads-table',
  standalone: true,
  imports: [CommonModule, FormsModule, TableComponent],
  template: `
    <section class="admin-panel">
      <header class="panel-heading">
        <div>
          <span>{{ mode === 'system' ? 'همه سیستم' : 'مشاور انتخاب‌شده' }}</span>
          <h2>{{ title }}</h2>
          <p>{{ description }}</p>
        </div>
      </header>

      <form class="filter-grid" (ngSubmit)="applyFilters()">
        <label>
          وضعیت لید
          <select [(ngModel)]="filters.leadAssignmentState" name="leadAssignmentState">
            <option [ngValue]="null">همه وضعیت‌ها</option>
            <option [ngValue]="1">جدید</option>
            <option [ngValue]="2">تخصیص داده شده</option>
            <option [ngValue]="3">تماس گرفته شده</option>
            <option [ngValue]="4">در انتظار پیگیری</option>
            <option [ngValue]="5">تبدیل شده</option>
            <option [ngValue]="6">منقضی شده</option>
            <option [ngValue]="7">رد شده</option>
          </select>
        </label>

        <label>
          نوع تخصیص
          <select [(ngModel)]="filters.leadAssignmentType" name="leadAssignmentType">
            <option [ngValue]="null">همه نوع‌ها</option>
            <option [ngValue]="1">هم‌زمان</option>
            <option [ngValue]="2">صف آفلاین</option>
          </select>
        </label>

        <button class="primary-filter" type="submit">اعمال فیلتر</button>
      </form>

      @if (feedback) {
        <p class="feedback error">{{ feedback }}</p>
      }

      <app-base-table
        [columns]="columns"
        [data]="items"
        [showAdd]="false"
        [showEdit]="false"
        [showDelete]="false"
        [loading]="loading"
        [currentPage]="filters.pageNumber"
        [pageSize]="filters.pageSize"
        [totalCount]="totalCount"
        [totalPages]="totalPages"
        emptyText="لیدی برای نمایش وجود ندارد"
        (pageChange)="changePage($event)"
      ></app-base-table>
    </section>
  `,
  styles: [`
    .admin-panel{display:grid;gap:16px;padding:18px;border:1px solid var(--line);border-radius:30px;background:color-mix(in srgb,var(--surface) 88%,transparent);box-shadow:var(--shadow)}
    .panel-heading{display:flex;justify-content:space-between;gap:12px}.panel-heading span{display:inline-flex;margin-bottom:8px;padding:5px 12px;border-radius:999px;background:color-mix(in srgb,var(--brand) 14%,transparent);color:var(--brand);font-weight:950}.panel-heading h2{margin:0;font-size:1.35rem}.panel-heading p{margin:8px 0 0;color:var(--muted)}
    .filter-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;align-items:end}label{display:grid;gap:8px;color:var(--muted);font-weight:950}.primary-filter{min-height:50px;border:0;border-radius:18px;background:linear-gradient(135deg,var(--brand),var(--brand-2));color:#1b1712;font:inherit;font-weight:950}
    .feedback{margin:0;padding:10px 12px;border-radius:18px;font-weight:900}.feedback.error{background:color-mix(in srgb,var(--danger) 14%,transparent);color:#fecaca}
    @media (max-width:760px){.admin-panel{padding:14px;border-radius:24px}.filter-grid{grid-template-columns:1fr}}
  `]
})
export class AdminLeadsTableComponent implements OnChanges {
  @Input() mode: LeadTableMode = 'system';
  @Input() profileId: number | null = null;
  @Input() title = 'مدیریت لیدها';
  @Input() description = 'مشاهده و فیلتر لیدها بر اساس وضعیت و نوع تخصیص';

  items: LeadAssignmentItem[] = [];
  loading = false;
  feedback = '';
  totalCount = 0;
  totalPages = 1;
  filters: LeadFilters = {
    leadAssignmentState: null,
    leadAssignmentType: null,
    pageNumber: 1,
    pageSize: 10
  };

  readonly columns: TableColumn<LeadAssignmentItem>[] = [
    { key: 'id', label: 'شناسه', value: row => row.id ?? row.leadAssignmentId ?? '-' },
    { key: 'userName', label: 'نام مراجعه‌کننده', value: row => this.leadName(row) },
    { key: 'phoneNumber', label: 'موبایل', value: row => this.leadPhone(row) },
    { key: 'leadAssignmentState', label: 'وضعیت', value: row => this.stateLabel(this.leadState(row)), badge: row => this.stateBadge(this.leadState(row)) },
    { key: 'leadAssignmentType', label: 'نوع', value: row => this.typeLabel(this.leadType(row)), badge: () => 'info' }
  ];

  constructor(private adminApi: AdminDashboardService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['profileId'] || changes['mode']) {
      this.filters.pageNumber = 1;
      this.load();
    }
  }

  applyFilters(): void {
    this.filters.pageNumber = 1;
    this.load();
  }

  changePage(page: number): void {
    this.filters.pageNumber = page;
    this.load();
  }

  load(): void {
    if (this.mode === 'consultant' && !this.profileId) {
      this.items = [];
      this.totalCount = 0;
      this.totalPages = 1;
      return;
    }

    this.loading = true;
    this.feedback = '';

    const query: LeadFilters = {
      ...this.filters,
      profileId: this.mode === 'consultant' ? this.profileId ?? undefined : undefined
    };

    const request = this.mode === 'consultant'
      ? this.adminApi.getConsultantLeads(query)
      : this.adminApi.getSystemLeads(query);

    request.pipe(finalize(() => this.loading = false)).subscribe({
      next: response => {
        this.items = response.items ?? [];
        this.totalCount = response.totalCount ?? this.items.length;
        this.totalPages = Math.max(1, response.totalPages || Math.ceil(this.totalCount / this.filters.pageSize));
      },
      error: error => this.feedback = this.errorMessage(error, 'دریافت لیدها انجام نشد')
    });
  }

  private leadName(row: LeadAssignmentItem): string {
    return row.userName
      || row.fullName
      || [row.firstName, row.lastName].filter(Boolean).join(' ').trim()
      || row.user?.userName
      || row.user?.fullName
      || row.user?.name
      || [row.user?.firstName, row.user?.lastName].filter(Boolean).join(' ').trim()
      || row.lead?.fullName
      || row.lead?.name
      || [row.lead?.firstName, row.lead?.lastName].filter(Boolean).join(' ').trim()
      || 'بدون نام';
  }

  private leadPhone(row: LeadAssignmentItem): string {
    return row.phoneNumber
      || row.mobile
      || row.userPhoneNumber
      || row.leadPhoneNumber
      || row.user?.phoneNumber
      || row.user?.mobile
      || row.lead?.phoneNumber
      || row.lead?.mobile
      || '-';
  }

  private leadState(row: LeadAssignmentItem): number | null {
    return row.leadAssignmentState ?? row.state ?? row.status ?? null;
  }

  private leadType(row: LeadAssignmentItem): number | null {
    return row.leadAssignmentType ?? row.assignmentType ?? row.type ?? null;
  }

  private stateLabel(value: number | null): string {
    const labels: Record<number, string> = {
      1: 'جدید',
      2: 'تخصیص داده شده',
      3: 'تماس گرفته شده',
      4: 'در انتظار پیگیری',
      5: 'تبدیل شده',
      6: 'منقضی شده',
      7: 'رد شده'
    };

    return value === null ? 'نامشخص' : labels[value] ?? 'نامشخص';
  }

  private stateBadge(value: number | null): string {
    if (value === 1 || value === 2) return 'info';
    if (value === 3 || value === 5) return 'success';
    if (value === 4 || value === 6) return 'warn';
    return 'danger';
  }

  private typeLabel(value: number | null): string {
    if (value === null) return 'نامشخص';
    return value === 2 ? 'صف آفلاین' : 'هم‌زمان';
  }

  private errorMessage(error: unknown, fallback: string): string {
    return error instanceof Error && error.message ? error.message : fallback;
  }
}
