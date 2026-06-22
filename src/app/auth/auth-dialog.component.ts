import { Component, EventEmitter, Output, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService, UserRole } from '../services/auth.service';

@Component({
  selector: 'app-auth-dialog',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="dialog-backdrop" (click)="close.emit()">
      <section class="auth-dialog" dir="rtl" (click)="$event.stopPropagation()">
        <button class="close" type="button" (click)="close.emit()" aria-label="بستن">×</button>
        <h2>ورود / عضویت</h2>

        @if (user()) {
          <p class="user-name">{{ user()?.firstName }} {{ user()?.lastName }}</p>
          <button class="primary" type="button" (click)="logout()">خروج از حساب</button>
        } @else {
          @if (isRegister()) {
            <label>نام
              <input [(ngModel)]="firstName" name="firstName" autocomplete="given-name" />
            </label>
            <label>نام خانوادگی
              <input [(ngModel)]="lastName" name="lastName" autocomplete="family-name" />
            </label>
            <label>نقش
              <select [(ngModel)]="role" name="role">
                <option value="PATIENT">Patient</option>
                <option value="CONSULTANT">Consultant</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>
          }

          <label>شماره تلفن
            <input [(ngModel)]="phoneNumber" name="phoneNumber" inputmode="tel" autocomplete="tel" />
          </label>
          <label>رمز عبور
            <input [(ngModel)]="password" name="password" type="password" autocomplete="current-password" />
          </label>

          <div class="actions">
            <button class="primary" type="button" (click)="login()">ورود به داشبورد</button>
            <button class="secondary" type="button" (click)="register()">عضویت</button>
          </div>
        }
      </section>
    </div>
  `,
  styles: [`
    .dialog-backdrop { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; background: rgba(0,0,0,0.35); padding: 16px; }
    .auth-dialog { width: min(420px, 100%); background: #fff; border-radius: 20px; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.18); position: relative; }
    .close { position: absolute; left: 16px; top: 12px; border: 0; background: transparent; font-size: 28px; cursor: pointer; }
    h2 { margin: 0 0 20px; color: #2c2c2c; font-size: 22px; }
    label { display: grid; gap: 8px; color: #555; font-size: 14px; margin-bottom: 14px; }
    input, select { border: 1px solid #ddd; border-radius: 12px; padding: 12px; font: inherit; outline: none; }
    input:focus, select:focus { border-color: #0066cc; }
    .actions { display: flex; gap: 10px; flex-wrap: wrap; }
    button.primary, button.secondary { border: 0; border-radius: 24px; padding: 11px 18px; font-weight: 700; cursor: pointer; }
    .primary { background: #0066cc; color: #fff; }
    .secondary { background: #f1f5f9; color: #2c2c2c; }
    .user-name { margin: 8px 0 18px; font-size: 18px; font-weight: 700; color: #2c2c2c; }
  `]
})
export class AuthDialogComponent {
  @Output() close = new EventEmitter<void>();

  firstName = '';
  lastName = '';
  phoneNumber = '';
  password = '';
  role: UserRole = 'PATIENT';
  isRegister = signal(false);
  user = computed(() => this.auth.currentUser());

  constructor(private auth: AuthService) {}

  login() {
    this.isRegister.set(false);
    if (this.auth.login(this.phoneNumber, this.password)) {
      this.close.emit();
    }
  }

  register() {
    if (!this.isRegister()) {
      this.isRegister.set(true);
      return;
    }

    if (this.auth.register({ firstName: this.firstName, lastName: this.lastName, phoneNumber: this.phoneNumber, password: this.password, role: this.role })) {
      this.close.emit();
    }
  }

  logout() {
    this.auth.logout();
    this.close.emit();
  }
}
