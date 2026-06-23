import { NgFor } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthDialogComponent } from './auth/auth-dialog.component';
import { LanguageCode, NAV_ITEMS, ThemeMode, pickText } from './models/clinic.model';
import { FaIconComponent } from './shared/ui/fa-icon/fa-icon.component';

interface LanguageAwarePage {
  setLanguage?: (language: LanguageCode) => void;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgFor, RouterLink, RouterLinkActive, RouterOutlet, AuthDialogComponent, FaIconComponent],
  template: `
    <div class="app-shell" [class.dark]="theme() === 'dark'" [attr.dir]="direction">
      <header class="site-header">
        <a class="brand" routerLink="/" [attr.aria-label]="language() === 'fa' ? 'صفحه اصلی' : 'Homepage'">
          <span class="brand-mark"><app-fa-icon name="tooth"></app-fa-icon></span>
          <span>
            <b>{{ language() === 'fa' ? 'کلینیک دندان‌پزشکی دکتر مقدم' : 'Dr. Moghaddam Dental' }}</b>
            <small>{{ language() === 'fa' ? 'زیبایی، ایمپلنت و درمان دقیق' : 'Cosmetic, implant and precise care' }}</small>
          </span>
        </a>

        <nav class="desktop-nav" [attr.aria-label]="language() === 'fa' ? 'ناوبری اصلی' : 'Main navigation'">
          <a *ngFor="let item of navItems" [routerLink]="item.href" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: item.href === '/' }">
            {{ pickText(item.label, language()) }}
          </a>
        </nav>

        <div class="header-actions">
          <button class="icon-btn" type="button" (click)="toggleLanguage()" [attr.aria-label]="language() === 'fa' ? 'English' : 'فارسی'">
            {{ language() === 'fa' ? 'EN' : 'فا' }}
          </button>
          <button class="icon-btn" type="button" (click)="toggleTheme()" [attr.aria-label]="language() === 'fa' ? 'تغییر تم' : 'Change theme'">
            <app-fa-icon [name]="theme() === 'light' ? 'moon' : 'sun'"></app-fa-icon>
          </button>
          <button class="primary-btn small" type="button" (click)="authOpen.set(true)">
            <app-fa-icon name="user"></app-fa-icon>
            {{ language() === 'fa' ? 'ورود / عضویت' : 'Sign in / Join' }}
          </button>
        </div>
      </header>

      <main>
        <router-outlet (activate)="onActivate($event)"></router-outlet>
      </main>

      <footer class="site-footer">
        <section>
          <span class="brand-mark"><app-fa-icon name="tooth"></app-fa-icon></span>
          <div>
            <h2>{{ language() === 'fa' ? 'کلینیک دندان‌پزشکی دکتر سعید مقدم' : 'Dr. Saeed Moghaddam Dental Clinic' }}</h2>
            <p>{{ language() === 'fa' ? 'تهران، خیابان نمونه، پلاک نمونه | ۰۲۱-۰۰۰۰۰۰۰۰' : 'Tehran, Sample St., Sample No. | +98 21 0000 0000' }}</p>
          </div>
        </section>
        <div>
          <a routerLink="/services">{{ language() === 'fa' ? 'خدمات' : 'Services' }}</a>
          <a routerLink="/about">{{ language() === 'fa' ? 'درباره ما' : 'About' }}</a>
          <a routerLink="/contact">{{ language() === 'fa' ? 'تماس با ما' : 'Contact' }}</a>
        </div>
      </footer>

      <nav class="mobile-bottom-nav" [attr.aria-label]="language() === 'fa' ? 'دسترسی سریع موبایل' : 'Mobile quick actions'">
        <a *ngFor="let item of navItems" [routerLink]="item.href" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: item.href === '/' }">
          <app-fa-icon [name]="item.icon"></app-fa-icon>
          <span>{{ pickText(item.label, language()) }}</span>
        </a>
        <button type="button" (click)="authOpen.set(true)">
          <app-fa-icon name="user"></app-fa-icon>
          <span>{{ language() === 'fa' ? 'ورود' : 'Sign in' }}</span>
        </button>
      </nav>

      <app-auth-dialog [open]="authOpen()" [language]="language()" (closed)="authOpen.set(false)"></app-auth-dialog>
    </div>
  `
})
export class AppComponent implements OnInit, OnDestroy {
  navItems = NAV_ITEMS;
  language = signal<LanguageCode>(this.readSetting<LanguageCode>('language', 'fa'));
  theme = signal<ThemeMode>(this.readSetting<ThemeMode>('theme', 'light'));
  authOpen = signal(false);
  activePage: LanguageAwarePage | null = null;
  protected readonly pickText = pickText;

  private readonly openAuthFromPage = (): void => this.authOpen.set(true);

  get direction(): 'rtl' | 'ltr' {
    return this.language() === 'fa' ? 'rtl' : 'ltr';
  }

  ngOnInit(): void {
    this.applyDocumentState();
    window.addEventListener('open-auth-dialog', this.openAuthFromPage);
  }

  ngOnDestroy(): void {
    window.removeEventListener('open-auth-dialog', this.openAuthFromPage);
  }

  onActivate(component: object): void {
    this.activePage = component as LanguageAwarePage;
    this.activePage.setLanguage?.(this.language());
  }

  toggleLanguage(): void {
    this.language.set(this.language() === 'fa' ? 'en' : 'fa');
    this.saveSetting('language', this.language());
    this.activePage?.setLanguage?.(this.language());
    this.applyDocumentState();
  }

  toggleTheme(): void {
    this.theme.set(this.theme() === 'light' ? 'dark' : 'light');
    this.saveSetting('theme', this.theme());
    this.applyDocumentState();
  }

  private applyDocumentState(): void {
    document.documentElement.lang = this.language();
    document.documentElement.dir = this.direction;
    document.body.dataset['theme'] = this.theme();
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
