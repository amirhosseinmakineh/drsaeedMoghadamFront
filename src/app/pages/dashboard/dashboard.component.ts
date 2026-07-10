import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  computed,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { finalize } from "rxjs";
import {
  AdminDashboardService,
  AdminUser,
  Consultant,
  ConsultantFilters,
  SaveUserRequest,
  UserFilters,
} from "../../core/admin/admin-dashboard.service";
import { AuthService } from "../../core/auth/auth.service";
import { PushNotificationService } from "../../core/push/push-notification.service";
import { ToastService } from "../../core/toast/toast.service";
import { AdminReservationsTableComponent } from "../admin-dashboard/admin-reservations-table.component";
import { AdminAttendanceTableComponent } from "../admin-dashboard/admin-attendance-table.component";
import { AdminLeadCallReportsComponent } from "../admin-dashboard/admin-lead-call-reports.component";
import { AdminLeadsTableComponent } from "../admin-dashboard/admin-leads-table.component";
import { AdminPresenceDashboardComponent } from "../admin-dashboard/admin-presence-dashboard.component";
import { AdminConsultantProfileComponent } from "../admin-dashboard/admin-consultant-profile.component";
import { BaseDialogComponent } from "../../shared/base/base-dialog/base-dialog.component";
import { BaseDatepickerComponent } from "../../shared/base/base-datepicker/base-datepicker.component";
import {
  TableActionClick,
  TableColumn,
  TableComponent,
} from "../../shared/base/table/table.component";
import { FaIconComponent } from "../../shared/ui/fa-icon/fa-icon.component";
import {
  downloadBlob,
  reportFileName,
} from "../../utils/file-download.util";
import { NG_MODEL_UPDATE_ON_BLUR } from "../../shared/forms/ng-model-options";
import { createCoalescedMarkForCheck } from "../../shared/change-detection/coalesce-mark-for-check";

type DashboardSection =
  | "overview"
  | "users"
  | "consultants"
  | "consultantProfile"
  | "leads"
  | "leadReports"
  | "reservations"
  | "presence";
type UserDialogMode = "add" | "edit";

interface DashboardLink {
  id: DashboardSection;
  label: string;
  icon: string;
}

