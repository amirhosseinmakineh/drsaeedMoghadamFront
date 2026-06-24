import { CommonModule } from '@angular/common';
import { Component, OnInit, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import {
  AdminDashboardService,
  AdminUser,
  Consultant,
  ConsultantFilters,
  SaveUserRequest,
  ScoreRequest,
  UserFilters
} from '../../core/admin/admin-dashboard.service';
import { AuthService } from '../../core/auth/auth.service';
import { AdminAttendanceTableComponent } from '../admin-dashboard/admin-attendance-table.component';
import { AdminLeadsTableComponent } from '../admin-dashboard/admin-leads-table.component';
import { BaseDialogComponent } from '../../shared/base/base-dialog/base-dialog.component';
import { BaseDatepickerComponent } from '../../shared/base/base-datepicker/base-datepicker.component';
import { TableActionClick, TableColumn, TableComponent } from '../../shared/base/table/table.component';
import { FaIconComponent } from '../../shared/ui/fa-icon/fa-icon.component';

type DashboardSection = 'overview' | 'users' | 'consultants' | 'leads';
type UserDialogMode = 'add' | 'edit';

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

interface ScoreFormModel {
  reason: number;
  scoreValue: number;
  description: string;
  leadAssignmentId: number | null;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    BaseDialogComponent,
    BaseDatepickerComponent,
    TableComponent,
    AdminLeadsTableComponent,
    AdminAttendanceTableComponent,
    FaIconComponent
  ],
  template: `
    <section class="dashboard-layout" [class.admin-mode]="isAdmin()">
      <aside class="dashboard-sidebar" [class.mobile-app-nav]="isAdmin()">
        <a class="dashboard-brand" routerLink="/">
          <span class="brand-mark"><app-fa-icon name="tooth"></app-fa-icon></span>
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
            *ngFor="let item of visibleLinks"
            type="button"
            [class.active]="activeSection === item.id"
            (click)="setSection(item.id)"
          >
            <app-fa-icon [name]="item.icon"></app-fa-icon>
            <span>{{ item.label }}</span>
          </button>
        </nav>

        <button class="secondary-btn logout-btn" type="button" (click)="logout()">
          <app-fa-icon name="logout"></app-fa-icon>
          خروج از حساب کاربری
        </button>
      </aside>

      <main class="dashboard-content">
        @if (isAdmin()) {
          <section class="admin-shell">
            <header class="dashboard-hero admin-hero">
              <span>داشبورد ادمین</span>
              <h2>مدیریت کلینیک، {{ displayName() }}</h2>
              <p>
                کاربران، مشاوران، امتیازدهی، حضور و غیاب و لیدهای سیستم از همین صفحه مدیریت می‌شوند.
                خطاهای command بر اساس فیلد isSuccess بررسی می‌شوند.
              </p>
            </header>

            @if (feedbackMessage) {
              <p class="feedback" [class.error]="feedbackType === 'error'" [class.success]="feedbackType === 'success'">
                {{ feedbackMessage }}
              </p>
            }

            @if (activeSection === 'overview') {
              <section class="admin-overview">
                <button type="button" (click)="setSection('users')">
                  <span><app-fa-icon name="users"></app-fa-icon></span>
                  <strong>مدیریت کاربران</strong>
                  <small>افزودن، ویرایش، حذف و تغییر نقش کاربر</small>
                </button>
                <button type="button" (click)="setSection('consultants')">
                  <span><app-fa-icon name="doctor"></app-fa-icon></span>
                  <strong>مدیریت مشاوران</strong>
                  <small>ثبت امتیاز، مشاهده حضور و لیدهای مشاور</small>
                </button>
                <button type="button" (click)="setSection('leads')">
                  <span><app-fa-icon name="clipboard"></app-fa-icon></span>
                  <strong>مدیریت لیدهای سیستم</strong>
                  <small>لیست کامل لیدها همراه فیلتر وضعیت و نوع</small>
                </button>
              </section>
            }

            @if (activeSection === 'users') {
              <section class="admin-panel">
                <header class="panel-heading">
                  <div>
                    <span>کاربران</span>
                    <h2>مدیریت کاربران سیستم</h2>
                    <p>برای ساخت مشاور، کاربر را با نقش Consultant ثبت کنید.</p>
                  </div>
                </header>

                <form class="filter-grid users-filter" (ngSubmit)="applyUserFilters()">
                  <label>نام<input [(ngModel)]="userFilters.firstName" name="userFirstName" placeholder="جستجوی نام" /></label>
                  <label>نام خانوادگی<input [(ngModel)]="userFilters.lastName" name="userLastName" placeholder="جستجوی نام خانوادگی" /></label>
                  <label>موبایل<input [(ngModel)]="userFilters.phoneNumber" name="userPhone" inputmode="tel" placeholder="09123456789" /></label>
                  <label>
                    نقش
                    <select [(ngModel)]="userFilters.roleName" name="userRole">
                      <option value="">همه نقش‌ها</option>
                      <option value="Admin">ادمین</option>
                      <option value="Consultant">مشاور</option>
                      <option value="NormalUser">کاربر عادی</option>
                    </select>
                  </label>
                  <label>
                    جنسیت
                    <select [(ngModel)]="userFilters.gender" name="userGender">
                      <option [ngValue]="null">همه</option>
                      <option [ngValue]="1">مرد</option>
                      <option [ngValue]="2">زن</option>
                    </select>
                  </label>
                  <label>
                    وضعیت
                    <select [(ngModel)]="userFilters.isActive" name="userActive">
                      <option [ngValue]="null">همه</option>
                      <option [ngValue]="true">فعال</option>
                      <option [ngValue]="false">غیرفعال</option>
                    </select>
                  </label>
                  <button class="primary-filter" type="submit">اعمال فیلتر</button>
                </form>

                <app-base-table
                  title="لیست کاربران"
                  subtitle="Add / Update / Delete از اکشن‌های پیش‌فرض BaseTable هستند."
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

            @if (activeSection === 'consultants') {
              <section class="admin-panel">
                <header class="panel-heading">
                  <div>
                    <span>مشاوران</span>
                    <h2>مدیریت مشاوران</h2>
                    <p>افزودن و ویرایش مستقیم مشاور وجود ندارد؛ این کار از مدیریت کاربران و نقش Consultant انجام می‌شود.</p>
                  </div>
                </header>

                <form class="filter-grid" (ngSubmit)="applyConsultantFilters()">
                  <label>نام<input [(ngModel)]="consultantFilters.firstName" name="consultantFirstName" placeholder="جستجوی نام" /></label>
                  <label>نام خانوادگی<input [(ngModel)]="consultantFilters.lastName" name="consultantLastName" placeholder="جستجوی نام خانوادگی" /></label>
                  <label>موبایل<input [(ngModel)]="consultantFilters.phoneNumber" name="consultantPhone" inputmode="tel" placeholder="شماره دقیق" /></label>
                  <button class="primary-filter" type="submit">اعمال فیلتر</button>
                </form>

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
              </section>

              @if (selectedAttendanceConsultant) {
                <app-admin-attendance-table
                  [consultantProfileId]="selectedAttendanceConsultant.profileId"
                  [title]="'حضور و غیاب ' + fullName(selectedAttendanceConsultant)"
                ></app-admin-attendance-table>
              }

              @if (selectedLeadsConsultant) {
                <app-admin-leads-table
                  mode="consultant"
                  [profileId]="selectedLeadsConsultant.profileId"
                  [title]="'لیدهای ' + fullName(selectedLeadsConsultant)"
                  description="لیدهای مرتبط با مشاور انتخاب‌شده"
                ></app-admin-leads-table>
              }
            }

            @if (activeSection === 'leads') {
              <app-admin-leads-table
                mode="system"
                title="مدیریت کامل لیدهای سیستم"
                description="مشاهده همه لیدهای سیستم همراه فیلتر وضعیت و نوع تخصیص"
              ></app-admin-leads-table>
            }
          </section>
        } @else {
          <div class="dashboard-hero">
            <span>{{ roleLabel() }}</span>
            <h2>{{ displayName() }}</h2>
            <p>
              خوش آمدید. این داشبورد بر اساس نقش حساب شما نمایش داده شده و دسترسی‌های بعدی هر نقش از همین بخش توسعه داده می‌شود.
            </p>
          </div>

          <div class="dashboard-grid">
            <article>
              <span><app-fa-icon name="shield"></app-fa-icon></span>
              <h3>نقش حساب</h3>
              <strong>{{ roleLabel() }}</strong>
              <p>مسیر فعلی با guard نقش کنترل می‌شود و کاربر نقش دیگر به داشبورد خودش هدایت می‌شود.</p>
            </article>

            <article>
              <span><app-fa-icon name="user"></app-fa-icon></span>
              <h3>نام کاربر</h3>
              <strong>{{ displayName() }}</strong>
              <p>نام و نام خانوادگی از توکن ورود خوانده می‌شود و در هدر سایت هم نمایش داده می‌شود.</p>
            </article>

            <article>
              <span><app-fa-icon name="dashboard"></app-fa-icon></span>
              <h3>فضای اختصاصی</h3>
              <strong>{{ dashboardTitle() }}</strong>
              <p>سایدبار داشبورد مستقل از هدر اصلی سایت است؛ فوتر عمومی در انتهای صفحه حفظ شده است.</p>
            </article>
          </div>
        }
      </main>

      <app-base-dialog
        [open]="userDialogOpen"
        [showFooter]="false"
        [title]="userDialogMode === 'add' ? 'افزودن کاربر' : 'ویرایش کاربر'"
        subtitle="اطلاعات کاربر را طبق قرارداد API وارد کنید."
        (closed)="closeUserDialog()"
      >
        <form class="dialog-form" (ngSubmit)="submitUserForm()">
          <div class="two-col">
            <label>نام<input [(ngModel)]="userForm.firstName" name="dialogFirstName" maxlength="100" /></label>
            <label>نام خانوادگی<input [(ngModel)]="userForm.lastName" name="dialogLastName" maxlength="100" /></label>
          </div>
          <label>شماره موبایل<input [(ngModel)]="userForm.phoneNumber" name="dialogPhone" inputmode="tel" placeholder="09123456789" /></label>
          @if (userDialogMode === 'add') {
            <div class="two-col">
              <label>رمز عبور<input [(ngModel)]="userForm.passwordHash" name="dialogPassword" type="password" minlength="6" maxlength="100" /></label>
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
              <select [(ngModel)]="userForm.gender" name="dialogGender">
                <option [ngValue]="1">مرد</option>
                <option [ngValue]="2">زن</option>
              </select>
            </label>
            <label>
              نقش
              <select [(ngModel)]="userForm.roleName" name="dialogRole">
                <option value="Admin">ادمین</option>
                <option value="Consultant">مشاور</option>
                <option value="NormalUser">کاربر عادی</option>
              </select>
            </label>
          </div>
          <label>نام فایل آواتار<input [(ngModel)]="userForm.avatarImageName" name="dialogAvatar" placeholder="اختیاری" /></label>
          <div class="switch-row">
            <label><input [(ngModel)]="userForm.isCompleteProfile" name="dialogComplete" type="checkbox" /> پروفایل کامل است</label>
            @if (userDialogMode === 'edit') {
              <label><input [(ngModel)]="userForm.isActive" name="dialogActive" type="checkbox" /> کاربر فعال است</label>
            }
          </div>
          <div class="dialog-actions">
            <button class="ghost-action" type="button" (click)="closeUserDialog()">انصراف</button>
            <button class="solid-action" type="submit" [disabled]="userSaving">{{ userSaving ? 'در حال ذخیره...' : 'ذخیره' }}</button>
          </div>
        </form>
      </app-base-dialog>

      <app-base-dialog
        [open]="scoreDialogOpen"
        [showFooter]="false"
        [title]="selectedScoreConsultant ? 'ثبت امتیاز برای ' + fullName(selectedScoreConsultant) : 'ثبت امتیاز'"
        subtitle="برای پاداش مقدار امتیاز مثبت و برای جریمه مقدار منفی ثبت کنید."
        (closed)="closeScoreDialog()"
      >
        <form class="dialog-form" (ngSubmit)="submitScoreForm()">
          <label>
            نوع امتیاز
            <select [(ngModel)]="scoreForm.reason" name="scoreReason" (ngModelChange)="syncScoreSign()">
              <option [ngValue]="5">پاداش مدیر</option>
              <option [ngValue]="6">جریمه مدیر</option>
            </select>
          </label>
          <div class="two-col">
            <label>مقدار امتیاز<input [(ngModel)]="scoreForm.scoreValue" name="scoreValue" type="number" /></label>
            <label>شناسه لید مرتبط<input [(ngModel)]="scoreForm.leadAssignmentId" name="scoreLeadId" type="number" placeholder="اختیاری" /></label>
          </div>
          <label>توضیح<textarea [(ngModel)]="scoreForm.description" name="scoreDescription" rows="3"></textarea></label>
          <div class="dialog-actions">
            <button class="ghost-action" type="button" (click)="closeScoreDialog()">انصراف</button>
            <button class="solid-action" type="submit" [disabled]="scoreSaving">{{ scoreSaving ? 'در حال ثبت...' : 'ثبت امتیاز' }}</button>
          </div>
        </form>
      </app-base-dialog>

      <app-base-dialog
        [open]="deleteDialogOpen"
        title="حذف کاربر"
        [subtitle]="userToDelete ? 'آیا از حذف ' + fullName(userToDelete) + ' مطمئن هستید؟' : ''"
        confirmText="حذف"
        cancelText="انصراف"
        (confirmClick)="confirmDeleteUser()"
        (closed)="closeDeleteDialog()"
      >
        <p class="delete-copy">این عملیات از API حذف کاربر استفاده می‌کند و در صورت خطای منطقی پیام بک‌اند نمایش داده می‌شود.</p>
      </app-base-dialog>
    </section>
  `,
  styles: [`
    .dashboard-layout{display:grid;grid-template-columns:300px minmax(0,1fr);gap:18px;width:min(1180px,calc(100% - 36px));margin:0 auto;padding:36px 0 86px}
    .dashboard-sidebar,.dashboard-content article,.dashboard-hero{border:1px solid var(--line);background:color-mix(in srgb,var(--surface) 86%,transparent);box-shadow:var(--shadow);backdrop-filter:blur(18px)}
    .dashboard-sidebar{position:sticky;top:18px;display:grid;align-content:start;gap:18px;min-height:calc(100vh - 72px);padding:20px;border-radius:34px}
    .dashboard-brand{display:flex;align-items:center;gap:10px;color:var(--text);font-weight:950}
    .dashboard-user-card{display:grid;gap:12px;padding:18px;border:1px solid var(--line);border-radius:28px;background:linear-gradient(135deg,color-mix(in srgb,var(--brand) 12%,transparent),color-mix(in srgb,var(--surface-muted) 84%,transparent))}
    .avatar{display:grid;place-items:center;width:62px;height:62px;border-radius:24px;background:color-mix(in srgb,var(--brand) 18%,transparent);color:var(--brand);font-size:1.45rem}
    .dashboard-user-card small{display:block;color:var(--muted);font-weight:900}.dashboard-user-card h1{margin:4px 0;font-size:1.35rem}.dashboard-user-card b{color:var(--brand)}
    .dashboard-nav{display:grid;gap:10px}.dashboard-nav button{display:flex;align-items:center;gap:10px;width:100%;border:0;padding:12px 14px;border-radius:18px;background:var(--surface-muted);color:var(--muted);font:inherit;font-weight:900;text-align:start}.dashboard-nav button.active{color:var(--text);background:color-mix(in srgb,var(--brand) 16%,var(--surface-muted))}
    .logout-btn{width:100%;margin-top:auto}
    .dashboard-content{display:grid;align-content:start;gap:18px}.dashboard-hero{padding:clamp(24px,4vw,42px);border-radius:36px;background:radial-gradient(circle at 10% 0,color-mix(in srgb,var(--brand-2) 24%,transparent),transparent 36%),linear-gradient(135deg,color-mix(in srgb,var(--surface) 88%,transparent),var(--cream))}
    .dashboard-hero span{display:inline-flex;margin-bottom:12px;padding:6px 14px;border-radius:999px;background:color-mix(in srgb,var(--brand) 18%,transparent);color:var(--brand);font-weight:950}.dashboard-hero h2{margin:0 0 10px;font-size:clamp(1.8rem,4vw,3rem)}.dashboard-hero p{max-width:720px;margin:0}
    .dashboard-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.dashboard-content article{padding:22px;border-radius:30px}.dashboard-content article span{display:grid;place-items:center;width:48px;height:48px;border-radius:18px;background:color-mix(in srgb,var(--brand) 14%,transparent);color:var(--brand)}.dashboard-content article h3{margin:16px 0 6px}.dashboard-content article strong{display:block;color:var(--text);font-size:1.1rem}.dashboard-content article p{margin:10px 0 0}
    .admin-shell{display:grid;gap:18px}.admin-hero h2{font-size:clamp(1.65rem,4vw,2.45rem)}
    .feedback{margin:0;padding:12px 14px;border-radius:20px;font-weight:950}.feedback.success{background:color-mix(in srgb,#22c55e 16%,transparent);color:#bbf7d0}.feedback.error{background:color-mix(in srgb,var(--danger) 15%,transparent);color:#fecaca}
    .admin-overview{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.admin-overview button{display:grid;gap:12px;text-align:start;border:1px solid var(--line);border-radius:30px;padding:22px;background:color-mix(in srgb,var(--surface) 86%,transparent);color:var(--text);box-shadow:0 18px 54px rgba(0,0,0,.18)}.admin-overview span{display:grid;place-items:center;width:52px;height:52px;border-radius:20px;background:color-mix(in srgb,var(--brand) 16%,transparent);color:var(--brand);font-size:1.25rem}.admin-overview strong{font-size:1.1rem}.admin-overview small{color:var(--muted);font-weight:900;line-height:1.8}
    .admin-panel{display:grid;gap:16px;padding:18px;border:1px solid var(--line);border-radius:30px;background:color-mix(in srgb,var(--surface) 88%,transparent);box-shadow:var(--shadow)}
    .panel-heading{display:flex;justify-content:space-between;gap:12px}.panel-heading span{display:inline-flex;margin-bottom:8px;padding:5px 12px;border-radius:999px;background:color-mix(in srgb,var(--brand) 14%,transparent);color:var(--brand);font-weight:950}.panel-heading h2{margin:0;font-size:1.35rem}.panel-heading p{margin:8px 0 0;color:var(--muted)}
    .filter-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;align-items:end}.users-filter{grid-template-columns:repeat(3,minmax(0,1fr))}
    label{display:grid;gap:8px;color:var(--muted);font-weight:950}.primary-filter{min-height:50px;border:0;border-radius:18px;background:linear-gradient(135deg,var(--brand),var(--brand-2));color:#1b1712;font:inherit;font-weight:950}
    .dialog-form{display:grid;gap:14px}.two-col{display:grid;grid-template-columns:1fr 1fr;gap:10px}.switch-row{display:grid;gap:8px}.switch-row label{display:flex;align-items:center;gap:8px}.switch-row input{width:auto}.dialog-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:6px}.ghost-action,.solid-action{border:0;border-radius:999px;padding:12px 18px;font:inherit;font-weight:950}.ghost-action{background:var(--surface-muted);color:var(--text)}.solid-action{background:linear-gradient(135deg,var(--brand),var(--brand-2));color:#1b1712}.solid-action:disabled{opacity:.6;cursor:not-allowed}.delete-copy{margin:0;color:var(--muted)}
    @media (max-width: 980px){.dashboard-layout{grid-template-columns:1fr;width:min(100% - 24px,760px);padding-top:14px}.dashboard-sidebar{position:relative;top:0;min-height:0}.dashboard-grid,.admin-overview{grid-template-columns:1fr}.filter-grid,.users-filter{grid-template-columns:1fr 1fr}}
    @media (max-width: 760px){
      .dashboard-layout.admin-mode{width:100%;padding:0 10px 96px}.dashboard-layout.admin-mode .dashboard-sidebar{position:fixed;z-index:80;inset-inline:10px;bottom:10px;top:auto;min-height:0;padding:8px;border-radius:28px}.admin-mode .dashboard-brand,.admin-mode .dashboard-user-card,.admin-mode .logout-btn{display:none}.admin-mode .dashboard-nav{grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}.admin-mode .dashboard-nav button{display:grid;place-items:center;gap:3px;min-height:58px;padding:7px;border-radius:20px;text-align:center;font-size:.72rem}.admin-mode .dashboard-nav app-fa-icon{font-size:1.1rem;color:var(--brand)}
      .dashboard-content{padding-top:10px}.dashboard-hero,.admin-panel{border-radius:24px}.admin-panel{padding:14px}.filter-grid,.users-filter,.two-col{grid-template-columns:1fr}.dialog-actions{display:grid;grid-template-columns:1fr 1fr}.panel-heading{display:grid}
    }
  `]
})
export class DashboardComponent implements OnInit {
  readonly user = this.auth.user;
  activeSection: DashboardSection = 'overview';

