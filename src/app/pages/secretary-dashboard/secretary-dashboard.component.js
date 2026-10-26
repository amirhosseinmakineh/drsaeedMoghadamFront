 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,


  DestroyRef,


  computed,
  inject,
} from "@angular/core";
import { RouterLink } from "@angular/router";



import { createCoalescedMarkForCheck } from "../../shared/change-detection/coalesce-mark-for-check";
import { bindDashboardMobileSidebar } from "../../shared/dashboard/dashboard-mobile-sidebar";
import { bindDashboardRouteHistory } from "../../shared/dashboard/dashboard-route-history";

import { FaIconComponent } from "../../shared/ui/fa-icon/fa-icon.component";
import { SecretaryReservationsComponent } from "./secretary-reservations.component";
import { SecretaryReservationRequestsComponent } from "./secretary-reservation-requests.component";
import { SecretaryPatientReferralsComponent } from "../../features/patient-referrals/secretary/pages/secretary-patient-referrals/secretary-patient-referrals.component";
import {

  SecretaryOverviewComponent,
} from "./secretary-overview.component";













const SECRETARY_DASHBOARD_SECTIONS = [
  "overview",
  "reservations",
  "reviews",
  "patientReferrals",
];

@Component({
  selector: "app-secretary-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FaIconComponent,
    SecretaryReservationsComponent,
    SecretaryReservationRequestsComponent,
    SecretaryOverviewComponent,
    SecretaryPatientReferralsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./secretary-dashboard.component.html",
  styleUrl: "./secretary-dashboard.component.scss",
})
export class SecretaryDashboardComponent  {
   __init() {this.user = this.auth.user}
  __init2() {this.activeSection = "overview"}
  __init3() {this.mobileSidebarOpen = false}
  __init4() {this.accountingMenuOpen = false}

   __init5() {this.dashboardLinks = [
    { id: "overview", label: "نمای کلی", icon: "dashboard" },
    { id: "reservations", label: "رزروها", icon: "calendar" },
    { id: "reviews", label: "تایید حضور", icon: "check" },
    { id: "patientReferrals", label: "بیماران معرفی‌شده", icon: "users" },
  ]}

   __init6() {this.displayName = computed(() => {
    const user = this.user();
    const name = [_optionalChain([user, 'optionalAccess', _4 => _4.firstName]), _optionalChain([user, 'optionalAccess', _5 => _5.lastName])]
      .filter(Boolean)
      .join(" ")
      .trim();
    return name || "کاربر";
  })}

   __init7() {this.roleLabel = computed(() => {
    const user = this.user();
    return user ? this.auth.roleLabel(user.role, "fa") : "منشی";
  })}

  __init8() {this.feedbackMessage = ""}
  __init9() {this.feedbackType = "success"}
  __init10() {this.reservationPreset = null}
  __init11() {this.accessLoading = true}
  __init12() {this.access = null}

  
    __init13() {this.destroyRef = inject(DestroyRef)}
   __init14() {this.routeQueryParamsSubscription = null}
    __init15() {this.mobileSidebar = bindDashboardMobileSidebar(
    this,
    () => this.markDirty(),
    this.destroyRef,
  )}

  constructor(
     auth,
     router,
     route,
     secretaryApi,
     pushNotifications,
     cdr,
  ) {;this.auth = auth;this.router = router;this.route = route;this.secretaryApi = secretaryApi;this.pushNotifications = pushNotifications;this.cdr = cdr;SecretaryDashboardComponent.prototype.__init.call(this);SecretaryDashboardComponent.prototype.__init2.call(this);SecretaryDashboardComponent.prototype.__init3.call(this);SecretaryDashboardComponent.prototype.__init4.call(this);SecretaryDashboardComponent.prototype.__init5.call(this);SecretaryDashboardComponent.prototype.__init6.call(this);SecretaryDashboardComponent.prototype.__init7.call(this);SecretaryDashboardComponent.prototype.__init8.call(this);SecretaryDashboardComponent.prototype.__init9.call(this);SecretaryDashboardComponent.prototype.__init10.call(this);SecretaryDashboardComponent.prototype.__init11.call(this);SecretaryDashboardComponent.prototype.__init12.call(this);SecretaryDashboardComponent.prototype.__init13.call(this);SecretaryDashboardComponent.prototype.__init14.call(this);SecretaryDashboardComponent.prototype.__init15.call(this);
    this.markDirty = createCoalescedMarkForCheck(this.cdr, () => false);
    bindDashboardRouteHistory(
      this.router,
      this.route,
      (params) => this.applySectionRouteParams(params),
      this.destroyRef,
    );
  }

