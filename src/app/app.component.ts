import { NgFor, NgIf } from "@angular/common";
import { Component, OnDestroy, OnInit, signal } from "@angular/core";
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from "@angular/router";
import { AuthDialogComponent } from "./auth/auth-dialog.component";
import { AuthService, AuthUser } from "./core/auth/auth.service";
import { PushNotificationService } from "./core/push/push-notification.service";
import { LanguageCode, NAV_ITEMS, pickText } from "./models/clinic.model";
import { FaIconComponent } from "./shared/ui/fa-icon/fa-icon.component";

interface LanguageAwarePage {
  setLanguage?: (language: LanguageCode) => void;
}

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    AuthDialogComponent,
    FaIconComponent,
  ],
  template: `
    <div class="app-shell light" [attr.dir]="direction">
      <header *ngIf="!isDashboardRoute()" class="site-header">
        <a
          class="brand"
          routerLink="/"
          [attr.aria-label]="language() === 'fa' ? 'صفحه اصلی' : 'Homepage'"
        >
          <span class="brand-mark"
            ><app-fa-icon name="tooth"></app-fa-icon
          ></span>
          <span>
            <b>{{
              language() === "fa"
                ? "کلینیک دندان‌پزشکی دکتر سعید مقدم"
                : "Dr. Saeed Moghaddam Dental"
            }}</b>
            <small>{{
              language() === "fa"
                ? "کامپوزیت، لمینت و بلیچینگ"
                : "Composite, veneers and bleaching"
            }}</small>
          </span>
        </a>

        <nav
          class="desktop-nav"
          [attr.aria-label]="
            language() === 'fa' ? 'ناوبری اصلی' : 'Main navigation'
          "
        >
          <a
            *ngFor="let item of navItems"
            [routerLink]="item.href"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: item.href === '/' }"
          >
            {{ pickText(item.label, language()) }}
          </a>
        </nav>

        <div class="header-actions">
          <button
            class="icon-btn"
            type="button"
            (click)="toggleLanguage()"
            [attr.aria-label]="language() === 'fa' ? 'English' : 'فارسی'"
          >
            {{ language() === "fa" ? "EN" : "فا" }}
          </button>
          @if (user(); as currentUser) {
            <div class="header-account">
              <span class="account-name">
                <app-fa-icon name="user"></app-fa-icon>
                {{ displayName(currentUser) }}
              </span>
              <a class="secondary-btn small" [routerLink]="dashboardUrl()">
                <app-fa-icon name="dashboard"></app-fa-icon>
                {{ language() === "fa" ? "ورود به داشبورد" : "Dashboard" }}
              </a>
              <button
                class="icon-btn logout-header"
                type="button"
                (click)="logout()"
                [attr.aria-label]="
                  language() === 'fa' ? 'خروج از حساب کاربری' : 'Sign out'
                "
              >
                <app-fa-icon name="logout"></app-fa-icon>
              </button>
            </div>
          } @else if (showAuthActions()) {
            <button
              class="primary-btn small"
              type="button"
              (click)="authOpen.set(true)"
            >
              <app-fa-icon name="user"></app-fa-icon>
              {{ language() === "fa" ? "ورود / عضویت" : "Sign in / Join" }}
            </button>
          }
        </div>
      </header>

      <main>
        <router-outlet (activate)="onActivate($event)"></router-outlet>
      </main>

      <footer class="site-footer">
        <section class="footer-brand-area">
          <a
            class="brand"
            routerLink="/"
            [attr.aria-label]="language() === 'fa' ? 'صفحه اصلی' : 'Homepage'"
          >
            <span class="brand-mark"
              ><app-fa-icon name="tooth"></app-fa-icon
            ></span>
            <span>
              <b>{{
                language() === "fa"
                  ? "کلینیک دندان‌پزشکی دکتر سعید مقدم"
                  : "Dr. Saeed Moghaddam Dental Clinic"
              }}</b>
              <small>{{
                language() === "fa"
                  ? "طراحی لبخند با کامپوزیت، لمینت و بلیچینگ"
                  : "Smile design with composite, veneers and bleaching"
              }}</small>
            </span>
          </a>
          <p>
            {{
              language() === "fa"
                ? "دسترسی سریع به خدمات، تماس، ساعات پاسخگویی و مسیرهای مهم کلینیک دندان‌پزشکی دکتر سعید مقدم."
                : "Quick access to services, contact details, response hours and key paths for Dr. Saeed Moghaddam Dental Clinic."
            }}
          </p>
        </section>

        <div class="footer-grid">
          <section>
            <h2>{{ language() === "fa" ? "دسترسی سریع" : "Quick links" }}</h2>
            <a routerLink="/services">{{
              language() === "fa" ? "خدمات دندان‌پزشکی" : "Dental services"
            }}</a>
            <a routerLink="/about">{{
              language() === "fa"
                ? "درباره دکتر سعید مقدم"
                : "About Dr. Moghaddam"
            }}</a>
            <a routerLink="/contact">{{
              language() === "fa" ? "تماس با کلینیک" : "Contact clinic"
            }}</a>
          </section>

          <section>
            <h2>
              {{ language() === "fa" ? "خدمات محبوب" : "Popular services" }}
            </h2>
            <a routerLink="/services/composite">{{
              language() === "fa" ? "کامپوزیت ونیر" : "Composite veneers"
            }}</a>
            <a routerLink="/services/laminate">{{
              language() === "fa" ? "لمینت سرامیکی" : "Porcelain veneers"
            }}</a>
            <a routerLink="/services/whitening">{{
              language() === "fa" ? "بلیچینگ دندان" : "Dental bleaching"
            }}</a>
          </section>

          <section class="footer-contact-card">
            <h2>
              {{
                language() === "fa" ? "تماس و پاسخگویی" : "Contact and hours"
              }}
            </h2>
            <p>
              <app-fa-icon name="phone"></app-fa-icon
              >{{
                language() === "fa"
                  ? "ثبت درخواست تماس از فرم سایت"
                  : "Call request through the website form"
              }}
            </p>
            <p>
              <app-fa-icon name="location"></app-fa-icon
              >{{
                language() === "fa"
                  ? "اطلاعات مسیر مراجعه هنگام هماهنگی اعلام می‌شود"
                  : "Visit directions are shared during coordination"
              }}
            </p>
            <p>
              <app-fa-icon name="clock"></app-fa-icon
              >{{
                language() === "fa"
                  ? "شنبه تا پنجشنبه، ۹ تا ۲۰"
                  : "Saturday to Thursday, 9:00 to 20:00"
              }}
            </p>
          </section>
        </div>
      </footer>

      <nav
        *ngIf="!isDashboardRoute()"
        class="mobile-bottom-nav"
        [class.account-open]="mobileAccountOpen()"
        [attr.aria-label]="
          language() === 'fa' ? 'دسترسی سریع موبایل' : 'Mobile quick actions'
        "
      >
        @if (user(); as currentUser) {
          <div class="mobile-account-panel">
            <strong>{{ displayName(currentUser) }}</strong>
            <span>{{ auth.roleLabel(currentUser.role, language()) }}</span>
            <div>
              <a
                [routerLink]="dashboardUrl()"
                (click)="mobileAccountOpen.set(false)"
              >
                <app-fa-icon name="dashboard"></app-fa-icon>
                {{ language() === "fa" ? "ورود به داشبورد" : "Dashboard" }}
              </a>
              <button type="button" (click)="logout()">
                <app-fa-icon name="logout"></app-fa-icon>
                {{ language() === "fa" ? "خروج" : "Sign out" }}
              </button>
            </div>
          </div>
        }
        <a
          *ngFor="let item of navItems"
          [routerLink]="item.href"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: item.href === '/' }"
        >
          <app-fa-icon [name]="item.icon"></app-fa-icon>
          <span>{{ pickText(item.label, language()) }}</span>
        </a>
        @if (user(); as currentUser) {
          <button
            type="button"
            (click)="mobileAccountOpen.set(!mobileAccountOpen())"
          >
            <app-fa-icon name="user"></app-fa-icon>
            <span>{{ displayName(currentUser) }}</span>
          </button>
        } @else if (showAuthActions()) {
          <button type="button" (click)="authOpen.set(true)">
            <app-fa-icon name="user"></app-fa-icon>
            <span>{{ language() === "fa" ? "ورود" : "Sign in" }}</span>
          </button>
        }
      </nav>

      <app-auth-dialog
        [open]="authOpen()"
        [language]="language()"
        (closed)="authOpen.set(false)"
      ></app-auth-dialog>
    </div>
  `,
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

  constructor(
    private router: Router,
    public auth: AuthService,
    private pushNotifications: PushNotificationService,
  ) {}

  get direction(): "rtl" | "ltr" {
    return this.language() === "fa" ? "rtl" : "ltr";
  }

  showAuthActions(): boolean {
    return !this.isDashboardRoute();
  }

  isDashboardRoute(): boolean {
    return this.router.url.startsWith("/dashboard");
  }

  displayName(user: AuthUser): string {
    const name = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    return name || (this.language() === "fa" ? "کاربر" : "User");
  }

  dashboardUrl(): string {
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
    void this.pushNotifications.syncForCurrentProfile();
    window.addEventListener("open-auth-dialog", this.openAuthFromPage);
  }

  ngOnDestroy(): void {
    window.removeEventListener("open-auth-dialog", this.openAuthFromPage);
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
  }

  private applyDocumentState(): void {
    document.documentElement.lang = this.language();
    document.documentElement.dir = this.direction;
    document.body.dataset["theme"] = "light";
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