  readonly adminLinks: DashboardLink[] = [
    { id: 'overview', label: 'نمای کلی', icon: 'dashboard' },
    { id: 'users', label: 'کاربران', icon: 'users' },
    { id: 'consultants', label: 'مشاوران', icon: 'doctor' },
    { id: 'leads', label: 'لیدها', icon: 'clipboard' }
  ];
  readonly regularLinks: DashboardLink[] = [
    { id: 'overview', label: 'نمای کلی', icon: 'dashboard' }
  ];

  readonly displayName = computed(() => {
    const user = this.user();
    const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
    return name || 'کاربر';
  });
  readonly roleLabel = computed(() => {
    const user = this.user();
    return user ? this.auth.roleLabel(user.role, 'fa') : 'بیمار';
  });
  readonly dashboardTitle = computed(() => `${this.roleLabel()} کلینیک`);

  users: AdminUser[] = [];
  usersLoading = false;
  usersTotalCount = 0;
  usersTotalPages = 1;
  userFilters: UserFilters = {
    firstName: '',
    lastName: '',
    roleName: '',
    phoneNumber: '',
    gender: null,
    isActive: null,
    pageNumber: 1,
    pageSize: 10
  };

  consultants: Consultant[] = [];
  consultantsLoading = false;
  consultantsTotalCount = 0;
  consultantsTotalPages = 1;
  consultantFilters: ConsultantFilters = {
    firstName: '',
    lastName: '',
    phoneNumber: '',
    pageNumber: 1,
    pageSize: 10
  };

