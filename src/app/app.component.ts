import { DOCUMENT, isPlatformBrowser, NgFor, NgIf } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Injector, OnDestroy, OnInit, PLATFORM_ID, signal } from "@angular/core";
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { filter, Subscription } from "rxjs";
import { AuthDialogComponent } from "./auth/auth-dialog.component";
import { AuthService, AuthUser } from "./core/auth/auth.service";
import { PushNotificationService } from "./core/push/push-notification.service";
import { RealtimeLeadAlertComponent } from "./shared/ui/realtime-lead-alert/realtime-lead-alert.component";
import { LanguageCode, NAV_ITEMS, pickText } from "./models/clinic.model";
import { FaIconComponent } from "./shared/ui/fa-icon/fa-icon.component";
import { ToastContainerComponent } from "./shared/ui/toast-container/toast-container.component";
import { ReservationsRealtimeService } from "./core/reservation/reservations-realtime.service";
import { AppUpdateService } from "./core/update/app-update.service";
import { SeoService } from "./core/seo/seo.service";
import { AnalyticsService } from "./core/analytics/analytics.service";

interface LanguageAwarePage {
  setLanguage?: (language: LanguageCode) => void;
}

@Component({
  selector: "app-root",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgFor,
    NgIf,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    AuthDialogComponent,
    FaIconComponent,
    ToastContainerComponent,
    RealtimeLeadAlertComponent,
  ],
  templateUrl: "./app.component.html"
})
export class AppComponent implements OnInit, OnDestroy {
  navItems = NAV_ITEMS;
  language = signal<LanguageCode>(
    this.readSetting<LanguageCode>("language", "fa"),
  );
  authOpen = signal(false);
  mobileAccountOpen = signal(false);
  user = this.auth.user;
  activePage: LanguageAwarePage | null = null;
  protected readonly pickText = pickText;

  private readonly openAuthFromPage = (): void => this.authOpen.set(true);
  private routerSubscription: Subscription | null = null;
  private readonly isBrowser: boolean;

  constructor(
    private router: Router,
    public auth: AuthService,
    private injector: Injector,
    private seo: SeoService,
    private analytics: AnalyticsService,
    private cdr: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  private get pushNotifications(): PushNotificationService {
    return this.injector.get(PushNotificationService);
  }

  get direction(): "rtl" | "ltr" {
    return this.language() === "fa" ? "rtl" : "ltr";
  }

  showAuthActions(): boolean {
    return !this.isDashboardRoute();
  }

  isDashboardRoute(): boolean {
    const url = this.router.url.split("?")[0];
    return (
      url.startsWith("/dashboard") ||
      url.startsWith("/select-dashboard") ||
      url.startsWith("/secretary/") ||
      url.startsWith("/consultant/")
    );
  }

  displayName(user: AuthUser): string {
    const name = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    return name || (this.language() === "fa" ? "کاربر" : "User");
  }

  dashboardUrl(): string {
    if (this.auth.needsRoleSelection()) {
      return this.auth.roleSelectionUrl();
    }

    return this.auth.dashboardUrl();
  }

  logout(): void {
    this.pushNotifications.resetRegisteredTokenCache();
    this.auth.logout();
    this.mobileAccountOpen.set(false);
    if (this.isDashboardRoute()) {
      this.router.navigateByUrl("/");
    }
  }

  ngOnInit(): void {
    this.applyDocumentState();
    if (this.isBrowser) {
      this.injector.get(AppUpdateService).start();
      this.analytics.startClickTracking();
      this.injector.get(ReservationsRealtimeService).start();
      const user = this.auth.user();
      if (user?.role === "consultant") {
        void this.pushNotifications.registerForConsultantOnLogin();
      } else {
        void this.pushNotifications.syncForCurrentProfile();
      }
      window.addEventListener("open-auth-dialog", this.openAuthFromPage);
    }
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.applyRouteTheme();
        this.seo.applyForUrl(this.router.url, this.language());
        this.cdr.markForCheck();
      });
    this.applyRouteTheme();
    this.seo.applyForUrl(this.router.url, this.language());
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      window.removeEventListener("open-auth-dialog", this.openAuthFromPage);
    }
    this.routerSubscription?.unsubscribe();
  }

  onActivate(component: object): void {
    this.activePage = component as LanguageAwarePage;
    this.activePage.setLanguage?.(this.language());
  }

  toggleLanguage(): void {
    this.language.set(this.language() === "fa" ? "en" : "fa");
    this.saveSetting("language", this.language());
    this.activePage?.setLanguage?.(this.language());
    this.applyDocumentState();
    this.seo.applyForUrl(this.router.url, this.language());
  }

  private applyDocumentState(): void {
    this.document.documentElement.lang = this.language();
    this.document.documentElement.dir = this.direction;
    this.applyRouteTheme();
  }

  /** Keeps the public website cyan/dark while every authenticated workspace is monochrome. */
  private applyRouteTheme(): void {
    if (!this.document.body?.dataset) return;
    this.document.body.dataset["theme"] = this.isDashboardRoute()
      ? "dashboard"
      : "clinic";
  }

  private readSetting<T extends string>(key: string, fallback: T): T {
    try {
      return (localStorage.getItem(key) as T | null) ?? fallback;
    } catch {
      return fallback;
    }
  }

  private saveSetting(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // The UI still works when storage is unavailable.
    }
  }
}
