import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  computed,
  inject,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, ParamMap, Router, RouterLink } from "@angular/router";
import { debounceTime, distinctUntilChanged, finalize, map, Subject, Subscription, switchMap, throwError } from "rxjs";
import {
  AdminDashboardService,
  AdminUser,
  Consultant,
  ConsultantDailySummaryItem,
  ConsultantFilters,
  SaveUserRequest,
  SecretaryFilters,
  SecretaryPermissionType,
  SecretarySchedule,
  SecretaryType,
  UserFilters,
} from "../../core/admin/admin-dashboard.service";
import { AuthService } from "../../core/auth/auth.service";
import { PushNotificationService } from "../../core/push/push-notification.service";
import { ToastService } from "../../core/toast/toast.service";
import { AdminAttendanceTableComponent } from "../admin-dashboard/admin-attendance-table.component";
import { AdminLeadCallReportsComponent } from "../admin-dashboard/admin-lead-call-reports.component";
import { AdminDailyReservationsReportComponent } from "../admin-dashboard/admin-daily-reservations-report.component";
import { AdminLeadsTableComponent } from "../admin-dashboard/admin-leads-table.component";
import { AdminLeadsReportComponent } from "../admin-dashboard/admin-leads-report.component";
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
import { bindDashboardMobileSidebar } from "../../shared/dashboard/dashboard-mobile-sidebar";
import { bindDashboardRouteHistory } from "../../shared/dashboard/dashboard-route-history";
import {
  createRelativeYearDateInIran,
  createYesterdayInIran,
  formatIranDateTime,
} from "../../utils/iran-datetime.util";

type DashboardSection =
  | "overview"
  | "users"
  | "secretaries"
  | "consultants"
  | "consultantProfile"
  | "leads"
  | "leadReports"
  | "leadsReport"
  | "dailyReservationsReport";
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
  secretaryType: SecretaryType;
  secretaryAccess: Record<number, { enabled: boolean; permissions: SecretaryPermissionType[] }>;
}

interface SecretaryDayOption { value: number; label: string }
interface SecretaryPermissionOption { value: SecretaryPermissionType; label: string }

const ADMIN_DASHBOARD_SECTIONS: DashboardSection[] = [
  "overview",
  "users",
  "secretaries",
  "consultants",
  "consultantProfile",
  "leads",
  "leadReports",
  "leadsReport",
  "dailyReservationsReport",
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
    FaIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
})
export class DashboardComponent implements OnInit, OnDestroy {
  readonly user = this.auth.user;
  activeSection: DashboardSection = "overview";