  userDialogOpen = false;
  userDialogMode: UserDialogMode = 'add';
  userSaving = false;
  userForm: UserFormModel = this.emptyUserForm();
  selectedUserBirthDate?: Date;
  readonly birthDatePickerLabel = { fa: 'تاریخ تولد', en: 'Birth date' };
  readonly birthDateMinDate = this.createRelativeYearDate(-120);
  readonly birthDateMaxDate = this.createYesterday();
  deleteDialogOpen = false;
  userToDelete: AdminUser | null = null;

  scoreDialogOpen = false;
  scoreSaving = false;
  selectedScoreConsultant: Consultant | null = null;
  selectedAttendanceConsultant: Consultant | null = null;
  selectedLeadsConsultant: Consultant | null = null;
  scoreForm: ScoreFormModel = this.emptyScoreForm();

  feedbackMessage = '';
  feedbackType: 'success' | 'error' = 'success';

  readonly userColumns: TableColumn<AdminUser>[] = [
    { key: 'firstName', label: 'نام کامل', value: row => this.fullName(row) },
    { key: 'phoneNumber', label: 'موبایل', value: row => row.phoneNumber || row.PhoneNumber || '-' },
    { key: 'roleName', label: 'نقش', value: row => this.roleNameLabel(row.roleName || row.RoleName || ''), badge: () => 'info' },
    { key: 'isActive', label: 'وضعیت', value: row => row.isActive ? 'فعال' : 'غیرفعال', badge: row => row.isActive ? 'success' : 'danger' }
  ];