  get visibleDashboardLinks() {
    return this.dashboardLinks.filter((item) => {
      if (item.id === "reviews") return this.hasPermission("ConfirmAttendance");
      return this.hasPermission("ViewReservations");
    });
  }

  ngOnInit() {
    this.closeMobileSidebar();
    this.applySectionRouteParams(this.route.snapshot.queryParamMap);
    this.routeQueryParamsSubscription = this.route.queryParamMap.subscribe(
      (params) => this.applySectionRouteParams(params),
    );
    this.syncSectionQueryParam(this.activeSection);
    this.secretaryApi.getAccess().subscribe({
      next: (access) => {
        this.access = access;
        this.accessLoading = false;
        if (!this.visibleDashboardLinks.some((item) => item.id === this.activeSection)) {
          this.setSection(_nullishCoalesce(_optionalChain([this, 'access', _6 => _6.visibleDashboardLinks, 'access', _7 => _7[0], 'optionalAccess', _8 => _8.id]), () => ( "overview")));
        }
        this.markDirty();
      },
      error: () => {
        this.accessLoading = false;
        this.feedbackType = "error";
        this.feedbackMessage = "دریافت سطح دسترسی منشی انجام نشد. دوباره تلاش کنید.";
        this.markDirty();
      },
    });
  }

  hasPermission(permission) {
    if (_optionalChain([this, 'access', _9 => _9.access, 'optionalAccess', _10 => _10.hasFullAccess])) return true;
    if (!this.access && _optionalChain([this, 'access', _11 => _11.user, 'call', _12 => _12(), 'optionalAccess', _13 => _13.secretaryType, 'optionalAccess', _14 => _14.toLowerCase, 'call', _15 => _15()]) === "main") return true;
    return _nullishCoalesce(_nullishCoalesce(_optionalChain([this, 'access', _16 => _16.access, 'optionalAccess', _17 => _17.permissions, 'access', _18 => _18.includes, 'call', _19 => _19(permission)]), () => (
      _optionalChain([this, 'access', _20 => _20.user, 'call', _21 => _21(), 'optionalAccess', _22 => _22.secretaryPermissions, 'optionalAccess', _23 => _23.includes, 'call', _24 => _24(permission)]))), () => ( false));
  }

  ngOnDestroy() {
    _optionalChain([this, 'access', _25 => _25.routeQueryParamsSubscription, 'optionalAccess', _26 => _26.unsubscribe, 'call', _27 => _27()]);
  }

  setSection(section) {
    const resolvedSection = this.resolveSection(section);
    if (resolvedSection === this.activeSection) {
      this.syncSectionQueryParam(resolvedSection);
      return;
    }

    this.activeSection = resolvedSection;
    this.syncSectionQueryParam(resolvedSection);
    this.closeMobileSidebar();
    this.markDirty();
  }

  openDashboardList(preset) {
    this.reservationPreset = preset;
    this.setSection("reservations");
  }

   resolveSection(
    section,
  ) {
    if (section === "reviews" && !this.hasPermission("ConfirmAttendance")) return "overview";
    if ((section === "overview" || section === "reservations") && !this.hasPermission("ViewReservations")) {
      return this.hasPermission("ConfirmAttendance") ? "reviews" : "overview";
    }

    return section;
  }

   syncSectionQueryParam(section) {
    const resolvedSection = this.resolveSection(section);
    const querySection =
      resolvedSection === "overview" ? null : resolvedSection;
    const currentSection = this.route.snapshot.queryParamMap.get("section");

    if ((_nullishCoalesce(currentSection, () => ( null))) === querySection) return;

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { section: querySection },
      queryParamsHandling: "merge",
      replaceUrl: false,
    });
  }

   activateSectionFromRoute(section) {
    const resolvedSection = this.resolveSection(section);
    if (resolvedSection === this.activeSection) return;

    this.activeSection = resolvedSection;
    this.closeMobileSidebar();
    this.markDirty();
  }

   applySectionRouteParams(params) {
    const section = params.get("section") ;

    if (section && SECRETARY_DASHBOARD_SECTIONS.includes(section)) {
      this.activateSectionFromRoute(section);
      return;
    }

    const initialSection = this.route.snapshot.data["initialSection"] ;
    this.activateSectionFromRoute(initialSection && SECRETARY_DASHBOARD_SECTIONS.includes(initialSection) ? initialSection : "overview");
  }

  toggleMobileSidebar() {
    this.mobileSidebar.toggleMobileSidebar();
  }

  closeMobileSidebar() {
    this.mobileSidebar.closeMobileSidebar();
  }

  trackDashboardLink(
    _,
    item,
  ) {
    return item.id;
  }

  logout() {
    this.pushNotifications.resetRegisteredTokenCache();
    this.auth.logout();
    this.router.navigateByUrl("/");
  }

}
