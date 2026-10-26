 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,


  DestroyRef,


  computed,
  inject,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { RouterLink } from "@angular/router";
import { debounceTime, distinctUntilChanged, finalize, map, Subject, switchMap, throwError } from "rxjs";
import {







  SecretaryPermissionType,

  SecretaryType,

} from "../../core/admin/admin-dashboard.service";



import { AdminAttendanceTableComponent } from "../admin-dashboard/admin-attendance-table.component";
import { AdminLeadCallReportsComponent } from "../admin-dashboard/admin-lead-call-reports.component";
import { AdminDailyReservationsReportComponent } from "../admin-dashboard/admin-daily-reservations-report.component";
import { AdminLeadsTableComponent } from "../admin-dashboard/admin-leads-table.component";
import { AdminLeadsReportComponent } from "../admin-dashboard/admin-leads-report.component";
import { AdminConsultantProfileComponent } from "../admin-dashboard/admin-consultant-profile.component";
import { AdminSecretarySaleServicesComponent } from "../admin-dashboard/admin-secretary-sale-services.component";
import { AdminSecretarySalesApprovalComponent } from "../admin-dashboard/admin-secretary-sales-approval.component";
import { AdminLeadAssignmentSettingsComponent } from "../admin-dashboard/admin-lead-assignment-settings.component";
import { AdminLeadSheetsComponent } from "../admin-dashboard/admin-lead-sheets.component";
import { AdminPatientFinanceReportComponent } from "../admin-dashboard/admin-patient-finance-report.component";
import { AdminConsultantRewardsComponent } from "../admin-dashboard/admin-consultant-rewards.component";
import { AdminPatientReferralsComponent } from "../../features/patient-referrals/admin/pages/admin-patient-referrals/admin-patient-referrals.component";
import { AdminAccountingCenterComponent } from "../admin-dashboard/admin-accounting-center.component";
import { PatientReferralDashboardComponent } from "../../features/patient-referrals/patient/pages/patient-referral-dashboard/patient-referral-dashboard.component";
import { BaseDialogComponent } from "../../shared/base/base-dialog/base-dialog.component";
import { BaseDatepickerComponent } from "../../shared/base/base-datepicker/base-datepicker.component";
import {


  TableComponent,
} from "../../shared/base/table/table.component";
import { FaIconComponent } from "../../shared/ui/fa-icon/fa-icon.component";
import {
  downloadBlob,
  reportFileName,
} from "../../utils/file-download.util";
import { NG_MODEL_UPDATE_ON_BLUR } from "../../shared/forms/ng-model-options";
import { createCoalescedMarkForCheck } from "../../shared/change-detection/coalesce-mark-for-check";
import { bindDashboardMobileSidebar } from "../../shared/dashboard/dashboard-mobile-sidebar";
import { bindDashboardRouteHistory } from "../../shared/dashboard/dashboard-route-history";
import {
  createRelativeYearDateInIran,
  createYesterdayInIran,
  formatIranDateTime,
} from "../../utils/iran-datetime.util";














































const ADMIN_DASHBOARD_SECTIONS = [
  "overview",
  "users",
  "secretaries",
  "consultants",
  "consultantProfile",
  "leads",
  "leadReports",
  "leadsReport",
  "dailyReservationsReport",
  "secretarySaleServices",
  "secretarySales",
  "leadAssignmentSettings",
  "patientFinanceReport",
  "accountingCenter",
  "consultantRewards",
  "patientReferrals",
  "leadSheets",
];

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
    AdminLeadsReportComponent,
    AdminDailyReservationsReportComponent,
    AdminAttendanceTableComponent,
    AdminConsultantProfileComponent,
    AdminSecretarySaleServicesComponent,
    AdminSecretarySalesApprovalComponent,
    AdminLeadAssignmentSettingsComponent,
    AdminLeadSheetsComponent,
    AdminPatientFinanceReportComponent,
    AdminAccountingCenterComponent,
    AdminConsultantRewardsComponent,
    AdminPatientReferralsComponent,
    PatientReferralDashboardComponent,
    FaIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
})
export class DashboardComponent  {
   __init() {this.user = this.auth.user}
  __init2() {this.activeSection = "overview"}