  readonly consultantColumns: TableColumn<Consultant>[] = [
    { key: 'firstName', label: 'نام کامل', value: row => this.fullName(row) },
    { key: 'phoneNumber', label: 'موبایل', value: row => row.phoneNumber || row.PhoneNumber || '-' },
    { key: 'profileId', label: 'شناسه پروفایل', value: row => row.profileId ?? row.ProfileId ?? '-', badge: () => 'info' }
  ];

  readonly consultantActions = [
    { action: 'score', label: 'ثبت امتیاز', icon: 'award', tone: 'primary' as const },
    { action: 'attendance', label: 'حضور', icon: 'calendar' },
    { action: 'leads', label: 'لیدها', icon: 'clipboard' }
  ];

  constructor(private auth: AuthService, private router: Router, private adminApi: AdminDashboardService) {}

  ngOnInit(): void {
    if (this.isAdmin()) {
      this.loadUsers();
      this.loadConsultants();
    }
  }

  get visibleLinks(): DashboardLink[] {
    return this.isAdmin() ? this.adminLinks : this.regularLinks;
  }

  isAdmin(): boolean {
    return this.user()?.role === 'admin';
  }

  setSection(section: DashboardSection): void {
    this.activeSection = section;

    if (section === 'users' && !this.users.length) this.loadUsers();
    if (section === 'consultants' && !this.consultants.length) this.loadConsultants();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/');
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
    this.usersLoading = true;
    this.clearFeedback();

    this.adminApi.getUsers(this.userFilters)
      .pipe(finalize(() => this.usersLoading = false))
      .subscribe({
        next: response => {
          this.users = (response.items ?? []).map(user => this.normalizeUser(user));
          this.usersTotalCount = response.totalCount ?? this.users.length;
          this.usersTotalPages = Math.max(1, response.totalPages || Math.ceil(this.usersTotalCount / this.userFilters.pageSize));
        },
        error: error => this.showFeedback(this.errorMessage(error, 'دریافت کاربران انجام نشد'), 'error')
      });
  }