  readonly adminLinks: DashboardLink[] = [
    { id: "overview", label: "نمای کلی", icon: "dashboard" },
    { id: "users", label: "کاربران", icon: "users" },
    { id: "secretaries", label: "منشی‌ها", icon: "user" },
    { id: "consultants", label: "مشاوران", icon: "doctor" },
    { id: "consultantProfile", label: "پروفایل مشاور", icon: "user" },
    { id: "leads", label: "درخواست‌های مشاوره", icon: "clipboard" },
    { id: "leadReports", label: "گزارش تماس درخواست‌ها", icon: "clipboard" },
    { id: "leadsReport", label: "گزارش لیدها", icon: "table" },
    { id: "dailyReservationsReport", label: "رزروهای روزانه", icon: "calendar" },
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

  secretaries: AdminUser[] = [];
  secretariesLoading = false;
  secretariesTotalCount = 0;
  secretariesTotalPages = 1;
  secretaryFilters: SecretaryFilters = {
    search: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    secretaryType: null,
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
  readonly secretaryTypes = SecretaryType;
  readonly secretaryDays: SecretaryDayOption[] = [
    { value: 6, label: "شنبه" }, { value: 0, label: "یکشنبه" },
    { value: 1, label: "دوشنبه" }, { value: 2, label: "سه‌شنبه" },
    { value: 3, label: "چهارشنبه" }, { value: 4, label: "پنجشنبه" },
    { value: 5, label: "جمعه" },
  ];
  readonly secretaryPermissionOptions: SecretaryPermissionOption[] = [
    { value: SecretaryPermissionType.ViewReservations, label: "مشاهده رزرو" },
    { value: SecretaryPermissionType.EditReservations, label: "ویرایش رزرو" },
    { value: SecretaryPermissionType.ConfirmAttendance, label: "تایید حضور" },
    { value: SecretaryPermissionType.SecretaryAnnouncement, label: "ثبت اعلام منشی" },
    { value: SecretaryPermissionType.ViewPatients, label: "مشاهده بیمار" },
    { value: SecretaryPermissionType.CreateReservation, label: "ایجاد رزرو" },
    { value: SecretaryPermissionType.CancelReservation, label: "لغو رزرو" },
  ];
  selectedUserBirthDate?: Date;
  readonly birthDatePickerLabel = { fa: "تاریخ تولد", en: "Birth date" };
  readonly birthDateMinDate = createRelativeYearDateInIran(-120);
  readonly birthDateMaxDate = createYesterdayInIran();
  deleteDialogOpen = false;
  userToDelete: AdminUser | null = null;

  selectedAttendanceConsultant: Consultant | null = null;
  selectedLeadsConsultant: Consultant | null = null;
  selectedProfileConsultantId: number | null = null;
  mobileSidebarOpen = false;

  feedbackMessage = "";
  feedbackType: "success" | "error" = "success";
  exportingUsers = false;
  exportingConsultants = false;
  consultantsDailySummaryDate = "";
  consultantsTodayReservationsTotal = 0;
  private usersLoadRequestId = 0;
  private secretariesLoadRequestId = 0;
  private consultantsLoadRequestId = 0;
  private readonly secretarySearchChanges = new Subject<string>();

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

  readonly secretaryColumns: TableColumn<AdminUser>[] = [
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
      key: "todayReservationsCount",
      label: "رزروهای امروز",
      value: (row) => String(row.todayReservationsCount ?? 0),
      badge: (row) =>
        (row.todayReservationsCount ?? 0) > 0 ? "success" : "info",
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
    { action: "leads", label: "درخواست‌های مشاوره", icon: "clipboard" },
  ];

  readonly ngModelBlurOptions = NG_MODEL_UPDATE_ON_BLUR;
  private readonly markDirty: () => void;
  private readonly destroyRef = inject(DestroyRef);
  private routeQueryParamsSubscription: Subscription | null = null;
  private readonly mobileSidebar = bindDashboardMobileSidebar(
    this,
    () => this.markDirty(),
    this.destroyRef,
  );

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private adminApi: AdminDashboardService,
    private pushNotifications: PushNotificationService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
  ) {
    this.markDirty = createCoalescedMarkForCheck(this.cdr, () => false);
    bindDashboardRouteHistory(
      this.router,
      this.route,
      (params) => this.applySectionRouteParams(params),
      this.destroyRef,
    );
  }

  ngOnInit(): void {
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

  ngOnDestroy(): void {
    this.routeQueryParamsSubscription?.unsubscribe();
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

  private syncSectionQueryParam(section: DashboardSection): void {
    const querySection = section === "overview" ? null : section;
    const currentSection = this.route.snapshot.queryParamMap.get("section");
    const currentProfileId = this.route.snapshot.queryParamMap.get("profileId");
    const nextProfileId =
      section === "consultantProfile" && this.selectedProfileConsultantId
        ? String(this.selectedProfileConsultantId)
        : null;

    if (
      (currentSection ?? null) === querySection &&
      (currentProfileId ?? null) === nextProfileId
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

  private activateSectionFromRoute(section: DashboardSection): void {
    if (section === this.activeSection) return;

    this.activeSection = section;
    this.closeMobileSidebar();
    this.markDirty();

    if (section === "users" && !this.users.length) this.loadUsers();
    if (section === "secretaries" && !this.secretaries.length) this.loadSecretaries();
    if (section === "consultants" && !this.consultants.length)
      this.loadConsultants();
  }

  private applySectionRouteParams(params: ParamMap): void {
    const profileIdParam = params.get("profileId");
    if (profileIdParam) {
      const parsedProfileId = Number(profileIdParam);
      if (Number.isFinite(parsedProfileId) && parsedProfileId > 0) {
        this.selectedProfileConsultantId = parsedProfileId;
      }
    } else if (params.get("section") !== "consultantProfile") {
      this.selectedProfileConsultantId = null;
    }

    const section = params.get("section") as DashboardSection | null;

    if (section && ADMIN_DASHBOARD_SECTIONS.includes(section)) {
      this.activateSectionFromRoute(section);
      return;
    }

    this.activateSectionFromRoute("overview");
  }

  toggleMobileSidebar(): void {
    this.mobileSidebar.toggleMobileSidebar();
  }

  closeMobileSidebar(): void {
    this.mobileSidebar.closeMobileSidebar();
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

  onSecretarySearchChange(value: string): void {
    this.secretaryFilters.search = value;
    this.secretarySearchChanges.next(value.trim());
  }

  applySecretaryFilters(): void {
    this.secretaryFilters.pageNumber = 1;
    this.loadSecretaries();
  }

  changeSecretariesPage(page: number): void {
    this.secretaryFilters.pageNumber = page;
    this.loadSecretaries();
  }

  loadSecretaries(): void {
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
          this.secretaries = (response.items ?? []).map((user) => this.normalizeUser(user));
          this.secretariesTotalCount = response.totalCount ?? this.secretaries.length;
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

  handleSecretaryAction(event: TableActionClick<AdminUser>): void {
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

  openAddSecretaryDialog(): void {
    this.openAddUserDialog();
    this.userForm.roleName = "Secretary";
  }

  openEditSecretaryDialog(user: AdminUser): void {
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
      secretaryType: this.parseSecretaryType(user.secretaryType ?? user.SecretaryType),
      secretaryAccess: this.buildSecretaryAccess(user),
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

  toggleSecretaryPermission(day: number, permission: SecretaryPermissionType, enabled: boolean): void {
    const permissions = this.userForm.secretaryAccess[day].permissions;
    this.userForm.secretaryAccess[day].permissions = enabled
      ? Array.from(new Set([...permissions, permission]))
      : permissions.filter((item) => item !== permission);
  }

  hasSecretaryPermission(day: number, permission: SecretaryPermissionType): boolean {
    return this.userForm.secretaryAccess[day].permissions.includes(permission);
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

  confirmDeleteUser(): void {
    if (!this.userToDelete) return;

    this.adminApi.deleteUser(this.userToDelete.id).subscribe({
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
          this.consultantsTotalCount =
            response.totalCount ?? (response.items ?? []).length;
          this.consultantsTotalPages = Math.max(
            1,
            response.totalPages ||
              Math.ceil(
                this.consultantsTotalCount / this.consultantFilters.pageSize,
              ),
          );
          this.loadConsultantsDailySummary(response.items ?? []);
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

  private scrollToConsultantDetail(): void {
    queueMicrotask(() => {
      document
        .getElementById("consultant-detail-panel")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  private formatDateTime(value?: string | null): string {
    return formatIranDateTime(value);
  }

  private loadConsultantsDailySummary(consultants: Consultant[]): void {
    this.adminApi.getConsultantsDailySummary().subscribe({
      next: (summary) => {
        const summaryByProfileId = new Map<number, ConsultantDailySummaryItem>(
          summary.items.map((item) => [
            item.consultantProfileId ?? item.ConsultantProfileId ?? 0,
            item,
          ]),
        );

        this.consultantsDailySummaryDate = summary.date;
        this.consultantsTodayReservationsTotal = summary.items.reduce(
          (total, item) =>
            total +
            (item.todayReservationsCount ?? item.TodayReservationsCount ?? 0),
          0,
        );
        this.consultants = consultants.map((consultant) => {
          const normalized = this.normalizeConsultant(consultant);
          const profileId = normalized.profileId ?? normalized.ProfileId ?? 0;
          const stats = summaryByProfileId.get(profileId);
          return {
            ...normalized,
            todayReservationsCount:
              stats?.todayReservationsCount ??
              stats?.TodayReservationsCount ??
              0,
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
      Admin: "مدیر سیستم",
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
      secretaryType: SecretaryType.Main,
      secretaryAccess: this.emptySecretaryAccess(),
    };
  }

  private emptySecretaryAccess(): UserFormModel["secretaryAccess"] {
    return Object.fromEntries([6, 0, 1, 2, 3, 4, 5].map((value) => [value, { enabled: false, permissions: [] }])) as UserFormModel["secretaryAccess"];
  }

  private buildSecretarySchedulePayload(): SecretarySchedule {
    if (this.userForm.secretaryType === SecretaryType.Main) {
      return { secretaryType: SecretaryType.Main, dayPermissions: [] };
    }

    const dayNames: Record<number, string> = {
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

  private applySecretarySchedule(schedule: SecretarySchedule): void {
    const raw = schedule as SecretarySchedule & {
      SecretaryType?: SecretaryType;
      DayPermissions?: Array<{ Day?: string; Permissions?: SecretaryPermissionType[] }>;
    };
    this.userForm.secretaryType = this.parseSecretaryType(
      schedule.secretaryType ?? raw.SecretaryType,
    );
    this.userForm.secretaryAccess = this.emptySecretaryAccess();
    const dayNumbers: Record<string, number> = {
      saturday: 6, sunday: 0, monday: 1, tuesday: 2,
      wednesday: 3, thursday: 4, friday: 5,
    };
    for (const item of schedule.dayPermissions ?? raw.DayPermissions ?? []) {
      const normalizedItem = item as typeof item & {
        Day?: string;
        Permissions?: SecretaryPermissionType[];
      };
      const day = dayNumbers[String(item.day ?? normalizedItem.Day ?? "").toLowerCase()];
      if (day === undefined) continue;
      this.userForm.secretaryAccess[day] = {
        enabled: true,
        permissions: (item.permissions ?? normalizedItem.Permissions ?? []).map(Number) as SecretaryPermissionType[],
      };
    }
  }

  private parseSecretaryType(value: number | string | null | undefined): SecretaryType {
    return value === SecretaryType.Assistant || String(value).toLowerCase() === "assistant" || String(value) === "2"
      ? SecretaryType.Assistant : SecretaryType.Main;
  }

  private buildSecretaryAccess(user: AdminUser): UserFormModel["secretaryAccess"] {
    const access = this.emptySecretaryAccess();
    for (const schedule of user.secretaryAccessSchedules ?? user.SecretaryAccessSchedules ?? []) {
      const day = Number(schedule.dayOfWeek ?? (schedule as unknown as { DayOfWeek: number }).DayOfWeek);
      if (access[day]) access[day].enabled = Boolean(schedule.isActive ?? (schedule as unknown as { IsActive: boolean }).IsActive);
    }
    for (const permission of user.secretaryAccessPermissions ?? user.SecretaryAccessPermissions ?? []) {
      const raw = permission as unknown as { DayOfWeek?: number; PermissionType?: SecretaryPermissionType; IsActive?: boolean };
      const day = Number(permission.dayOfWeek ?? raw.DayOfWeek);
      const type = Number(permission.permissionType ?? raw.PermissionType) as SecretaryPermissionType;
      if (access[day] && (permission.isActive ?? raw.IsActive ?? true)) access[day].permissions.push(type);
    }
    return access;
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
