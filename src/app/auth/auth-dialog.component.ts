import { Component, EventEmitter, Output, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService, UserRole } from '../services/auth.service';
import { BaseDialogComponent } from '../shared/base/base-dialog/base-dialog.component';

@Component({
  selector: 'app-auth-dialog',
  standalone: true,
  imports: [FormsModule, BaseDialogComponent],
  template: `
    <app-base-dialog [open]="true" mode="auth" [showFooter]="false" title="ورود و عضویت" subtitle="حساب کاربری کلینیک" (cancelClick)="close.emit()">
      @if (user()) {
        <p class="user-name">{{ user()?.firstName }} {{ user()?.lastName }}</p>
        <button class="primary full" type="button" (click)="logout()">خروج از حساب</button>
      } @else {
        <div class="tabs"><button [class.active]="!isRegister()" (click)="isRegister.set(false)">ورود</button><button [class.active]="isRegister()" (click)="isRegister.set(true)">عضویت</button></div>
        @if (isRegister()) {
          <label>نام <input [(ngModel)]="firstName" name="firstName" autocomplete="given-name" /></label>
          <label>نام خانوادگی <input [(ngModel)]="lastName" name="lastName" autocomplete="family-name" /></label>
          <label>نقش <select [(ngModel)]="role" name="role"><option value="PATIENT">Patient</option><option value="CONSULTANT">Consultant</option><option value="ADMIN">Admin</option></select></label>
        }
        <label>شماره تلفن <input [(ngModel)]="phoneNumber" name="phoneNumber" inputmode="tel" autocomplete="tel" placeholder="09xxxxxxxxx" /></label>
        <label>رمز عبور <input [(ngModel)]="password" name="password" type="password" autocomplete="current-password" /></label>
        <button class="primary full" type="button" (click)="isRegister() ? register() : login()">{{ isRegister() ? 'ساخت حساب' : 'ورود به حساب' }}</button>
      }
    </app-base-dialog>
  `,
  styles: [`label{display:grid;gap:7px;color:#6f6254;font-weight:800}input,select{border:1px solid #eadfce;border-radius:15px;padding:12px;background:#fff;font:inherit}.tabs{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:6px;border-radius:999px;background:#f7efe4}.tabs button{border:0;border-radius:999px;padding:10px;font-weight:900;background:transparent}.tabs .active,.primary{background:#0e7c86!important;color:#fff}.full{width:100%;border:0;border-radius:999px;padding:13px 18px;font-weight:900;cursor:pointer}.user-name{font-size:1.2rem;font-weight:900}`]
})
export class AuthDialogComponent {
  @Output() close = new EventEmitter<void>();
  firstName = ''; lastName = ''; phoneNumber = ''; password = ''; role: UserRole = 'PATIENT';
  isRegister = signal(false); user = computed(() => this.auth.currentUser());
  constructor(private auth: AuthService) {}
  login() { if (this.auth.login(this.phoneNumber, this.password)) this.close.emit(); }
  register() { if (this.auth.register({ firstName: this.firstName, lastName: this.lastName, phoneNumber: this.phoneNumber, password: this.password, role: this.role })) this.close.emit(); }
  logout() { this.auth.logout(); this.close.emit(); }
}