  handleUserAction(event: TableActionClick<AdminUser>): void {
    if (event.action === 'edit') {
      this.openEditUserDialog(event.row);
      return;
    }

    if (event.action === 'delete') {
      this.userToDelete = event.row;
      this.deleteDialogOpen = true;
    }
  }

  openAddUserDialog(): void {
    this.userDialogMode = 'add';
    this.userForm = this.emptyUserForm();
    this.selectedUserBirthDate = undefined;
    this.userDialogOpen = true;
  }

  openEditUserDialog(user: AdminUser): void {
    this.userDialogMode = 'edit';
    this.selectedUserBirthDate = undefined;
    this.userForm = {
      id: user.id,
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      phoneNumber: user.phoneNumber ?? '',
      passwordHash: '',
      isCompleteProfile: Boolean(user.isCompleteProfile),
      avatarImageName: user.avatarImageName ?? null,
      gender: Number(user.gender || 1),
      birthDate: '',
      isActive: Boolean(user.isActive),
      roleName: user.roleName || 'NormalUser'
    };
    this.userDialogOpen = true;
  }

  closeUserDialog(): void {
    this.userDialogOpen = false;
    this.userSaving = false;
  }

  setUserBirthDate(date: Date): void {
    this.selectedUserBirthDate = date;
    this.userForm.birthDate = this.toDateInputValue(date);
  }

