import { NgFor } from '@angular/common';
import { Component, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { FaIconComponent } from '../../shared/ui/fa-icon/fa-icon.component';

interface DashboardLink {
  label: string;
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgFor, RouterLink, FaIconComponent],
  template: `
    <section class="dashboard-layout page-section">
      <aside class="dashboard-sidebar">
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
          <a *ngFor="let item of links" href="#">
            <app-fa-icon [name]="item.icon"></app-fa-icon>
            {{ item.label }}
          </a>
        </nav>

        <button class="secondary-btn logout-btn" type="button" (click)="logout()">
          <app-fa-icon name="logout"></app-fa-icon>
          خروج از حساب کاربری
        </button>
      </aside>

      <main class="dashboard-content">
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
      </main>
    </section>
  `,
  styles: [`
    .dashboard-layout{display:grid;grid-template-columns:300px minmax(0,1fr);gap:18px;padding-top:36px}
    .dashboard-sidebar,.dashboard-content article,.dashboard-hero{border:1px solid var(--line);background:color-mix(in srgb,var(--surface) 86%,transparent);box-shadow:var(--shadow);backdrop-filter:blur(18px)}
    .dashboard-sidebar{position:sticky;top:18px;display:grid;align-content:start;gap:18px;min-height:calc(100vh - 72px);padding:20px;border-radius:34px}
    .dashboard-brand{display:flex;align-items:center;gap:10px;color:var(--text);font-weight:950}
    .dashboard-user-card{display:grid;gap:12px;padding:18px;border:1px solid var(--line);border-radius:28px;background:linear-gradient(135deg,color-mix(in srgb,var(--brand) 12%,transparent),color-mix(in srgb,var(--surface-muted) 84%,transparent))}
    .avatar{display:grid;place-items:center;width:62px;height:62px;border-radius:24px;background:color-mix(in srgb,var(--brand) 18%,transparent);color:var(--brand);font-size:1.45rem}
    .dashboard-user-card small{display:block;color:var(--muted);font-weight:900}.dashboard-user-card h1{margin:4px 0;font-size:1.35rem}.dashboard-user-card b{color:var(--brand)}
    .dashboard-nav{display:grid;gap:10px}.dashboard-nav a{display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:18px;background:var(--surface-muted);color:var(--muted);font-weight:900}.dashboard-nav a:first-child{color:var(--text);background:color-mix(in srgb,var(--brand) 16%,var(--surface-muted))}
    .logout-btn{width:100%;margin-top:auto}
    .dashboard-content{display:grid;align-content:start;gap:18px}.dashboard-hero{padding:clamp(24px,4vw,42px);border-radius:36px;background:radial-gradient(circle at 10% 0,color-mix(in srgb,var(--brand-2) 24%,transparent),transparent 36%),linear-gradient(135deg,color-mix(in srgb,var(--surface) 88%,transparent),var(--cream))}
    .dashboard-hero span{display:inline-flex;margin-bottom:12px;padding:6px 14px;border-radius:999px;background:color-mix(in srgb,var(--brand) 18%,transparent);color:var(--brand);font-weight:950}.dashboard-hero h2{margin:0 0 10px;font-size:clamp(1.8rem,4vw,3rem)}.dashboard-hero p{max-width:720px;margin:0}
    .dashboard-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.dashboard-content article{padding:22px;border-radius:30px}.dashboard-content article span{display:grid;place-items:center;width:48px;height:48px;border-radius:18px;background:color-mix(in srgb,var(--brand) 14%,transparent);color:var(--brand)}.dashboard-content article h3{margin:16px 0 6px}.dashboard-content article strong{display:block;color:var(--text);font-size:1.1rem}.dashboard-content article p{margin:10px 0 0}
    @media (max-width: 980px){.dashboard-layout{grid-template-columns:1fr;padding-top:20px}.dashboard-sidebar{position:relative;top:0;min-height:0}.dashboard-grid{grid-template-columns:1fr}}
  `]
})
export class DashboardComponent {
  readonly user = this.auth.user;
  readonly links: DashboardLink[] = [
    { label: 'نمای کلی', icon: 'dashboard' },
    { label: 'پیگیری‌ها', icon: 'calendar' },
    { label: 'تنظیمات حساب', icon: 'user' }
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

  constructor(private auth: AuthService, private router: Router) {}

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}
