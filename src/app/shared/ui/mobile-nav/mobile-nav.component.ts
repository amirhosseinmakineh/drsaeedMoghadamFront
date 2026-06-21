import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="mobile-nav">
      <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        <span>خانه</span>
      </a>
      <a routerLink="/services" routerLinkActive="active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
        <span>خدمات</span>
      </a>
      <a routerLink="/booking" routerLinkActive="active" class="center-btn">
        <div class="center-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        </div>
        <span>رزرو</span>
      </a>
      <a routerLink="/gallery" routerLinkActive="active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
        <span>گالری</span>
      </a>
      <a routerLink="/doctor" routerLinkActive="active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        <span>دکتر</span>
      </a>
    </nav>
  `,
  styles: [`
    .mobile-nav {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 100;
      background: rgba(255,255,255,0.92);
      backdrop-filter: blur(20px) saturate(1.8);
      -webkit-backdrop-filter: blur(20px) saturate(1.8);
      border-top: 1px solid rgba(0,0,0,0.06);
      padding: 8px 12px calc(8px + env(safe-area-inset-bottom));
      justify-content: space-around;
      align-items: flex-end;
    }
    .mobile-nav a {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      text-decoration: none;
      color: #888;
      font-size: 10px;
      font-weight: 500;
      transition: color 0.2s ease;
      flex: 1;
      padding: 4px 0;
    }
    .mobile-nav a svg {
      width: 22px;
      height: 22px;
    }
    .mobile-nav a.active {
      color: #2c2c2c;
    }
    .mobile-nav a.active svg {
      stroke-width: 2.5;
    }
    .center-btn {
      position: relative;
      top: -16px;
    }
    .center-icon {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: #0066cc;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(0,102,204,0.25);
      transition: transform 0.2s ease;
    }
    .center-icon svg {
      width: 24px !important;
      height: 24px !important;
      color: #fff;
    }
    .center-btn:hover .center-icon {
      transform: scale(1.05);
    }
    .center-btn.active .center-icon {
      background: #0055aa;
    }
    @media (max-width: 768px) {
      .mobile-nav { display: flex; }
    }
  `]
})
export class MobileNavComponent {}