  submitUserForm(): void {
    const validationError = this.validateUserForm();
    if (validationError) {
      this.showFeedback(validationError, 'error');
      return;
    }

    this.userSaving = true;
    this.clearFeedback();

    const request = this.userDialogMode === 'add'
      ? this.adminApi.addUser(this.buildUserPayload())
      : this.adminApi.updateUser(this.buildUserPayload());

    request.pipe(finalize(() => this.userSaving = false)).subscribe({
      next: response => {
        this.closeUserDialog();
        this.showFeedback(response.message || 'اطلاعات کاربر ذخیره شد', 'success');
        this.loadUsers();
        this.loadConsultants();
      },
      error: error => this.showFeedback(this.errorMessage(error, 'ذخیره کاربر انجام نشد'), 'error')
    });
  }

  confirmDeleteUser(): void {
    if (!this.userToDelete) return;

    this.adminApi.deleteUser(this.userToDelete.id).subscribe({
      next: response => {
        this.closeDeleteDialog();
        this.showFeedback(response.message || 'کاربر حذف شد', 'success');
        this.loadUsers();
        this.loadConsultants();
      },
      error: error => this.showFeedback(this.errorMessage(error, 'حذف کاربر انجام نشد'), 'error')
    });
  }

  closeDeleteDialog(): void {
    this.deleteDialogOpen = false;
    this.userToDelete = null;
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
    this.consultantsLoading = true;
    this.clearFeedback();

    this.adminApi.getConsultants(this.consultantFilters)
      .pipe(finalize(() => this.consultantsLoading = false))
      .subscribe({
        next: response => {
          this.consultants = (response.items ?? []).map(consultant => this.normalizeConsultant(consultant));
          this.consultantsTotalCount = response.totalCount ?? this.consultants.length;
          this.consultantsTotalPages = Math.max(1, response.totalPages || Math.ceil(this.consultantsTotalCount / this.consultantFilters.pageSize));
        },
        error: error => this.showFeedback(this.errorMessage(error, 'دریافت مشاوران انجام نشد'), 'error')
      });
  }

