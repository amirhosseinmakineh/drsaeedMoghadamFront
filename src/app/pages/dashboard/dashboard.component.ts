import { Component, Input } from '@angular/core';
import { AuthService, UserRole } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <section class="dashboard" dir="rtl">
      <p class="eyebrow">داشبورد</p>
      <h1>{{ title }}</h1>
      <p>خوش آمدید {{ auth.currentUser()?.firstName }} {{ auth.currentUser()?.lastName }}</p>
      <button type="button" (click)="auth.logout()">خروج از حساب</button>
    </section>
  `,
  styles: [`
    .dashboard { max-width: 960px; margin: 48px auto; padding: 32px 24px; background: #fff; border-radius: 24px; box-shadow: 0 18px 50px rgba(0,0,0,0.08); }
    .eyebrow { color: #0066cc; font-weight: 700; margin: 0 0 8px; }
    h1 { margin: 0 0 12px; color: #2c2c2c; }
    button { border: 0; border-radius: 24px; background: #0066cc; color: #fff; padding: 11px 18px; font-weight: 700; cursor: pointer; }
  `]
})
export class DashboardComponent {
  @Input() role: UserRole = 'PATIENT';

  constructor(public auth: AuthService) {}

  get title() {
    if (this.role === 'ADMIN') return 'داشبورد مدیر';
    if (this.role === 'CONSULTANT') return 'داشبورد مشاور';
    return 'داشبورد بیمار';
  }
}