interface UserFormModel {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  passwordHash: string;
  isCompleteProfile: boolean;
  avatarImageName: string | null;
  gender: number;
  birthDate: string;
  isActive: boolean;
  roleName: string;
}

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    BaseDialogComponent,
    BaseDatepickerComponent,
    TableComponent,
    AdminLeadsTableComponent,
    AdminLeadCallReportsComponent,
    AdminAttendanceTableComponent,
    AdminReservationsTableComponent,
    AdminPresenceDashboardComponent,
    AdminConsultantProfileComponent,
    FaIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="dashboard-layout"
      [class.admin-mode]="isAdmin()"
      [class.patient-mode]="!isAdmin()"
    >
      <header class="dashboard-mobile-header">
        <div class="mobile-header-info">
          @if (isAdmin()) {
            <button
              class="mobile-menu-btn"
              type="button"
              (click)="toggleMobileSidebar()"
              [attr.aria-expanded]="mobileSidebarOpen"
              aria-label="باز و بسته کردن منو"
            >
              <app-fa-icon name="dashboard"></app-fa-icon>
            </button>
          }
          <span class="mobile-avatar"
            ><app-fa-icon name="user"></app-fa-icon
          ></span>
          <div>
            <strong>{{ displayName() }}</strong>
            <small>{{ roleLabel() }}</small>
          </div>
        </div>
        <button
          class="mobile-logout-btn"
          type="button"
          (click)="logout()"
          aria-label="خروج از حساب کاربری"
        >
          <app-fa-icon name="logout"></app-fa-icon>
          <span>خروج</span>
        </button>
      </header>

      @if (isAdmin() && mobileSidebarOpen) {
        <button
          class="mobile-sidebar-backdrop"
          type="button"
          aria-label="بستن منو"
          (click)="closeMobileSidebar()"
        ></button>
      }

      <aside
        class="dashboard-sidebar"
        [class.mobile-app-nav]="isAdmin()"
        [class.mobile-sidebar-open]="isAdmin() && mobileSidebarOpen"
      >
        <a class="dashboard-brand" routerLink="/">
          <span class="brand-mark"
            ><app-fa-icon name="tooth"></app-fa-icon
          ></span>
          <strong>کلینیک دکتر سعید مقدم</strong>
        </a>

        <div class="dashboard-user-card">
          <span class="avatar"><app-fa-icon name="user"></app-fa-icon></span>
          <div>
            <small>کاربر وارد شده</small>
            <h1>{{ displayName() }}</h1>
            <b>{{ roleLabel() }}</b>
          </div>
        </div>

        <nav class="dashboard-nav" aria-label="داشبورد">
          <button
            *ngFor="let item of visibleLinks; trackBy: trackDashboardLink"
            type="button"
            [class.active]="activeSection === item.id"
            (click)="setSection(item.id)"
          >
            <app-fa-icon [name]="item.icon"></app-fa-icon>
            <span>{{ item.label }}</span>
          </button>
        </nav>

        @if (isAdmin()) {
          <button
            class="mobile-sidebar-close"
            type="button"
            (click)="closeMobileSidebar()"
          >
            بستن منو
          </button>
        }

        <button
          class="secondary-btn logout-btn"
          type="button"
          (click)="logout()"
        >
          <app-fa-icon name="logout"></app-fa-icon>
          خروج از حساب کاربری
        </button>
      </aside>

      <main class="dashboard-content">
        @if (isAdmin()) {
          <section class="admin-shell">
            @if (activeSection === "overview") {
              <header class="dashboard-hero admin-hero">
                <span>داشبورد ادمین</span>
                <h2>مدیریت کلینیک، {{ displayName() }}</h2>
              </header>
            }

            @if (feedbackMessage) {
              <p
                class="feedback"
                [class.error]="feedbackType === 'error'"
                [class.success]="feedbackType === 'success'"
              >
                {{ feedbackMessage }}
              </p>
            }

            @if (activeSection === "overview") {
              <section class="admin-overview">
                <button type="button" (click)="setSection('users')">
                  <span><app-fa-icon name="users"></app-fa-icon></span>
                  <strong>مدیریت کاربران</strong>
                </button>
                <button type="button" (click)="setSection('consultants')">
                  <span><app-fa-icon name="doctor"></app-fa-icon></span>
                  <strong>مدیریت مشاوران</strong>
                </button>
                <button type="button" (click)="setSection('consultantProfile')">
                  <span><app-fa-icon name="user"></app-fa-icon></span>
                  <strong>پروفایل مشاور</strong>
                </button>
                <button type="button" (click)="setSection('leads')">
                  <span><app-fa-icon name="clipboard"></app-fa-icon></span>
                  <strong>مدیریت لیدهای سیستم</strong>
                </button>
                <button type="button" (click)="setSection('leadReports')">
                  <span><app-fa-icon name="clipboard"></app-fa-icon></span>
                  <strong>گزارش تماس لیدها</strong>
                </button>
                <button type="button" (click)="setSection('reservations')">
                  <span><app-fa-icon name="calendar"></app-fa-icon></span>
                  <strong>رزروها و تایید حضور</strong>
                </button>
                <button type="button" (click)="setSection('presence')">
                  <span><app-fa-icon name="clock"></app-fa-icon></span>
                  <strong>وضعیت مشاوران</strong>
                </button>
              </section>
            }

            @if (activeSection === "users") {
              <section class="admin-panel">
                <header class="panel-heading">
                  <div>
                    <span>کاربران</span>
                    <h2>مدیریت کاربران سیستم</h2>
                  </div>
                  <button
                    class="export-action"
                    type="button"
                    [disabled]="exportingUsers"
                    (click)="exportUsersReport()"
                  >
                    <app-fa-icon name="download"></app-fa-icon>
                    <span>{{
                      exportingUsers
                        ? "در حال آماده‌سازی..."
                        : "دانلود گزارش اکسل کاربران"
                    }}</span>
                  </button>
                </header>

                <form
                  class="filter-grid users-filter"
                  (ngSubmit)="applyUserFilters()"
                >
                  <label
                    >نام                    <input
                      [(ngModel)]="userFilters.firstName"
                      [ngModelOptions]="ngModelBlurOptions"
                      name="userFirstName"
                  /></label>
                  <label
                    >نام خانوادگی                    <input
                      [(ngModel)]="userFilters.lastName"
                      [ngModelOptions]="ngModelBlurOptions"
                      name="userLastName"
                  /></label>
                  <label
                    >موبایل<input
                      [(ngModel)]="userFilters.phoneNumber"
                      [ngModelOptions]="ngModelBlurOptions"
                      name="userPhone"
                      inputmode="tel"
                  /></label>
                  <label>
                    نقش
                    <select
                      [(ngModel)]="userFilters.roleName"
                      [ngModelOptions]="ngModelBlurOptions"
                      name="userRole"
                    >
                      <option value="Admin">ادمین</option>
                      <option value="Consultant">مشاور</option>
                      <option value="Secretary">منشی</option>
                      <option value="NormalUser">کاربر عادی</option>
                    </select>
                  </label>
                  <label>
                    جنسیت
                    <select
                      [(ngModel)]="userFilters.gender"
                      [ngModelOptions]="ngModelBlurOptions"
                      name="userGender"
                    >
                      <option [ngValue]="1">مرد</option>
                      <option [ngValue]="2">زن</option>
                    </select>
                  </label>
                  <label>
                    وضعیت
                    <select
                      [(ngModel)]="userFilters.isActive"
                      [ngModelOptions]="ngModelBlurOptions"
                      name="userActive"
                    >
                      <option [ngValue]="null">همه</option>
                      <option [ngValue]="true">فعال</option>
                      <option [ngValue]="false">غیرفعال</option>
                    </select>
                  </label>
                  <button class="primary-filter" type="submit">
                    اعمال فیلتر
                  </button>
                </form>

                <app-base-table
                  title="لیست کاربران"
                  [columns]="userColumns"
                  [data]="users"
                  [showAdd]="true"
                  [showEdit]="true"
                  [showDelete]="true"
                  [loading]="usersLoading"
                  [currentPage]="userFilters.pageNumber"
                  [pageSize]="userFilters.pageSize"
                  [totalCount]="usersTotalCount"
                  [totalPages]="usersTotalPages"
                  addLabel="افزودن کاربر"
                  emptyText="کاربری برای نمایش وجود ندارد"
                  (addClick)="openAddUserDialog()"
                  (actionClick)="handleUserAction($event)"
                  (pageChange)="changeUsersPage($event)"
                ></app-base-table>
              </section>
            }

            @if (activeSection === "consultants") {
              <section class="admin-panel consultants-panel">
                <header class="panel-heading consultants-heading">
                  <div>
                    <span>مشاوران</span>
                    <h2>مدیریت مشاوران و لیدها</h2>
                  </div>
                </header>

                <div class="export-hero">
                  <button
                    class="export-action primary-export"
                    type="button"
                    [disabled]="exportingConsultants"
                    (click)="exportConsultantsReport()"
                  >
                    <app-fa-icon name="download"></app-fa-icon>
                    <span>{{
                      exportingConsultants
                        ? "در حال آماده‌سازی..."
                        : "دانلود گزارش کامل مشاوران"
                    }}</span>
                  </button>
                </div>

                <form class="filter-grid" (ngSubmit)="applyConsultantFilters()">
                  <label
                    >نام<input
                      [(ngModel)]="consultantFilters.firstName"
                      [ngModelOptions]="ngModelBlurOptions"
                      name="consultantFirstName"
                  /></label>
                  <label
                    >نام خانوادگی<input
                      [(ngModel)]="consultantFilters.lastName"
                      [ngModelOptions]="ngModelBlurOptions"
                      name="consultantLastName"
                  /></label>
                  <label
                    >موبایل<input
                      [(ngModel)]="consultantFilters.phoneNumber"
                      [ngModelOptions]="ngModelBlurOptions"
                      name="consultantPhone"
                      inputmode="tel"
                  /></label>
                  <button class="primary-filter" type="submit">
                    اعمال فیلتر
                  </button>
                </form>

                @if (
                  selectedAttendanceConsultant ||
                  selectedLeadsConsultant ||
                  selectedReservationsConsultant
                ) {
                  <div id="consultant-detail-panel" class="consultant-detail-panel">
                    @if (selectedAttendanceConsultant) {
                      <app-admin-attendance-table
                        [consultantProfileId]="
                          selectedAttendanceConsultant.profileId
                        "
                        [title]="
                          'حضور و غیاب ' +
                          fullName(selectedAttendanceConsultant)
                        "
                      ></app-admin-attendance-table>
                    }

                    @if (selectedLeadsConsultant) {
                      <app-admin-leads-table
                        mode="consultant"
                        [profileId]="selectedLeadsConsultant.profileId"
                        [title]="
                          'لیدهای ' + fullName(selectedLeadsConsultant)
                        "
                      ></app-admin-leads-table>
                    }

                    @if (selectedReservationsConsultant) {
                      <app-admin-reservations-table
                        mode="consultant"
                        [profileId]="selectedReservationsConsultant.profileId"
                        [title]="
                          'رزروهای ' +
                          fullName(selectedReservationsConsultant)
                        "
                      ></app-admin-reservations-table>
                    }
                  </div>
                }

                <app-base-table
                  title="لیست مشاوران"
                  [columns]="consultantColumns"
                  [data]="consultants"
                  [showAdd]="false"
                  [showEdit]="false"
                  [showDelete]="false"
                  [customActions]="consultantActions"
                  [loading]="consultantsLoading"
                  [currentPage]="consultantFilters.pageNumber"
                  [pageSize]="consultantFilters.pageSize"
                  [totalCount]="consultantsTotalCount"
                  [totalPages]="consultantsTotalPages"
                  emptyText="چیزی نیست"
                  (actionClick)="handleConsultantAction($event)"
                  (pageChange)="changeConsultantsPage($event)"
                ></app-base-table>

                <app-admin-leads-table
                  mode="system"
                  title="گزارش لیدهای تخصیص‌یافته به مشاوران"
                ></app-admin-leads-table>
              </section>
            }

            @if (activeSection === "consultantProfile") {
              <app-admin-consultant-profile
                [profileId]="selectedProfileConsultantId"
              ></app-admin-consultant-profile>
            }

            @if (activeSection === "leads") {
              <app-admin-leads-table
                mode="system"
                title="مدیریت کامل لیدهای سیستم"
              ></app-admin-leads-table>
            }

            @if (activeSection === "leadReports") {
              <app-admin-lead-call-reports></app-admin-lead-call-reports>
            }

            @if (activeSection === "reservations") {
              <app-admin-reservations-table
                mode="system"
                title="مدیریت رزروها و تایید حضور مشاوران"
              ></app-admin-reservations-table>
            }

            @if (activeSection === "presence") {
              <app-admin-presence-dashboard></app-admin-presence-dashboard>
            }
          </section>
        } @else {
          <div class="dashboard-hero">
            <span>{{ roleLabel() }}</span>
            <h2>{{ displayName() }}</h2>
          </div>

          <div class="dashboard-grid">
            <article>
              <span><app-fa-icon name="shield"></app-fa-icon></span>
              <h3>نقش حساب</h3>
              <strong>{{ roleLabel() }}</strong>
            </article>

            <article>
              <span><app-fa-icon name="user"></app-fa-icon></span>
              <h3>نام کاربر</h3>
              <strong>{{ displayName() }}</strong>
            </article>

            <article>
              <span><app-fa-icon name="dashboard"></app-fa-icon></span>
              <h3>فضای اختصاصی</h3>
              <strong>{{ dashboardTitle() }}</strong>
            </article>
          </div>
        }
      </main>

      <app-base-dialog
        [open]="userDialogOpen"
        [showFooter]="false"
        [title]="userDialogMode === 'add' ? 'افزودن کاربر' : 'ویرایش کاربر'"
        (closed)="closeUserDialog()"
      >
        <form class="dialog-form" (ngSubmit)="submitUserForm()">
          <div class="two-col">
            <label
              >نام<input
                [(ngModel)]="userForm.firstName"
                [ngModelOptions]="ngModelBlurOptions"
                name="dialogFirstName"
                maxlength="100"
            /></label>
            <label
              >نام خانوادگی<input
                [(ngModel)]="userForm.lastName"
                [ngModelOptions]="ngModelBlurOptions"
                name="dialogLastName"
                maxlength="100"
            /></label>
          </div>
          <label
            >شماره موبایل<input
              [(ngModel)]="userForm.phoneNumber"
              [ngModelOptions]="ngModelBlurOptions"
              name="dialogPhone"
              inputmode="tel"
          /></label>
          @if (userDialogMode === "add") {
            <div class="two-col">
              <label
                >رمز عبور<input
                  [(ngModel)]="userForm.passwordHash"
                  [ngModelOptions]="ngModelBlurOptions"
                  name="dialogPassword"
                  type="password"
                  minlength="6"
                  maxlength="100"
              /></label>
              <label>
                تاریخ تولد
                <app-base-datepicker
                  [label]="birthDatePickerLabel"
                  [selectedDate]="selectedUserBirthDate"
                  [minDate]="birthDateMinDate"
                  [maxDate]="birthDateMaxDate"
                  (dateChange)="setUserBirthDate($event)"
                ></app-base-datepicker>
              </label>
            </div>
          }
          <div class="two-col">
            <label>
              جنسیت
              <select
                [(ngModel)]="userForm.gender"
                [ngModelOptions]="ngModelBlurOptions"
                name="dialogGender"
              >
                <option [ngValue]="1">مرد</option>
                <option [ngValue]="2">زن</option>
              </select>
            </label>
            <label>
              نقش
              <select
                [(ngModel)]="userForm.roleName"
                name="dialogRole"
                (ngModelChange)="onUserRoleChange($event)"
              >
                <option value="Admin">ادمین</option>
                <option value="Consultant">مشاور</option>
                <option value="Secretary">منشی</option>
                <option value="NormalUser">کاربر عادی</option>
              </select>
            </label>
          </div>
          <label
            >نام فایل آواتار<input
              [(ngModel)]="userForm.avatarImageName"
              [ngModelOptions]="ngModelBlurOptions"
              name="dialogAvatar"
          /></label>
          <div class="switch-row">
            <label
              ><input
                [(ngModel)]="userForm.isCompleteProfile"
                name="dialogComplete"
                type="checkbox"
              />
              پروفایل کامل است</label
            >
            @if (userDialogMode === "edit") {
              <label
                ><input
                  [(ngModel)]="userForm.isActive"
                  name="dialogActive"
                  type="checkbox"
                />
                کاربر فعال است</label
              >
            }
          </div>
          <div class="dialog-actions">
            <button
              class="ghost-action"
              type="button"
              (click)="closeUserDialog()"
            >
              انصراف
            </button>
            <button class="solid-action" type="submit" [disabled]="userSaving">
              {{ userSaving ? "در حال ذخیره..." : "ذخیره" }}
            </button>
          </div>
        </form>
      </app-base-dialog>

      <app-base-dialog
        [open]="deleteDialogOpen"
        title="حذف کاربر"
        [subtitle]="
          userToDelete
            ? 'آیا از حذف ' + fullName(userToDelete) + ' مطمئن هستید؟'
            : ''
        "
        confirmText="حذف"
        cancelText="انصراف"
        [confirmDisabled]="!userToDelete"
        (confirmClick)="confirmDeleteUser()"
        (closed)="closeDeleteDialog()"
      >
        <p class="delete-copy">
          این عملیات از API حذف کاربر استفاده می‌کند و در صورت خطای منطقی پیام
          بک‌اند نمایش داده می‌شود.
        </p>
      </app-base-dialog>
    </section>
  `,
  styles: [
    `
      .dashboard-layout {
        display: grid;
        grid-template-columns: 300px minmax(0, 1fr);
        gap: 18px;
        width: min(1180px, calc(100% - 36px));
        margin: 0 auto;
        padding: 36px 0 86px;
      }
      .dashboard-sidebar,
      .dashboard-content article,
      .dashboard-hero {
        border: 1px solid var(--line);
        background: var(--surface);
        box-shadow: var(--shadow);
      }
      .dashboard-sidebar {
        position: sticky;
        top: 18px;
        display: grid;
        align-content: start;
        gap: 18px;
        align-self: start;
        padding: 20px;
        border-radius: 34px;
      }
      .dashboard-brand {
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--text);
        font-weight: 950;
      }
      .dashboard-user-card {
        display: grid;
        gap: 12px;
        padding: 18px;
        border: 1px solid var(--line);
        border-radius: 28px;
        background: linear-gradient(
          135deg,
          color-mix(in srgb, var(--brand) 12%, transparent),
          color-mix(in srgb, var(--surface-muted) 84%, transparent)
        );
      }
      .avatar {
        display: grid;
        place-items: center;
        width: 62px;
        height: 62px;
        border-radius: 24px;
        background: color-mix(in srgb, var(--brand) 18%, transparent);
        color: var(--brand);
        font-size: 1.45rem;
      }
      .dashboard-user-card small {
        display: block;
        color: var(--muted);
        font-weight: 900;
      }
      .dashboard-user-card h1 {
        margin: 4px 0;
        font-size: 1.35rem;
      }
      .dashboard-user-card b {
        color: var(--brand);
      }
      .dashboard-nav {
        display: grid;
        gap: 10px;
      }
      .dashboard-nav button {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        border: 0;
        padding: 12px 14px;
        border-radius: 18px;
        background: var(--surface-muted);
        color: var(--muted);
        font: inherit;
        font-weight: 900;
        text-align: start;
      }
      .dashboard-nav button.active {
        color: var(--text);
        background: color-mix(in srgb, var(--brand) 16%, var(--surface-muted));
      }
      .logout-btn {
        width: 100%;
        margin-top: auto;
      }
      .dashboard-content {
        display: grid;
        align-content: start;
        gap: 18px;
      }
      .dashboard-hero {
        padding: clamp(24px, 4vw, 42px);
        border-radius: 36px;
        background:
          radial-gradient(
            circle at 10% 0,
            color-mix(in srgb, var(--brand-2) 24%, transparent),
            transparent 36%
          ),
          linear-gradient(
            135deg,
            color-mix(in srgb, var(--surface) 88%, transparent),
            var(--cream)
          );
      }
      .dashboard-hero span {
        display: inline-flex;
        margin-bottom: 12px;
        padding: 6px 14px;
        border-radius: 999px;
        background: color-mix(in srgb, var(--brand) 18%, transparent);
        color: var(--brand);
        font-weight: 950;
      }
      .dashboard-hero h2 {
        margin: 0 0 10px;
        font-size: clamp(1.8rem, 4vw, 3rem);
      }
      .dashboard-hero p {
        max-width: 720px;
        margin: 0;
      }
      .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 14px;
      }
      .dashboard-content article {
        padding: 22px;
        border-radius: 30px;
      }
      .dashboard-content article span {
        display: grid;
        place-items: center;
        width: 48px;
        height: 48px;
        border-radius: 18px;
        background: color-mix(in srgb, var(--brand) 14%, transparent);
        color: var(--brand);
      }
      .dashboard-content article h3 {
        margin: 16px 0 6px;
      }
      .dashboard-content article strong {
        display: block;
        color: var(--text);
        font-size: 1.1rem;
      }
      .dashboard-content article p {
        margin: 10px 0 0;
      }
      .admin-shell {
        display: grid;
        gap: 14px;
        align-content: start;
      }
      .consultants-panel {
        gap: 14px;
      }
      .consultant-detail-panel {
        display: grid;
        gap: 14px;
      }
      .admin-hero h2 {
        font-size: clamp(1.65rem, 4vw, 2.45rem);
      }
      .feedback {
        margin: 0;
        padding: 12px 14px;
        border-radius: 20px;
        font-weight: 950;
      }
      .feedback.success {
        background: color-mix(in srgb, #22c55e 16%, var(--surface));
        color: #166534;
      }
      .feedback.error {
        background: color-mix(in srgb, var(--danger) 15%, var(--surface));
        color: #991b1b;
      }
      .admin-overview {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 14px;
      }
      .admin-overview button {
        display: grid;
        gap: 12px;
        text-align: start;
        border: 1px solid var(--line);
        border-radius: 30px;
        padding: 22px;
        background: var(--surface);
        color: var(--text);
        box-shadow: 0 18px 54px rgba(0, 0, 0, 0.18);
      }
      .admin-overview span {
        display: grid;
        place-items: center;
        width: 52px;
        height: 52px;
        border-radius: 20px;
        background: color-mix(in srgb, var(--brand) 16%, transparent);
        color: var(--brand);
        font-size: 1.25rem;
      }
      .admin-overview strong {
        font-size: 1.1rem;
      }
      .admin-overview small {
        color: var(--muted);
        font-weight: 900;
        line-height: 1.8;
      }
      .admin-panel {
        display: grid;
        gap: 16px;
        padding: 18px;
        border: 1px solid var(--line);
        border-radius: 30px;
        background: color-mix(in srgb, var(--surface) 88%, transparent);
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
      }
      .filter-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
        align-items: end;
      }
      .users-filter {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      label {
        display: grid;
        gap: 8px;
        color: var(--muted);
        font-weight: 950;
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
      .dialog-form {
        display: grid;
        gap: 14px;
      }
      .two-col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      .switch-row {
        display: grid;
        gap: 8px;
      }
      .switch-row label {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .switch-row input {
        width: auto;
      }
      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 6px;
      }
      .ghost-action,
      .solid-action {
        border: 0;
        border-radius: 999px;
        padding: 12px 18px;
        font: inherit;
        font-weight: 950;
      }
      .ghost-action {
        background: var(--surface-muted);
        color: var(--text);
      }
      .solid-action {
        background: linear-gradient(135deg, var(--brand), var(--brand-2));
        color: #1b1712;
      }
      .solid-action:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .export-action {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        min-height: 48px;
        border: 1px solid color-mix(in srgb, var(--brand) 40%, var(--line));
        border-radius: 18px;
        padding: 12px 18px;
        background: color-mix(in srgb, var(--brand) 12%, var(--surface-muted));
        color: var(--text);
        font: inherit;
        font-weight: 950;
        white-space: nowrap;
      }
      .export-action:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .export-hero {
        display: grid;
        gap: 8px;
        padding: 16px;
        border: 1px solid color-mix(in srgb, var(--brand) 28%, var(--line));
        border-radius: 22px;
        background: color-mix(in srgb, var(--brand) 8%, transparent);
      }
      .export-hero p {
        margin: 0;
        color: var(--muted);
        font-size: 0.92rem;
        font-weight: 900;
        line-height: 1.7;
      }
      .primary-export {
        width: fit-content;
        min-height: 54px;
        border: 0;
        background: linear-gradient(135deg, var(--brand), var(--brand-2));
        color: #1b1712;
      }
      .delete-copy {
        margin: 0;
        color: var(--muted);
      }
      .dashboard-mobile-header {
        display: none;
      }
      .mobile-sidebar-backdrop,
      .mobile-sidebar-close,
      .mobile-menu-btn {
        display: none;
      }
      @media (max-width: 980px) {
        .dashboard-layout {
          grid-template-columns: 1fr;
          width: min(100% - 24px, 760px);
          padding-top: 14px;
        }
        .dashboard-sidebar {
          position: relative;
          top: 0;
          min-height: 0;
        }
        .dashboard-grid,
        .admin-overview {
          grid-template-columns: 1fr;
        }
        .filter-grid,
        .users-filter {
          grid-template-columns: 1fr 1fr;
        }
      }
      @media (max-width: 760px) {
        .dashboard-mobile-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          position: sticky;
          top: 0;
          z-index: 90;
          margin-bottom: 10px;
          padding: 10px 12px;
          border: 1px solid var(--line);
          border-radius: 22px;
          background: var(--surface);
          box-shadow: 0 8px 22px rgba(93, 64, 32, 0.08);
        }
        .mobile-header-info {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        .mobile-avatar {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          border-radius: 16px;
          background: color-mix(in srgb, var(--brand) 16%, transparent);
          color: var(--brand);
          flex-shrink: 0;
        }
        .mobile-header-info strong {
          display: block;
          font-size: 0.95rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .mobile-header-info small {
          display: block;
          color: var(--muted);
          font-weight: 900;
          font-size: 0.78rem;
        }
        .mobile-logout-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
          border: 1px solid var(--line);
          border-radius: 999px;
          padding: 8px 12px;
          background: var(--surface-muted);
          color: var(--text);
          font: inherit;
          font-weight: 950;
          font-size: 0.82rem;
        }
        .dashboard-layout.admin-mode {
          width: 100%;
          padding: 10px 10px calc(24px + env(safe-area-inset-bottom, 0px));
        }
        .mobile-sidebar-backdrop {
          display: block;
          position: fixed;
          inset: 0;
          z-index: 95;
          border: 0;
          background: rgba(20, 16, 12, 0.42);
        }
        .mobile-menu-btn {
          display: inline-grid;
          place-items: center;
          width: 42px;
          height: 42px;
          border: 1px solid var(--line);
          border-radius: 16px;
          background: var(--surface-muted);
          color: var(--brand);
          flex-shrink: 0;
        }
        .dashboard-layout.admin-mode .dashboard-sidebar {
          position: fixed;
          z-index: 100;
          top: 0;
          left: 0;
          bottom: 0;
          width: min(300px, 86vw);
          margin: 0;
          padding: 18px 16px calc(18px + env(safe-area-inset-bottom, 0px));
          border-radius: 0 28px 28px 0;
          border-inline-start: 0;
          transform: translateX(-105%);
          transition: transform 0.28s ease;
          overflow-y: auto;
          box-shadow: 12px 0 32px rgba(93, 64, 32, 0.16);
        }
        .dashboard-layout.admin-mode .dashboard-sidebar.mobile-sidebar-open {
          transform: translateX(0);
        }
        .admin-mode .dashboard-brand,
        .admin-mode .dashboard-user-card {
          display: grid;
        }
        .admin-mode .logout-btn {
          display: none;
        }
        .mobile-sidebar-close {
          display: block;
          width: 100%;
          border: 1px solid var(--line);
          border-radius: 18px;
          padding: 10px 12px;
          background: var(--surface-muted);
          font: inherit;
          font-weight: 950;
        }
        .admin-mode .dashboard-nav {
          grid-template-columns: 1fr;
          gap: 8px;
        }
        .admin-mode .dashboard-nav button {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 48px;
          padding: 10px 12px;
          border-radius: 16px;
          text-align: start;
          font-size: 0.9rem;
          line-height: 1.4;
        }
        .admin-mode .dashboard-nav button span {
          display: block;
          overflow: visible;
          -webkit-line-clamp: unset;
        }
        .admin-mode .dashboard-nav app-fa-icon {
          color: var(--brand);
          font-size: 1rem;
          flex-shrink: 0;
        }
        .dashboard-content {
          padding-top: 10px;
        }
        .dashboard-layout.patient-mode {
          width: 100%;
          padding: 10px 10px calc(24px + env(safe-area-inset-bottom, 0px));
        }
        .dashboard-hero,
        .admin-panel {
          border-radius: 24px;
          background: var(--surface);
          box-shadow: 0 8px 22px rgba(93, 64, 32, 0.06);
          contain: paint;
          overflow: hidden;
        }
        .admin-panel {
          padding: 14px;
        }
        .filter-grid,
        .users-filter,
        .two-col {
          grid-template-columns: 1fr;
        }
        .dialog-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        .panel-heading {
          display: grid;
        }
        .patient-mode .dashboard-sidebar {
          display: none;
        }
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  readonly user = this.auth.user;
  activeSection: DashboardSection = "overview";

  readonly adminLinks: DashboardLink[] = [
    { id: "overview", label: "نمای کلی", icon: "dashboard" },
    { id: "users", label: "کاربران", icon: "users" },
    { id: "consultants", label: "مشاوران", icon: "doctor" },
    { id: "consultantProfile", label: "پروفایل مشاور", icon: "user" },
    { id: "leads", label: "لیدها", icon: "clipboard" },
    { id: "leadReports", label: "گزارش تماس", icon: "clipboard" },
    { id: "reservations", label: "رزروها", icon: "calendar" },
    { id: "presence", label: "وضعیت مشاوران", icon: "clock" },
  ];
  readonly regularLinks: DashboardLink[] = [
    { id: "overview", label: "نمای کلی", icon: "dashboard" },
  ];

  readonly displayName = computed(() => {
    const user = this.user();
    const name = [user?.firstName, user?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    return name || "کاربر";
  });
  readonly roleLabel = computed(() => {
    const user = this.user();
    return user ? this.auth.roleLabel(user.role, "fa") : "بیمار";
  });
  readonly dashboardTitle = computed(() => `${this.roleLabel()} کلینیک`);

  users: AdminUser[] = [];
  usersLoading = false;
  usersTotalCount = 0;
  usersTotalPages = 1;
  userFilters: UserFilters = {
    firstName: "",
    lastName: "",
    roleName: "",
    phoneNumber: "",
    gender: null,
    isActive: null,
    pageNumber: 1,
    pageSize: 10,
  };

  consultants: Consultant[] = [];
  consultantsLoading = false;
  consultantsTotalCount = 0;
  consultantsTotalPages = 1;
  consultantFilters: ConsultantFilters = {
    firstName: "",
    lastName: "",
    phoneNumber: "",
    pageNumber: 1,
    pageSize: 10,
  };

  userDialogOpen = false;
  userDialogMode: UserDialogMode = "add";
  userSaving = false;
  userFormOriginalRole = "";
  userForm: UserFormModel = this.emptyUserForm();
  selectedUserBirthDate?: Date;
  readonly birthDatePickerLabel = { fa: "تاریخ تولد", en: "Birth date" };
  readonly birthDateMinDate = this.createRelativeYearDate(-120);
  readonly birthDateMaxDate = this.createYesterday();
  deleteDialogOpen = false;
  userToDelete: AdminUser | null = null;

  selectedAttendanceConsultant: Consultant | null = null;
  selectedLeadsConsultant: Consultant | null = null;
  selectedReservationsConsultant: Consultant | null = null;
  selectedProfileConsultantId: number | null = null;
  mobileSidebarOpen = false;

  feedbackMessage = "";
  feedbackType: "success" | "error" = "success";
  exportingUsers = false;
  exportingConsultants = false;
  private usersLoadRequestId = 0;
  private consultantsLoadRequestId = 0;

  readonly userColumns: TableColumn<AdminUser>[] = [
    { key: "firstName", label: "نام کامل", value: (row) => this.fullName(row) },
    {
      key: "phoneNumber",
      label: "موبایل",
      value: (row) => row.phoneNumber || row.PhoneNumber || "-",
    },
    {
      key: "roleName",
      label: "نقش",
      value: (row) => this.roleNameLabel(row.roleName || row.RoleName || ""),
      badge: () => "info",
    },
    {
      key: "isActive",
      label: "وضعیت",
      value: (row) => (row.isActive ? "فعال" : "غیرفعال"),
      badge: (row) => (row.isActive ? "success" : "danger"),
    },
    {
      key: "lastSeenAt",
      label: "آخرین بازدید",
      value: (row) => this.formatDateTime(row.lastSeenAt ?? row.LastSeenAt),
    },
  ];

  readonly consultantColumns: TableColumn<Consultant>[] = [
    { key: "firstName", label: "نام کامل", value: (row) => this.fullName(row) },
    {
      key: "phoneNumber",
      label: "موبایل",
      value: (row) => row.phoneNumber || row.PhoneNumber || "-",
    },
    {
      key: "consultantIsOnline",
      label: "آنلاین",
      value: (row) =>
        row.consultantIsOnline || row.ConsultantIsOnline ? "بله" : "خیر",
      badge: (row) =>
        row.consultantIsOnline || row.ConsultantIsOnline ? "success" : "danger",
    },
    {
      key: "consultantIsAvailable",
      label: "حضور",
      value: (row) =>
        row.consultantIsAvailable || row.ConsultantIsAvailable
          ? "حاضر"
          : "غایب",
      badge: (row) =>
        row.consultantIsAvailable || row.ConsultantIsAvailable
          ? "success"
          : "danger",
    },
    {
      key: "lastSeenAt",
      label: "آخرین بازدید",
      value: (row) => this.formatDateTime(row.lastSeenAt ?? row.LastSeenAt),
    },
  ];

  readonly consultantActions = [
    { action: "profile", label: "پروفایل", icon: "user" },
    { action: "attendance", label: "حضور", icon: "calendar" },
    { action: "leads", label: "لیدها", icon: "clipboard" },
    { action: "reservations", label: "رزروها", icon: "calendar" },
  ];

  readonly ngModelBlurOptions = NG_MODEL_UPDATE_ON_BLUR;
  private readonly markDirty: () => void;

  constructor(
    private auth: AuthService,
    private router: Router,
    private adminApi: AdminDashboardService,
    private pushNotifications: PushNotificationService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
  ) {
    this.markDirty = createCoalescedMarkForCheck(this.cdr, () => false);
  }

  ngOnInit(): void {
    if (this.isAdmin()) {
      this.loadUsers();
      this.loadConsultants();
    }
  }

  get visibleLinks(): DashboardLink[] {
    return this.isAdmin() ? this.adminLinks : this.regularLinks;
  }

  trackDashboardLink(_: number, item: DashboardLink): DashboardSection {
    return item.id;
  }

  isAdmin(): boolean {
    return this.user()?.role === "admin";
  }

  exportUsersReport(): void {
    if (this.exportingUsers) return;

    this.exportingUsers = true;
    this.clearFeedback();
    this.markDirty();

    this.adminApi
      .exportUsersReport()
      .pipe(
        finalize(() => {
          this.exportingUsers = false;
          this.markDirty();
        }),
      )
      .subscribe({
        next: (blob) => {
          downloadBlob(blob, reportFileName("users-report"));
          this.showFeedback("گزارش کاربران دانلود شد", "success");
        },
        error: (error) =>
          this.showFeedback(
            this.errorMessage(error, "خطا در دریافت گزارش. لطفاً دوباره تلاش کنید."),
            "error",
          ),
      });
  }

  exportConsultantsReport(): void {
    if (this.exportingConsultants) return;

    this.exportingConsultants = true;
    this.clearFeedback();
    this.markDirty();

    this.adminApi
      .exportConsultantsReport()
      .pipe(
        finalize(() => {
          this.exportingConsultants = false;
          this.markDirty();
        }),
      )
      .subscribe({
        next: (blob) => {
          downloadBlob(blob, reportFileName("consultants-report"));
          this.showFeedback("گزارش مشاوران دانلود شد", "success");
        },
        error: (error) =>
          this.showFeedback(
            this.errorMessage(error, "خطا در دریافت گزارش مشاوران."),
            "error",
          ),
      });
  }

  setSection(section: DashboardSection): void {
    this.activeSection = section;
    this.closeMobileSidebar();
    this.markDirty();

    if (section === "users" && !this.users.length) this.loadUsers();
    if (section === "consultants" && !this.consultants.length)
      this.loadConsultants();
  }

  toggleMobileSidebar(): void {
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
    this.markDirty();
  }

  closeMobileSidebar(): void {
    if (!this.mobileSidebarOpen) return;
    this.mobileSidebarOpen = false;
    this.markDirty();
  }

  logout(): void {
    this.pushNotifications.resetRegisteredTokenCache();
    this.auth.logout();
    this.router.navigateByUrl("/");
  }

  applyUserFilters(): void {
    this.userFilters.pageNumber = 1;
    this.loadUsers();
  }

  changeUsersPage(page: number): void {
    this.userFilters.pageNumber = page;
    this.loadUsers();
  }

  loadUsers(): void {
    const requestId = ++this.usersLoadRequestId;
    this.usersLoading = true;
    this.clearFeedback();
    this.markDirty();

    this.adminApi
      .getUsers(this.userFilters)
      .pipe(
        finalize(() => {
          if (requestId === this.usersLoadRequestId) {
            this.usersLoading = false;
            this.markDirty();
          }
        }),
      )
      .subscribe({
        next: (response) => {
          if (requestId !== this.usersLoadRequestId) return;
          this.users = (response.items ?? []).map((user) =>
            this.normalizeUser(user),
          );
          this.usersTotalCount = response.totalCount ?? this.users.length;
          this.usersTotalPages = Math.max(
            1,
            response.totalPages ||
              Math.ceil(this.usersTotalCount / this.userFilters.pageSize),
          );
          this.markDirty();
        },
        error: (error) => {
          if (requestId !== this.usersLoadRequestId) return;
          this.showFeedback(
            this.errorMessage(error, "دریافت کاربران انجام نشد"),
            "error",
          );
          this.markDirty();
        },
      });
  }

  handleUserAction(event: TableActionClick<AdminUser>): void {
    if (event.action === "edit") {
      this.openEditUserDialog(event.row);
      return;
    }

    if (event.action === "delete") {
      this.userToDelete = event.row;
      this.deleteDialogOpen = true;
      this.markDirty();
    }
  }

  openAddUserDialog(): void {
    this.userDialogMode = "add";
    this.userForm = this.emptyUserForm();
    this.userFormOriginalRole = "";
    this.selectedUserBirthDate = undefined;
    this.userDialogOpen = true;
    this.markDirty();
  }

  openEditUserDialog(user: AdminUser): void {
    this.userDialogMode = "edit";
    this.selectedUserBirthDate = undefined;
    const roleName = user.roleName || "NormalUser";
    this.userFormOriginalRole = roleName;
    this.userForm = {
      id: user.id,
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      phoneNumber: user.phoneNumber ?? "",
      passwordHash: "",
      isCompleteProfile: Boolean(user.isCompleteProfile),
      avatarImageName: user.avatarImageName ?? null,
      gender: Number(user.gender || 1),
      birthDate: "",
      isActive: Boolean(user.isActive),
      roleName,
    };
    this.userDialogOpen = true;
    this.markDirty();
  }

  onUserRoleChange(roleName: string): void {
    if (
      this.userDialogMode === "edit" &&
      roleName !== this.userFormOriginalRole &&
      ["Consultant", "Secretary"].includes(roleName)
    ) {
      this.userForm.isCompleteProfile = false;
    }
  }

  closeUserDialog(): void {
    this.userDialogOpen = false;
    this.userSaving = false;
    this.markDirty();
  }

  setUserBirthDate(date: Date): void {
    this.selectedUserBirthDate = date;
    this.userForm.birthDate = this.toDateInputValue(date);
  }

  submitUserForm(): void {
    const validationError = this.validateUserForm();
    if (validationError) {
      this.showFeedback(validationError, "error");
      return;
    }

    this.userSaving = true;
    this.clearFeedback();

    const request =
      this.userDialogMode === "add"
        ? this.adminApi.addUser(this.buildUserPayload())
        : this.adminApi.updateUser(this.buildUserPayload());

    request
      .pipe(
        finalize(() => {
          this.userSaving = false;
          this.markDirty();
        }),
      )
      .subscribe({
      next: (response) => {
        this.closeUserDialog();
        this.showFeedback(
          response.message || "اطلاعات کاربر ذخیره شد",
          "success",
        );
        this.loadUsers();
        this.loadConsultants();
      },
      error: (error) =>
        this.showFeedback(
          this.errorMessage(error, "ذخیره کاربر انجام نشد"),
          "error",
        ),
    });
  }

  confirmDeleteUser(): void {
    if (!this.userToDelete) return;

    this.adminApi.deleteUser(this.userToDelete.id).subscribe({
      next: (response) => {
        this.closeDeleteDialog();
        this.showFeedback(response.message || "کاربر حذف شد", "success");
        this.loadUsers();
        this.loadConsultants();
      },
      error: (error) =>
        this.showFeedback(
          this.errorMessage(error, "حذف کاربر انجام نشد"),
          "error",
        ),
    });
  }

  closeDeleteDialog(): void {
    this.deleteDialogOpen = false;
    this.userToDelete = null;
    this.markDirty();
  }

  applyConsultantFilters(): void {
    this.consultantFilters.pageNumber = 1;
    this.loadConsultants();
  }

  changeConsultantsPage(page: number): void {
    this.consultantFilters.pageNumber = page;
    this.loadConsultants();
  }

  loadConsultants(): void {
    const requestId = ++this.consultantsLoadRequestId;
    this.consultantsLoading = true;
    this.clearFeedback();
    this.markDirty();

    this.adminApi
      .getConsultants(this.consultantFilters)
      .pipe(
        finalize(() => {
          if (requestId === this.consultantsLoadRequestId) {
            this.consultantsLoading = false;
            this.markDirty();
          }
        }),
      )
      .subscribe({
        next: (response) => {
          if (requestId !== this.consultantsLoadRequestId) return;
          this.consultants = (response.items ?? []).map((consultant) =>
            this.normalizeConsultant(consultant),
          );
          this.consultantsTotalCount =
            response.totalCount ?? this.consultants.length;
          this.consultantsTotalPages = Math.max(
            1,
            response.totalPages ||
              Math.ceil(
                this.consultantsTotalCount / this.consultantFilters.pageSize,
              ),
          );
          this.markDirty();
        },
        error: (error) => {
          if (requestId !== this.consultantsLoadRequestId) return;
          this.showFeedback(
            this.errorMessage(error, "دریافت مشاوران انجام نشد"),
            "error",
          );
          this.markDirty();
        },
      });
  }

  handleConsultantAction(event: TableActionClick<Consultant>): void {
    const profileId = event.row.profileId ?? event.row.ProfileId ?? 0;
    if (!profileId) {
      this.showFeedback(
        "شناسه پروفایل مشاور یافت نشد. لطفاً صفحه را بروزرسانی کنید.",
        "error",
      );
      return;
    }

    if (event.action === "profile") {
      this.selectedProfileConsultantId = profileId;
      this.selectedAttendanceConsultant = null;
      this.selectedLeadsConsultant = null;
      this.selectedReservationsConsultant = null;
      this.setSection("consultantProfile");
      return;
    }

    if (event.action === "attendance") {
      this.selectedAttendanceConsultant = event.row;
      this.selectedLeadsConsultant = null;
      this.selectedReservationsConsultant = null;
      this.markDirty();
      this.scrollToConsultantDetail();
      return;
    }

    if (event.action === "leads") {
      this.selectedLeadsConsultant = event.row;
      this.selectedAttendanceConsultant = null;
      this.selectedReservationsConsultant = null;
      this.markDirty();
      this.scrollToConsultantDetail();
      return;
    }

    if (event.action === "reservations") {
      this.selectedReservationsConsultant = event.row;
      this.selectedAttendanceConsultant = null;
      this.selectedLeadsConsultant = null;
      this.markDirty();
      this.scrollToConsultantDetail();
    }
  }

  private scrollToConsultantDetail(): void {
    queueMicrotask(() => {
      document
        .getElementById("consultant-detail-panel")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  private formatDateTime(value?: string | null): string {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("fa-IR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  fullName(user: { firstName?: string; lastName?: string }): string {
    const value = user as {
      firstName?: string;
      FirstName?: string;
      lastName?: string;
      LastName?: string;
    };
    return (
      [value.firstName || value.FirstName, value.lastName || value.LastName]
        .filter(Boolean)
        .join(" ")
        .trim() || "بدون نام"
    );
  }

  roleNameLabel(roleName: string): string {
    const labels: Record<string, string> = {
      Admin: "ادمین",
      Consultant: "مشاور",
      Secretary: "منشی",
      NormalUser: "کاربر عادی",
    };

    return labels[roleName] ?? roleName;
  }

  validateUserForm(): string | null {
    if (!this.userForm.firstName.trim()) return "نام الزامی است";
    if (this.userForm.firstName.trim().length > 100)
      return "نام نباید بیشتر از ۱۰۰ کاراکتر باشد";
    if (!this.userForm.lastName.trim()) return "نام خانوادگی الزامی است";
    if (this.userForm.lastName.trim().length > 100)
      return "نام خانوادگی نباید بیشتر از ۱۰۰ کاراکتر باشد";
    if (!/^09\d{9}$/.test(this.userForm.phoneNumber.trim()))
      return "شماره موبایل معتبر نیست";
    if (![1, 2].includes(Number(this.userForm.gender)))
      return "جنسیت معتبر نیست";
    if (!this.userForm.roleName.trim()) return "نقش الزامی است";

    if (this.userDialogMode === "add") {
      if (!this.userForm.passwordHash || this.userForm.passwordHash.length < 6)
        return "رمز عبور باید حداقل ۶ کاراکتر باشد";
      if (this.userForm.passwordHash.length > 100)
        return "رمز عبور نباید بیشتر از ۱۰۰ کاراکتر باشد";
      if (
        !this.userForm.birthDate ||
        new Date(`${this.userForm.birthDate}T00:00:00`).getTime() >= Date.now()
      ) {
        return "تاریخ تولد معتبر نیست";
      }
    }

    return null;
  }

  private buildUserPayload(): SaveUserRequest {
    const roleName = this.userForm.roleName;
    const roleChanged =
      this.userDialogMode === "edit" && roleName !== this.userFormOriginalRole;
    const requiresProfileCompletion =
      roleChanged && ["Consultant", "Secretary"].includes(roleName);

    const payload: SaveUserRequest = {
      firstName: this.userForm.firstName.trim(),
      lastName: this.userForm.lastName.trim(),
      phoneNumber: this.userForm.phoneNumber.trim(),
      isCompleteProfile: requiresProfileCompletion
        ? false
        : Boolean(this.userForm.isCompleteProfile),
      avatarImageName: this.userForm.avatarImageName?.trim() || null,
      gender: Number(this.userForm.gender),
      roleName,
    };

    if (this.userDialogMode === "add") {
      payload.passwordHash = this.userForm.passwordHash;
      payload.birthDate = `${this.userForm.birthDate}T00:00:00`;
    } else {
      payload.id = this.userForm.id;
      payload.isActive = Boolean(this.userForm.isActive);
    }

    return payload;
  }

  private emptyUserForm(): UserFormModel {
    return {
      id: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      passwordHash: "",
      isCompleteProfile: false,
      avatarImageName: null,
      gender: 1,
      birthDate: "",
      isActive: true,
      roleName: "NormalUser",
    };
  }

  private normalizeUser(user: AdminUser): AdminUser {
    return {
      ...user,
      id: user.id || user.Id || "",
      firstName: user.firstName || user.FirstName || "",
      lastName: user.lastName || user.LastName || "",
      phoneNumber: user.phoneNumber || user.PhoneNumber || "",
      roleName: user.roleName || user.RoleName || "NormalUser",
      isActive: user.isActive ?? user.IsActive ?? false,
      isCompleteProfile: user.isCompleteProfile ?? user.IsCompleteProfile,
      gender: user.gender ?? user.Gender,
      avatarImageName: user.avatarImageName ?? user.AvatarImageName ?? null,
    };
  }

  private normalizeConsultant(consultant: Consultant): Consultant {
    return {
      ...consultant,
      id: consultant.id || consultant.Id || "",
      firstName: consultant.firstName || consultant.FirstName || "",
      lastName: consultant.lastName || consultant.LastName || "",
      phoneNumber: consultant.phoneNumber || consultant.PhoneNumber || "",
      profileId: consultant.profileId ?? consultant.ProfileId ?? 0,
    };
  }

  private createYesterday(): Date {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return this.startOfDay(date);
  }

  private createRelativeYearDate(yearOffset: number): Date {
    const date = new Date();
    date.setFullYear(date.getFullYear() + yearOffset);
    return this.startOfDay(date);
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private toDateInputValue(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  private showFeedback(message: string, type: "success" | "error"): void {
    this.feedbackMessage = message;
    this.feedbackType = type;
    if (type === "success") {
      this.toast.success(message);
    } else {
      this.toast.error(message);
    }
    this.markDirty();
  }

  private clearFeedback(): void {
    this.feedbackMessage = "";
    this.markDirty();
  }

  private errorMessage(error: unknown, fallback: string): string {
    return error instanceof Error && error.message ? error.message : fallback;
  }
}