  handleConsultantAction(event: TableActionClick<Consultant>): void {
    if (event.action === 'score') {
      this.selectedScoreConsultant = event.row;
      this.scoreForm = this.emptyScoreForm();
      this.scoreDialogOpen = true;
      return;
    }

    if (event.action === 'attendance') {
      this.selectedAttendanceConsultant = event.row;
      this.selectedLeadsConsultant = null;
      return;
    }

    if (event.action === 'leads') {
      this.selectedLeadsConsultant = event.row;
      this.selectedAttendanceConsultant = null;
    }
  }

  closeScoreDialog(): void {
    this.scoreDialogOpen = false;
    this.scoreSaving = false;
    this.selectedScoreConsultant = null;
  }

  syncScoreSign(): void {
    const rawValue = Math.abs(Number(this.scoreForm.scoreValue || 0)) || 10;
    this.scoreForm.scoreValue = this.scoreForm.reason === 6 ? -rawValue : rawValue;
  }

  submitScoreForm(): void {
    if (!this.selectedScoreConsultant?.profileId) {
      this.showFeedback('شناسه پروفایل مشاور یافت نشد', 'error');
      return;
    }

    const scoreValue = Number(this.scoreForm.scoreValue);
    if (this.scoreForm.reason === 5 && scoreValue <= 0) {
      this.showFeedback('امتیاز تشویقی مدیر باید مثبت باشد', 'error');
      return;
    }

    if (this.scoreForm.reason === 6 && scoreValue >= 0) {
      this.showFeedback('امتیاز جریمه مدیر باید منفی باشد', 'error');
      return;
    }

    this.scoreSaving = true;
    this.clearFeedback();

    const payload: ScoreRequest = {
      consultantProfileId: this.selectedScoreConsultant.profileId,
      source: 2,
      reason: Number(this.scoreForm.reason),
      scoreValue,
      description: this.scoreForm.description.trim() || null,
      leadAssignmentId: this.scoreForm.leadAssignmentId ? Number(this.scoreForm.leadAssignmentId) : null,
      createdByUserId: this.user()?.userId ?? null
    };

    this.adminApi.createScore(payload)
      .pipe(finalize(() => this.scoreSaving = false))
      .subscribe({
        next: response => {
          this.closeScoreDialog();
          this.showFeedback(response.message || 'امتیاز با موفقیت ثبت شد', 'success');
        },
        error: error => this.showFeedback(this.errorMessage(error, 'ثبت امتیاز انجام نشد'), 'error')
      });
  }