   __init3() {this.adminLinks = [
    { id: "overview", label: "نمای کلی", icon: "dashboard" },
    { id: "users", label: "کاربران", icon: "users" },
    { id: "secretaries", label: "منشی‌ها", icon: "user" },
    { id: "consultants", label: "مشاوران", icon: "doctor" },
    { id: "consultantProfile", label: "پروفایل مشاور", icon: "user" },
    { id: "leads", label: "درخواست‌های مشاوره", icon: "clipboard" },
    { id: "leadReports", label: "گزارش تماس درخواست‌ها", icon: "clipboard" },
    { id: "leadsReport", label: "گزارش لیدها", icon: "table" },
    { id: "dailyReservationsReport", label: "رزروهای روزانه", icon: "calendar" },
    { id: "secretarySaleServices", label: "خدمات فروش منشی", icon: "list" },
    { id: "secretarySales", label: "فروش‌های منشی‌ها", icon: "wallet" },
    { id: "leadAssignmentSettings", label: "مدیریت تخصیص لیدها", icon: "clipboard" },
    { id: "leadSheets", label: "شیت‌های لید ادمین", icon: "table" },
    { id: "patientFinanceReport", label: "گزارش مالی بیماران", icon: "wallet" },
    { id: "accountingCenter", label: "حسابداری جامع", icon: "wallet" },
    { id: "consultantRewards", label: "پاداش مشاوران", icon: "wallet" },
    { id: "patientReferrals", label: "گزارش رفرال بیماران", icon: "users" },
  ]}
   __init4() {this.regularLinks = [
    { id: "overview", label: "نمای کلی", icon: "dashboard" },
    { id: "patientReferrals", label: "معرفی بیمار و کیف پول", icon: "users" },
  ]}

   __init5() {this.displayName = computed(() => {
    const user = this.user();
    const name = [_optionalChain([user, 'optionalAccess', _4 => _4.firstName]), _optionalChain([user, 'optionalAccess', _5 => _5.lastName])]
      .filter(Boolean)
      .join(" ")
      .trim();
    return name || "کاربر";
  })}
   __init6() {this.roleLabel = computed(() => {
    const user = this.user();
    return user ? this.auth.roleLabel(user.role, "fa") : "بیمار";
  })}
   __init7() {this.dashboardTitle = computed(() => `${this.roleLabel()} کلینیک`)}

  __init8() {this.users = []}
  __init9() {this.usersLoading = false}
  __init10() {this.usersTotalCount = 0}
  __init11() {this.usersTotalPages = 1}
  __init12() {this.userFilters = {
    firstName: "",
    lastName: "",
    roleName: "",
    phoneNumber: "",
    gender: null,
    isActive: null,
    pageNumber: 1,
    pageSize: 10,
  }}

  __init13() {this.secretaries = []}
  __init14() {this.secretariesLoading = false}
  __init15() {this.secretariesTotalCount = 0}
  __init16() {this.secretariesTotalPages = 1}
  __init17() {this.secretaryFilters = {
    search: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    secretaryType: null,
    pageNumber: 1,
    pageSize: 10,
  }}

  __init18() {this.consultants = []}
  __init19() {this.consultantsLoading = false}
  __init20() {this.consultantsTotalCount = 0}
  __init21() {this.consultantsTotalPages = 1}
  __init22() {this.consultantFilters = {
    firstName: "",
    lastName: "",
    phoneNumber: "",
    pageNumber: 1,
    pageSize: 10,
  }}

  __init23() {this.userDialogOpen = false}
  __init24() {this.userDialogMode = "add"}
  __init25() {this.userSaving = false}
  __init26() {this.userFormOriginalRole = ""}
  __init27() {this.userForm = this.emptyUserForm()}
   __init28() {this.secretaryTypes = SecretaryType}
   __init29() {this.secretaryDays = [
    { value: 6, label: "شنبه" }, { value: 0, label: "یکشنبه" },
    { value: 1, label: "دوشنبه" }, { value: 2, label: "سه‌شنبه" },
    { value: 3, label: "چهارشنبه" }, { value: 4, label: "پنجشنبه" },
    { value: 5, label: "جمعه" },
  ]}
   __init30() {this.secretaryPermissionOptions = [
    { value: SecretaryPermissionType.ViewReservations, label: "مشاهده رزرو" },
    { value: SecretaryPermissionType.EditReservations, label: "ویرایش رزرو" },
    { value: SecretaryPermissionType.ConfirmAttendance, label: "تایید حضور" },
    { value: SecretaryPermissionType.SecretaryAnnouncement, label: "ثبت اعلام منشی" },
    { value: SecretaryPermissionType.ViewPatients, label: "مشاهده بیمار" },
    { value: SecretaryPermissionType.CreateReservation, label: "ایجاد رزرو" },
    { value: SecretaryPermissionType.CancelReservation, label: "لغو رزرو" },
  ]}
  
   __init31() {this.birthDatePickerLabel = { fa: "تاریخ تولد", en: "Birth date" }}
   __init32() {this.birthDateMinDate = createRelativeYearDateInIran(-120)}
   __init33() {this.birthDateMaxDate = createYesterdayInIran()}
  __init34() {this.deleteDialogOpen = false}
  __init35() {this.userToDelete = null}

  __init36() {this.selectedAttendanceConsultant = null}
  __init37() {this.selectedLeadsConsultant = null}
  __init38() {this.selectedProfileConsultantId = null}
  __init39() {this.mobileSidebarOpen = false}

  __init40() {this.feedbackMessage = ""}
  __init41() {this.feedbackType = "success"}
  __init42() {this.exportingUsers = false}
  __init43() {this.exportingConsultants = false}
  __init44() {this.consultantsDailySummaryDate = ""}
  __init45() {this.consultantsTodayReservationsTotal = 0}
   __init46() {this.usersLoadRequestId = 0}
   __init47() {this.secretariesLoadRequestId = 0}
   __init48() {this.consultantsLoadRequestId = 0}
    __init49() {this.secretarySearchChanges = new Subject()}

