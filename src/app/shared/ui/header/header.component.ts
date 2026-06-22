import { Component, OnInit, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthDialogComponent } from '../../../auth/auth-dialog.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AuthDialogComponent],
  template: `
    <header class="header">
      <div class="header-inner">
        <a class="logo" routerLink="/">
          <span class="logo-mark">SM</span>
          <span class="logo-text">دکتر سعید مقدم</span>
        </a>
        <nav class="desktop-nav">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">صفحه اصلی</a>
          <a routerLink="/services" routerLinkActive="active">خدمات</a>
          <a routerLink="/doctor" routerLinkActive="active">دکتر</a>
          <a routerLink="/gallery" routerLinkActive="active">گالری</a>
          <a routerLink="/faq" routerLinkActive="active">سوالات</a>
          <button class="auth-button" type="button" (click)="openAuth()">{{ authLabel() }}</button>
          <a class="nav-cta" routerLink="/booking">رزرو نوبت</a>
        </nav>
        <button class="menu-toggle" (click)="menuOpen = !menuOpen" aria-label="منو">
          <span class="bar" [class.open]="menuOpen"></span>
          <span class="bar" [class.open]="menuOpen"></span>
        </button>
      </div>
      <div class="mobile-menu" [class.open]="menuOpen">
        <a routerLink="/" (click)="menuOpen = false">صفحه اصلی</a>
        <a routerLink="/services" (click)="menuOpen = false">خدمات</a>
        <a routerLink="/doctor" (click)="menuOpen = false">دکتر</a>
        <a routerLink="/gallery" (click)="menuOpen = false">گالری</a>
        <a routerLink="/faq" (click)="menuOpen = false">سوالات</a>
        <button class="mobile-auth" type="button" (click)="openAuth(); menuOpen = false">{{ authLabel() }}</button>
        <a class="mobile-cta" routerLink="/booking" (click)="menuOpen = false">رزرو نوبت</a>
      </div>
    </header>
    @if (authOpen) {
      <app-auth-dialog (close)="authOpen = false"></app-auth-dialog>
    }
  `,
  styles: [`
    .header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(255,255,255,0.88);
      backdrop-filter: blur(20px) saturate(1.8);
      -webkit-backdrop-filter: blur(20px) saturate(1.8);
      border-bottom: 1px solid rgba(0,0,0,0.04);
    }
    .header-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 24px;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: #2c2c2c;
    }
    .logo-mark {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: #2c2c2c;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .logo-text {
      font-size: 17px;
      font-weight: 700;
      letter-spacing: 0;
    }
    .desktop-nav {
      display: flex;
      align-items: center;
      gap: 28px;
    }
    .desktop-nav a {
      text-decoration: none;
      color: #666;
      font-size: 14px;
      font-weight: 500;
      transition: color 0.25s ease;
      position: relative;
    }
    .desktop-nav a:hover, .desktop-nav a.active {
      color: #2c2c2c;
    }
    .desktop-nav a.active::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 0;
      right: 0;
      height: 2px;
      background: #0066cc;
      border-radius: 1px;
    }
    .auth-button, .mobile-auth { border: 0; background: transparent; color: #0066cc; font: inherit; font-size: 14px; font-weight: 700; cursor: pointer; }
    .mobile-auth { text-align: right; padding: 12px 0; }
    .nav-cta {
      background: #0066cc !important;
      color: #fff !important;
      padding: 9px 20px;
      border-radius: 24px;
      font-weight: 600 !important;
    }
    .nav-cta:hover {
      background: #0055aa !important;
      transform: translateY(-1px);
    }
    .menu-toggle {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      flex-direction: column;
      gap: 6px;
      padding: 4px;
    }
    .bar {
      display: block;
      width: 24px;
      height: 2px;
      background: #2c2c2c;
      border-radius: 2px;
      transition: all 0.3s ease;
    }
    .bar.open:first-child {
      transform: rotate(45deg) translate(3px, 3px);
    }
    .bar.open:last-child {
      transform: rotate(-45deg) translate(3px, -3px);
    }
    .mobile-menu {
      display: none;
      flex-direction: column;
      padding: 0 24px 24px;
      gap: 4px;
      animation: slideDown 0.3s ease;
    }
    .mobile-menu.open {
      display: flex;
    }
    .mobile-menu a {
      text-decoration: none;
      color: #666;
      font-size: 16px;
      font-weight: 500;
      padding: 12px 0;
      border-bottom: 1px solid rgba(0,0,0,0.04);
      transition: color 0.2s ease;
    }
    .mobile-menu a:hover {
      color: #2c2c2c;
    }
    .mobile-cta {
      background: #0066cc;
      color: #fff !important;
      border-radius: 12px;
      text-align: center;
      margin-top: 8px;
      padding: 14px !important;
      font-weight: 600 !important;
      border-bottom: none !important;
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (max-width: 768px) {
      .desktop-nav { display: none; }
      .menu-toggle { display: flex; }
      .header-inner { padding: 12px 20px; }
    }
  `]
})
export class HeaderComponent implements OnInit {
  menuOpen = false;
  authOpen = false;
  authLabel = computed(() => {
    const user = this.auth.currentUser();
    return user ? `${user.firstName} ${user.lastName}` : 'ورود به داشبورد';
  });

  constructor(private auth: AuthService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      if (params.get('auth') === 'login') {
        this.authOpen = true;
        this.router.navigate([], { queryParams: { auth: null }, queryParamsHandling: 'merge', replaceUrl: true });
      }
    });
  }

  openAuth() {
    this.authOpen = true;
  }
}