  fullName(user: { firstName?: string; lastName?: string }): string {
    const value = user as { firstName?: string; FirstName?: string; lastName?: string; LastName?: string };
    return [value.firstName || value.FirstName, value.lastName || value.LastName].filter(Boolean).join(' ').trim() || 'بدون نام';
  }

  roleNameLabel(roleName: string): string {
    const labels: Record<string, string> = {
      Admin: 'ادمین',
      Consultant: 'مشاور',
      NormalUser: 'کاربر عادی'
    };

    return labels[roleName] ?? roleName;
  }

  private validateUserForm(): string | null {
    if (!this.userForm.firstName.trim()) return 'نام الزامی است';
    if (this.userForm.firstName.trim().length > 100) return 'نام نباید بیشتر از ۱۰۰ کاراکتر باشد';
    if (!this.userForm.lastName.trim()) return 'نام خانوادگی الزامی است';
    if (this.userForm.lastName.trim().length > 100) return 'نام خانوادگی نباید بیشتر از ۱۰۰ کاراکتر باشد';
    if (!/^09\d{9}$/.test(this.userForm.phoneNumber.trim())) return 'شماره موبایل معتبر نیست';
    if (![1, 2].includes(Number(this.userForm.gender))) return 'جنسیت معتبر نیست';
    if (!this.userForm.roleName.trim()) return 'نقش الزامی است';

    if (this.userDialogMode === 'add') {
      if (!this.userForm.passwordHash || this.userForm.passwordHash.length < 6) return 'رمز عبور باید حداقل ۶ کاراکتر باشد';
      if (this.userForm.passwordHash.length > 100) return 'رمز عبور نباید بیشتر از ۱۰۰ کاراکتر باشد';
      if (!this.userForm.birthDate || new Date(`${this.userForm.birthDate}T00:00:00`).getTime() >= Date.now()) {
        return 'تاریخ تولد معتبر نیست';
      }
    }

    return null;
  }

  private buildUserPayload(): SaveUserRequest {
    const payload: SaveUserRequest = {
      firstName: this.userForm.firstName.trim(),
      lastName: this.userForm.lastName.trim(),
      phoneNumber: this.userForm.phoneNumber.trim(),
      isCompleteProfile: Boolean(this.userForm.isCompleteProfile),
      avatarImageName: this.userForm.avatarImageName?.trim() || null,
      gender: Number(this.userForm.gender),
      roleName: this.userForm.roleName
    };

    if (this.userDialogMode === 'add') {
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
      id: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      passwordHash: '',
      isCompleteProfile: false,
      avatarImageName: null,
      gender: 1,
      birthDate: '',
      isActive: true,
      roleName: 'NormalUser'
    };
  }

  private normalizeUser(user: AdminUser): AdminUser {
    return {
      ...user,
      id: user.id || user.Id || '',
      firstName: user.firstName || user.FirstName || '',
      lastName: user.lastName || user.LastName || '',
      phoneNumber: user.phoneNumber || user.PhoneNumber || '',
      roleName: user.roleName || user.RoleName || 'NormalUser',
      isActive: user.isActive ?? user.IsActive ?? false,
      isCompleteProfile: user.isCompleteProfile ?? user.IsCompleteProfile,
      gender: user.gender ?? user.Gender,
      avatarImageName: user.avatarImageName ?? user.AvatarImageName ?? null
    };
  }

  private normalizeConsultant(consultant: Consultant): Consultant {
    return {
      ...consultant,
      id: consultant.id || consultant.Id || '',
      firstName: consultant.firstName || consultant.FirstName || '',
      lastName: consultant.lastName || consultant.LastName || '',
      phoneNumber: consultant.phoneNumber || consultant.PhoneNumber || '',
      profileId: consultant.profileId ?? consultant.ProfileId ?? 0
    };
  }

  private emptyScoreForm(): ScoreFormModel {
    return {
      reason: 5,
      scoreValue: 10,
      description: '',
      leadAssignmentId: null
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
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private showFeedback(message: string, type: 'success' | 'error'): void {
    this.feedbackMessage = message;
    this.feedbackType = type;
  }

  private clearFeedback(): void {
    this.feedbackMessage = '';
  }

  private errorMessage(error: unknown, fallback: string): string {
    return error instanceof Error && error.message ? error.message : fallback;
  }
}