   __init50() {this.userColumns = [
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
      value: (row) => this.formatDateTime(_nullishCoalesce(row.lastSeenAt, () => ( row.LastSeenAt))),
    },
  ]}

   __init51() {this.secretaryColumns = [
    { key: "firstName", label: "نام کامل", value: (row) => this.fullName(row) },
    { key: "phoneNumber", label: "موبایل", value: (row) => row.phoneNumber || "-" },
    {
      key: "secretaryType",
      label: "نوع منشی",
      value: (row) => this.parseSecretaryType(row.secretaryType) === SecretaryType.Assistant ? "کمکی" : "اصلی",
      badge: (row) => this.parseSecretaryType(row.secretaryType) === SecretaryType.Assistant ? "info" : "success",
    },
    {
      key: "isActive",
      label: "وضعیت",
      value: (row) => row.isActive ? "فعال" : "غیرفعال",
      badge: (row) => row.isActive ? "success" : "danger",
    },
    { key: "createdAt", label: "تاریخ ایجاد", value: (row) => this.formatDateTime(row.createdAt) },
  ]}

   __init52() {this.consultantColumns = [
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
      key: "todayReservationsCount",
      label: "رزروهای امروز",
      value: (row) => String(_nullishCoalesce(row.todayReservationsCount, () => ( 0))),
      badge: (row) =>
        (_nullishCoalesce(row.todayReservationsCount, () => ( 0))) > 0 ? "success" : "info",
    },
    {
      key: "lastSeenAt",
      label: "آخرین بازدید",
      value: (row) => this.formatDateTime(_nullishCoalesce(row.lastSeenAt, () => ( row.LastSeenAt))),
    },
  ]}

   __init53() {this.consultantActions = [
    { action: "profile", label: "پروفایل", icon: "user" },
    { action: "attendance", label: "حضور", icon: "calendar" },
    { action: "leads", label: "درخواست‌های مشاوره", icon: "clipboard" },
  ]}

   __init54() {this.ngModelBlurOptions = NG_MODEL_UPDATE_ON_BLUR}
  
    __init55() {this.destroyRef = inject(DestroyRef)}
   __init56() {this.routeQueryParamsSubscription = null}
    __init57() {this.mobileSidebar = bindDashboardMobileSidebar(
    this,
    () => this.markDirty(),
    this.destroyRef,
  )}

  constructor(
     auth,
     router,
     route,
     adminApi,
     pushNotifications,
     toast,
     cdr,
  ) {;this.auth = auth;this.router = router;this.route = route;this.adminApi = adminApi;this.pushNotifications = pushNotifications;this.toast = toast;this.cdr = cdr;DashboardComponent.prototype.__init.call(this);DashboardComponent.prototype.__init2.call(this);DashboardComponent.prototype.__init3.call(this);DashboardComponent.prototype.__init4.call(this);DashboardComponent.prototype.__init5.call(this);DashboardComponent.prototype.__init6.call(this);DashboardComponent.prototype.__init7.call(this);DashboardComponent.prototype.__init8.call(this);DashboardComponent.prototype.__init9.call(this);DashboardComponent.prototype.__init10.call(this);DashboardComponent.prototype.__init11.call(this);DashboardComponent.prototype.__init12.call(this);DashboardComponent.prototype.__init13.call(this);DashboardComponent.prototype.__init14.call(this);DashboardComponent.prototype.__init15.call(this);DashboardComponent.prototype.__init16.call(this);DashboardComponent.prototype.__init17.call(this);DashboardComponent.prototype.__init18.call(this);DashboardComponent.prototype.__init19.call(this);DashboardComponent.prototype.__init20.call(this);DashboardComponent.prototype.__init21.call(this);DashboardComponent.prototype.__init22.call(this);DashboardComponent.prototype.__init23.call(this);DashboardComponent.prototype.__init24.call(this);DashboardComponent.prototype.__init25.call(this);DashboardComponent.prototype.__init26.call(this);DashboardComponent.prototype.__init27.call(this);DashboardComponent.prototype.__init28.call(this);DashboardComponent.prototype.__init29.call(this);DashboardComponent.prototype.__init30.call(this);DashboardComponent.prototype.__init31.call(this);DashboardComponent.prototype.__init32.call(this);DashboardComponent.prototype.__init33.call(this);DashboardComponent.prototype.__init34.call(this);DashboardComponent.prototype.__init35.call(this);DashboardComponent.prototype.__init36.call(this);DashboardComponent.prototype.__init37.call(this);DashboardComponent.prototype.__init38.call(this);DashboardComponent.prototype.__init39.call(this);DashboardComponent.prototype.__init40.call(this);DashboardComponent.prototype.__init41.call(this);DashboardComponent.prototype.__init42.call(this);DashboardComponent.prototype.__init43.call(this);DashboardComponent.prototype.__init44.call(this);DashboardComponent.prototype.__init45.call(this);DashboardComponent.prototype.__init46.call(this);DashboardComponent.prototype.__init47.call(this);DashboardComponent.prototype.__init48.call(this);DashboardComponent.prototype.__init49.call(this);DashboardComponent.prototype.__init50.call(this);DashboardComponent.prototype.__init51.call(this);DashboardComponent.prototype.__init52.call(this);DashboardComponent.prototype.__init53.call(this);DashboardComponent.prototype.__init54.call(this);DashboardComponent.prototype.__init55.call(this);DashboardComponent.prototype.__init56.call(this);DashboardComponent.prototype.__init57.call(this);
    this.markDirty = createCoalescedMarkForCheck(this.cdr, () => false);
    bindDashboardRouteHistory(
      this.router,
      this.route,
      (params) => this.applySectionRouteParams(params),
      this.destroyRef,
    );
  }

  ngOnInit() {
    this.closeMobileSidebar();
    if (this.isAdmin()) {
      this.secretarySearchChanges
        .pipe(
          debounceTime(400),
          distinctUntilChanged(),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe(() => {
          this.secretaryFilters.pageNumber = 1;
          this.loadSecretaries();
        });
      this.loadUsers();
      this.loadConsultants();
      this.applySectionRouteParams(this.route.snapshot.queryParamMap);
      this.routeQueryParamsSubscription = this.route.queryParamMap.subscribe(
        (params) => this.applySectionRouteParams(params),
      );
      this.syncSectionQueryParam(this.activeSection);
    }
  }

  ngOnDestroy() {
    _optionalChain([this, 'access', _6 => _6.routeQueryParamsSubscription, 'optionalAccess', _7 => _7.unsubscribe, 'call', _8 => _8()]);
  }

  get visibleLinks() {
    return this.isAdmin() ? this.adminLinks : this.regularLinks;
  }

  trackDashboardLink(_, item) {
    return item.id;
  }

  isAdmin() {
    return _optionalChain([this, 'access', _9 => _9.user, 'call', _10 => _10(), 'optionalAccess', _11 => _11.role]) === "admin";
  }

  exportUsersReport() {
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

  exportConsultantsReport() {
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

  setSection(section) {
    if (!this.isAdmin()) {
      this.activeSection = section;
      this.markDirty();
      return;
    }

    if (section === this.activeSection) {
      this.syncSectionQueryParam(section);
      return;
    }

    this.activeSection = section;
    this.syncSectionQueryParam(section);
    this.closeMobileSidebar();
    this.markDirty();

    if (section === "users" && !this.users.length) this.loadUsers();
    if (section === "secretaries" && !this.secretaries.length) this.loadSecretaries();
    if (section === "consultants" && !this.consultants.length)
      this.loadConsultants();
  }

   syncSectionQueryParam(section) {
    const querySection = section === "overview" ? null : section;
    const currentSection = this.route.snapshot.queryParamMap.get("section");
    const currentProfileId = this.route.snapshot.queryParamMap.get("profileId");
    const nextProfileId =
      section === "consultantProfile" && this.selectedProfileConsultantId
        ? String(this.selectedProfileConsultantId)
        : null;

    if (
      (_nullishCoalesce(currentSection, () => ( null))) === querySection &&
      (_nullishCoalesce(currentProfileId, () => ( null))) === nextProfileId
    ) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { section: querySection, profileId: nextProfileId },
      queryParamsHandling: "merge",
      replaceUrl: false,
    });
  }

   activateSectionFromRoute(section) {
    if (section === this.activeSection) return;

    this.activeSection = section;
    this.closeMobileSidebar();
    this.markDirty();

    if (section === "users" && !this.users.length) this.loadUsers();
    if (section === "secretaries" && !this.secretaries.length) this.loadSecretaries();
    if (section === "consultants" && !this.consultants.length)
      this.loadConsultants();
  }

   applySectionRouteParams(params) {
    const profileIdParam = params.get("profileId");
    if (profileIdParam) {
      const parsedProfileId = Number(profileIdParam);
      if (Number.isFinite(parsedProfileId) && parsedProfileId > 0) {
        this.selectedProfileConsultantId = parsedProfileId;
      }
    } else if (params.get("section") !== "consultantProfile") {
      this.selectedProfileConsultantId = null;
    }

    const section = params.get("section") ;

    if (section && ADMIN_DASHBOARD_SECTIONS.includes(section)) {
      this.activateSectionFromRoute(section);
      return;
    }

    const initialSection = this.route.snapshot.data["initialSection"] ;
    this.activateSectionFromRoute(initialSection && ADMIN_DASHBOARD_SECTIONS.includes(initialSection) ? initialSection : "overview");
  }

  toggleMobileSidebar() {
    this.mobileSidebar.toggleMobileSidebar();
  }

  closeMobileSidebar() {
    this.mobileSidebar.closeMobileSidebar();
  }

  logout() {
    this.pushNotifications.resetRegisteredTokenCache();
    this.auth.logout();
    this.router.navigateByUrl("/");
  }

  applyUserFilters() {
    this.userFilters.pageNumber = 1;
    this.loadUsers();
  }

  changeUsersPage(page) {
    this.userFilters.pageNumber = page;
    this.loadUsers();
  }

  loadUsers() {
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
          this.users = (_nullishCoalesce(response.items, () => ( []))).map((user) =>
            this.normalizeUser(user),
          );
          this.usersTotalCount = _nullishCoalesce(response.totalCount, () => ( this.users.length));
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

  onSecretarySearchChange(value) {
    this.secretaryFilters.search = value;
    this.secretarySearchChanges.next(value.trim());
  }

  applySecretaryFilters() {
    this.secretaryFilters.pageNumber = 1;
    this.loadSecretaries();
  }

  changeSecretariesPage(page) {
    this.secretaryFilters.pageNumber = page;
    this.loadSecretaries();
  }

  loadSecretaries() {
    const requestId = ++this.secretariesLoadRequestId;
    this.secretariesLoading = true;
    this.clearFeedback();
    this.markDirty();

    this.adminApi.getSecretaries(this.secretaryFilters)
      .pipe(finalize(() => {
        if (requestId === this.secretariesLoadRequestId) {
          this.secretariesLoading = false;
          this.markDirty();
        }
      }))
      .subscribe({
        next: (response) => {
          if (requestId !== this.secretariesLoadRequestId) return;
          this.secretaries = (_nullishCoalesce(response.items, () => ( []))).map((user) => this.normalizeUser(user));
          this.secretariesTotalCount = _nullishCoalesce(response.totalCount, () => ( this.secretaries.length));
          this.secretariesTotalPages = Math.max(
            1,
            response.totalPages || Math.ceil(this.secretariesTotalCount / this.secretaryFilters.pageSize),
          );
          this.markDirty();
        },
        error: (error) => this.showFeedback(
          this.errorMessage(error, "دریافت فهرست منشی‌ها انجام نشد"),
          "error",
        ),
      });
  }

  handleSecretaryAction(event) {
    if (event.action === "edit") {
      this.openEditSecretaryDialog(event.row);
      return;
    }
    if (event.action === "delete") {
      this.userToDelete = event.row;
      this.deleteDialogOpen = true;
      this.markDirty();
    }
  }

  openAddSecretaryDialog() {
    this.openAddUserDialog();
    this.userForm.roleName = "Secretary";
  }

  openEditSecretaryDialog(user) {
    this.openEditUserDialog(user);
    this.userForm.roleName = "Secretary";
    this.userSaving = true;
    this.adminApi.getSecretarySchedule(user.id)
      .pipe(finalize(() => {
        this.userSaving = false;
        this.markDirty();
      }))
      .subscribe({
        next: (schedule) => {
          this.applySecretarySchedule(schedule);
          this.markDirty();
        },
        error: (error) => this.showFeedback(
          this.errorMessage(error, "دریافت برنامه منشی انجام نشد"),
          "error",
        ),
      });
  }

  handleUserAction(event) {
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

  openAddUserDialog() {
    this.userDialogMode = "add";
    this.userForm = this.emptyUserForm();
    this.userFormOriginalRole = "";
    this.selectedUserBirthDate = undefined;
    this.userDialogOpen = true;
    this.markDirty();
  }

  openEditUserDialog(user) {
    this.userDialogMode = "edit";
    this.selectedUserBirthDate = undefined;
    const roleName = user.roleName || "NormalUser";
    this.userFormOriginalRole = roleName;
    this.userForm = {
      id: user.id,
      firstName: _nullishCoalesce(user.firstName, () => ( "")),
      lastName: _nullishCoalesce(user.lastName, () => ( "")),
      phoneNumber: _nullishCoalesce(user.phoneNumber, () => ( "")),
      passwordHash: "",
      isCompleteProfile: Boolean(user.isCompleteProfile),
      avatarImageName: _nullishCoalesce(user.avatarImageName, () => ( null)),
      gender: Number(user.gender || 1),
      birthDate: "",
      isActive: Boolean(user.isActive),
      roleName,
      secretaryType: this.parseSecretaryType(_nullishCoalesce(user.secretaryType, () => ( user.SecretaryType))),
      secretaryAccess: this.buildSecretaryAccess(user),
    };
    this.userDialogOpen = true;
    this.markDirty();
  }

  onUserRoleChange(roleName) {
    if (
      this.userDialogMode === "edit" &&
      roleName !== this.userFormOriginalRole &&
      ["Consultant", "Secretary"].includes(roleName)
    ) {
      this.userForm.isCompleteProfile = false;
    }
  }

  toggleSecretaryPermission(day, permission, enabled) {
    const permissions = this.userForm.secretaryAccess[day].permissions;
    this.userForm.secretaryAccess[day].permissions = enabled
      ? Array.from(new Set([...permissions, permission]))
      : permissions.filter((item) => item !== permission);
  }

  hasSecretaryPermission(day, permission) {
    return this.userForm.secretaryAccess[day].permissions.includes(permission);
  }

  closeUserDialog() {
    this.userDialogOpen = false;
    this.userSaving = false;
    this.markDirty();
  }

  setUserBirthDate(date) {
    this.selectedUserBirthDate = date;
    this.userForm.birthDate = this.toDateInputValue(date);
  }

  submitUserForm() {
    const validationError = this.validateUserForm();
    if (validationError) {
      this.showFeedback(validationError, "error");
      return;
    }

    this.userSaving = true;
    this.clearFeedback();

    const createRequest = this.adminApi.addUser(this.buildUserPayload()).pipe(
      switchMap((response) => {
        if (
          this.userForm.roleName !== "Secretary" ||
          this.userForm.secretaryType !== SecretaryType.Assistant
        ) return [response];

        return this.adminApi.getSecretaries({
          phoneNumber: this.userForm.phoneNumber.trim(),
          pageNumber: 1,
          pageSize: 10,
        }).pipe(
          switchMap((result) => {
            const secretary = result.items.find((item) =>
              (item.phoneNumber || item.PhoneNumber) === this.userForm.phoneNumber.trim(),
            );
            if (!secretary) {
              return throwError(() => new Error("منشی ایجاد شد اما شناسه آن برای ثبت برنامه پیدا نشد"));
            }
            return this.adminApi.updateSecretarySchedule(
              secretary.id || secretary.Id || "",
              this.buildSecretarySchedulePayload(),
            ).pipe(map(() => response));
          }),
        );
      }),
    );
    const request =
      this.userDialogMode === "add"
        ? createRequest
        : this.adminApi.updateUser(this.buildUserPayload()).pipe(
            switchMap((response) =>
              this.userForm.roleName === "Secretary"
                ? this.adminApi.updateSecretarySchedule(
                    this.userForm.id,
                    this.buildSecretarySchedulePayload(),
                  ).pipe(map(() => response))
                : [response],
            ),
          );

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
        if (this.userForm.roleName === "Secretary") this.loadSecretaries();
        this.loadConsultants();
      },
      error: (error) =>
        this.showFeedback(
          this.errorMessage(error, "ذخیره کاربر انجام نشد"),
          "error",
        ),
    });
  }

  confirmDeleteUser() {
    if (!this.userToDelete) return;

    const userId = this.userToDelete.id || this.userToDelete.Id;
    if (!userId) {
      this.showFeedback("شناسه کاربر معتبر نیست؛ فهرست را دوباره بارگذاری کنید", "error");
      return;
    }

    this.adminApi.deleteUser(userId).subscribe({
      next: (response) => {
        this.closeDeleteDialog();
        this.showFeedback(response.message || "کاربر حذف شد", "success");
        this.loadUsers();
        this.loadSecretaries();
        this.loadConsultants();
      },
      error: (error) =>
        this.showFeedback(
          this.errorMessage(error, "حذف کاربر انجام نشد"),
          "error",
        ),
    });
  }

  closeDeleteDialog() {
    this.deleteDialogOpen = false;
    this.userToDelete = null;
    this.markDirty();
  }

  applyConsultantFilters() {
    this.consultantFilters.pageNumber = 1;
    this.loadConsultants();
  }

  changeConsultantsPage(page) {
    this.consultantFilters.pageNumber = page;
    this.loadConsultants();
  }

  loadConsultants() {
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
          this.consultantsTotalCount =
            _nullishCoalesce(response.totalCount, () => ( (_nullishCoalesce(response.items, () => ( []))).length));
          this.consultantsTotalPages = Math.max(
            1,
            response.totalPages ||
              Math.ceil(
                this.consultantsTotalCount / this.consultantFilters.pageSize,
              ),
          );
          this.loadConsultantsDailySummary(_nullishCoalesce(response.items, () => ( [])));
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

  handleConsultantAction(event) {
    const profileId = _nullishCoalesce(_nullishCoalesce(event.row.profileId, () => ( event.row.ProfileId)), () => ( 0));
    if (!profileId) {
      this.showFeedback(
        "شناسه پرونده مشاور یافت نشد. لطفاً صفحه را به‌روزرسانی کنید.",
        "error",
      );
      return;
    }

    if (event.action === "profile") {
      this.selectedProfileConsultantId = profileId;
      this.selectedAttendanceConsultant = null;
      this.selectedLeadsConsultant = null;
      this.setSection("consultantProfile");
      return;
    }

    if (event.action === "attendance") {
      this.selectedAttendanceConsultant = event.row;
      this.selectedLeadsConsultant = null;
      this.markDirty();
      this.scrollToConsultantDetail();
      return;
    }

    if (event.action === "leads") {
      this.selectedLeadsConsultant = event.row;
      this.selectedAttendanceConsultant = null;
      this.markDirty();
      this.scrollToConsultantDetail();
      return;
    }
  }

   scrollToConsultantDetail() {
    queueMicrotask(() => {
      _optionalChain([document
, 'access', _12 => _12.getElementById, 'call', _13 => _13("consultant-detail-panel")
, 'optionalAccess', _14 => _14.scrollIntoView, 'call', _15 => _15({ behavior: "smooth", block: "start" })]);
    });
  }

   formatDateTime(value) {
    return formatIranDateTime(value);
  }

   loadConsultantsDailySummary(consultants) {
    this.adminApi.getConsultantsDailySummary().subscribe({
      next: (summary) => {
        const summaryByProfileId = new Map(
          summary.items.map((item) => [
            _nullishCoalesce(_nullishCoalesce(item.consultantProfileId, () => ( item.ConsultantProfileId)), () => ( 0)),
            item,
          ]),
        );

        this.consultantsDailySummaryDate = summary.date;
        this.consultantsTodayReservationsTotal = summary.items.reduce(
          (total, item) =>
            total +
            (_nullishCoalesce(_nullishCoalesce(item.todayReservationsCount, () => ( item.TodayReservationsCount)), () => ( 0))),
          0,
        );
        this.consultants = consultants.map((consultant) => {
          const normalized = this.normalizeConsultant(consultant);
          const profileId = _nullishCoalesce(_nullishCoalesce(normalized.profileId, () => ( normalized.ProfileId)), () => ( 0));
          const stats = summaryByProfileId.get(profileId);
          return {
            ...normalized,
            todayReservationsCount:
              _nullishCoalesce(_nullishCoalesce(_optionalChain([stats, 'optionalAccess', _16 => _16.todayReservationsCount]), () => (
              _optionalChain([stats, 'optionalAccess', _17 => _17.TodayReservationsCount]))), () => (
              0)),
          };
        });
        this.markDirty();
      },
      error: () => {
        this.consultants = consultants.map((consultant) =>
          this.normalizeConsultant(consultant),
        );
        this.markDirty();
      },
    });
  }

  fullName(user) {
    const value = user 




;
    return (
      [value.firstName || value.FirstName, value.lastName || value.LastName]
        .filter(Boolean)
        .join(" ")
        .trim() || "بدون نام"
    );
  }

  roleNameLabel(roleName) {
    const labels = {
      Admin: "مدیر سیستم",
      Consultant: "مشاور",
      Secretary: "منشی",
      NormalUser: "کاربر عادی",
    };

    return _nullishCoalesce(labels[roleName], () => ( roleName));
  }

  validateUserForm() {
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

   buildUserPayload() {
    const roleName = this.userForm.roleName;
    const roleChanged =
      this.userDialogMode === "edit" && roleName !== this.userFormOriginalRole;
    const requiresProfileCompletion =
      roleChanged && ["Consultant", "Secretary"].includes(roleName);

    const payload = {
      firstName: this.userForm.firstName.trim(),
      lastName: this.userForm.lastName.trim(),
      phoneNumber: this.userForm.phoneNumber.trim(),
      isCompleteProfile: requiresProfileCompletion
        ? false
        : Boolean(this.userForm.isCompleteProfile),
      avatarImageName: _optionalChain([this, 'access', _18 => _18.userForm, 'access', _19 => _19.avatarImageName, 'optionalAccess', _20 => _20.trim, 'call', _21 => _21()]) || null,
      gender: Number(this.userForm.gender),
      roleName,
    };

    if (roleName === "Secretary") {
      payload.secretaryType = this.userForm.secretaryType;
    }

    if (this.userDialogMode === "add") {
      payload.passwordHash = this.userForm.passwordHash;
      payload.birthDate = `${this.userForm.birthDate}T00:00:00`;
    } else {
      payload.id = this.userForm.id;
      payload.isActive = Boolean(this.userForm.isActive);
    }

    return payload;
  }

   emptyUserForm() {
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
      secretaryType: SecretaryType.Main,
      secretaryAccess: this.emptySecretaryAccess(),
    };
  }

   emptySecretaryAccess() {
    return Object.fromEntries([6, 0, 1, 2, 3, 4, 5].map((value) => [value, { enabled: false, permissions: [] }])) ;
  }

   buildSecretarySchedulePayload() {
    if (this.userForm.secretaryType === SecretaryType.Main) {
      return { secretaryType: SecretaryType.Main, dayPermissions: [] };
    }

    const dayNames = {
      6: "Saturday", 0: "Sunday", 1: "Monday", 2: "Tuesday",
      3: "Wednesday", 4: "Thursday", 5: "Friday",
    };
    return {
      secretaryType: SecretaryType.Assistant,
      dayPermissions: this.secretaryDays
        .filter(({ value }) => this.userForm.secretaryAccess[value].enabled)
        .map(({ value }) => ({
          day: dayNames[value],
          permissions: this.userForm.secretaryAccess[value].permissions,
        })),
    };
  }

   applySecretarySchedule(schedule) {
    const raw = schedule 


;
    this.userForm.secretaryType = this.parseSecretaryType(
      _nullishCoalesce(schedule.secretaryType, () => ( raw.SecretaryType)),
    );
    this.userForm.secretaryAccess = this.emptySecretaryAccess();
    const dayNumbers = {
      saturday: 6, sunday: 0, monday: 1, tuesday: 2,
      wednesday: 3, thursday: 4, friday: 5,
    };
    for (const item of _nullishCoalesce(_nullishCoalesce(schedule.dayPermissions, () => ( raw.DayPermissions)), () => ( []))) {
      const normalizedItem = item 


;
      const day = dayNumbers[String(_nullishCoalesce(_nullishCoalesce(item.day, () => ( normalizedItem.Day)), () => ( ""))).toLowerCase()];
      if (day === undefined) continue;
      this.userForm.secretaryAccess[day] = {
        enabled: true,
        permissions: (_nullishCoalesce(_nullishCoalesce(item.permissions, () => ( normalizedItem.Permissions)), () => ( [])))
          .map((permission) => this.parseSecretaryPermission(permission))
          .filter((permission) => permission !== null),
      };
    }
  }

   parseSecretaryType(value) {
    return value === SecretaryType.Assistant || String(value).toLowerCase() === "assistant" || String(value) === "2"
      ? SecretaryType.Assistant : SecretaryType.Main;
  }

   parseSecretaryPermission(value) {
    const numericValue = Number(value);
    if (Number.isInteger(numericValue) && numericValue >= 1 && numericValue <= 7)
      return numericValue ;

    const permissionNames = {
      viewreservations: SecretaryPermissionType.ViewReservations,
      editreservations: SecretaryPermissionType.EditReservations,
      confirmattendance: SecretaryPermissionType.ConfirmAttendance,
      secretaryannouncement: SecretaryPermissionType.SecretaryAnnouncement,
      viewpatients: SecretaryPermissionType.ViewPatients,
      createreservation: SecretaryPermissionType.CreateReservation,
      cancelreservation: SecretaryPermissionType.CancelReservation,
    };

    return _nullishCoalesce(permissionNames[String(value).trim().toLowerCase()], () => ( null));
  }

   buildSecretaryAccess(user) {
    const access = this.emptySecretaryAccess();
    for (const schedule of _nullishCoalesce(_nullishCoalesce(user.secretaryAccessSchedules, () => ( user.SecretaryAccessSchedules)), () => ( []))) {
      const day = Number(_nullishCoalesce(schedule.dayOfWeek, () => ( (schedule ).DayOfWeek)));
      if (access[day]) access[day].enabled = Boolean(_nullishCoalesce(schedule.isActive, () => ( (schedule ).IsActive)));
    }
    for (const permission of _nullishCoalesce(_nullishCoalesce(user.secretaryAccessPermissions, () => ( user.SecretaryAccessPermissions)), () => ( []))) {
      const raw = permission ;
      const day = Number(_nullishCoalesce(permission.dayOfWeek, () => ( raw.DayOfWeek)));
      const type = Number(_nullishCoalesce(permission.permissionType, () => ( raw.PermissionType))) ;
      if (access[day] && (_nullishCoalesce(_nullishCoalesce(permission.isActive, () => ( raw.IsActive)), () => ( true)))) access[day].permissions.push(type);
    }
    return access;
  }

   normalizeUser(user) {
    return {
      ...user,
      id: user.id || user.Id || "",
      firstName: user.firstName || user.FirstName || "",
      lastName: user.lastName || user.LastName || "",
      phoneNumber: user.phoneNumber || user.PhoneNumber || "",
      roleName: user.roleName || user.RoleName || "NormalUser",
      isActive: _nullishCoalesce(_nullishCoalesce(user.isActive, () => ( user.IsActive)), () => ( false)),
      isCompleteProfile: _nullishCoalesce(user.isCompleteProfile, () => ( user.IsCompleteProfile)),
      gender: _nullishCoalesce(user.gender, () => ( user.Gender)),
      avatarImageName: _nullishCoalesce(_nullishCoalesce(user.avatarImageName, () => ( user.AvatarImageName)), () => ( null)),
    };
  }

   normalizeConsultant(consultant) {
    return {
      ...consultant,
      id: consultant.id || consultant.Id || "",
      firstName: consultant.firstName || consultant.FirstName || "",
      lastName: consultant.lastName || consultant.LastName || "",
      phoneNumber: consultant.phoneNumber || consultant.PhoneNumber || "",
      profileId: _nullishCoalesce(_nullishCoalesce(consultant.profileId, () => ( consultant.ProfileId)), () => ( 0)),
    };
  }

   createYesterday() {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return this.startOfDay(date);
  }

   createRelativeYearDate(yearOffset) {
    const date = new Date();
    date.setFullYear(date.getFullYear() + yearOffset);
    return this.startOfDay(date);
  }

   startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

   toDateInputValue(date) {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

   showFeedback(message, type) {
    this.feedbackMessage = message;
    this.feedbackType = type;
    if (type === "success") {
      this.toast.success(message);
    } else {
      this.toast.error(message);
    }
    this.markDirty();
  }

   clearFeedback() {
    this.feedbackMessage = "";
    this.markDirty();
  }

   errorMessage(error, fallback) {
    return error instanceof Error && error.message ? error.message : fallback;
  }
}
