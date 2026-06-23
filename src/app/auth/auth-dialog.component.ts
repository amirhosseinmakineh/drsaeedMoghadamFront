import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthDialogMode, AuthDialogModel, LanguageCode, pickText, text } from '../models/clinic.model';
import { BaseDialogComponent } from '../shared/base/base-dialog/base-dialog.component';
import { FaIconComponent } from '../shared/ui/fa-icon/fa-icon.component';

@Component({
  selector: 'app-auth-dialog',
  standalone: true,
  imports: [FormsModule, BaseDialogComponent, FaIconComponent],
  template: `
    <app-base-dialog
      [open]="open"
      [language]="language"
      [showFooter]="false"
      [eyebrow]="copy.eyebrow[language]"
      [title]="copy.title[language]"
      [subtitle]="copy.subtitle[language]"
      (closed)="closed.emit()"
    >
      @if (submitted()) {
        <div class="success-card">
          <span><app-fa-icon name="check"></app-fa-icon></span>
          <h3>{{ copy.successTitle[language] }}</h3>
          <p>{{ copy.successText[language] }}</p>
          <button class="primary full" type="button" (click)="resetAndClose()">{{ copy.done[language] }}</button>
        </div>
      } @else {
        <div class="tabs">
          <button type="button" [class.active]="mode() === 'login'" (click)="mode.set('login')">{{ copy.login[language] }}</button>
          <button type="button" [class.active]="mode() === 'register'" (click)="mode.set('register')">{{ copy.register[language] }}</button>
        </div>

        @if (mode() === 'register') {
          <label>
            {{ copy.fullName[language] }}
            <input [(ngModel)]="form.fullName" name="authFullName" autocomplete="name" />
          </label>
        }

        <label>
          {{ copy.phone[language] }}
          <input [(ngModel)]="form.phone" name="authPhone" inputmode="tel" autocomplete="tel" [placeholder]="language === 'fa' ? '09xxxxxxxxx' : '+98 9xx xxx xxxx'" />
        </label>

        <label>
          {{ copy.password[language] }}
          <input [(ngModel)]="form.password" name="authPassword" type="password" [autocomplete]="mode() === 'login' ? 'current-password' : 'new-password'" />
        </label>

        @if (mode() === 'register') {
          <label class="check-row">
            <input [(ngModel)]="form.acceptCarePolicy" name="acceptCarePolicy" type="checkbox" />
            <span>{{ copy.policy[language] }}</span>
          </label>
        }

        <button class="primary full" type="button" (click)="submit()">
          <app-fa-icon name="user"></app-fa-icon>
          {{ mode() === 'login' ? copy.loginAction[language] : copy.registerAction[language] }}
        </button>
      }
    </app-base-dialog>
  `,
  styles: [`
    .tabs{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:6px;border-radius:999px;background:var(--surface-muted,#eefafa)}
    .tabs button{border:0;border-radius:999px;padding:11px;font:inherit;font-weight:900;background:transparent;color:var(--muted,#786a59);cursor:pointer}.tabs .active{background:var(--surface,#fff);color:var(--brand,#a8793f);box-shadow:0 10px 24px rgba(91,64,38,.08)}
    label{display:grid;gap:8px;color:var(--muted,#786a59);font-weight:900}.check-row{grid-template-columns:auto 1fr;align-items:start}.check-row input{width:18px;height:18px;margin-top:4px;accent-color:var(--brand,#a8793f)}
    input{width:100%;border:1px solid color-mix(in srgb,var(--line,#dbe6ee) 94%,transparent);border-radius:17px;padding:13px 14px;background:var(--surface,#fff);color:var(--text,#14222e);font:inherit}
    .primary{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:0;border-radius:999px;padding:14px 18px;background:linear-gradient(135deg,var(--brand,#a8793f),var(--brand-2,#d7b16d));color:#fff;font:inherit;font-weight:950;cursor:pointer;box-shadow:0 16px 36px color-mix(in srgb,var(--brand,#a8793f) 24%,transparent)}
    .full{width:100%}.success-card{display:grid;place-items:center;text-align:center;gap:10px;padding:10px}.success-card span{display:grid;place-items:center;width:58px;height:58px;border-radius:22px;background:color-mix(in srgb,var(--brand,#a8793f) 16%,transparent);color:var(--brand,#a8793f);font-size:1.6rem}.success-card h3{margin:0;color:var(--text,#2c241b)}.success-card p{margin:0;color:var(--muted,#786a59);line-height:1.8}
  `]
})
export class AuthDialogComponent {
  @Input() open = false;
  @Input() language: LanguageCode = 'fa';
  @Output() closed = new EventEmitter<void>();

  mode = signal<AuthDialogMode>('login');
  submitted = signal(false);
  form: AuthDialogModel = {
    fullName: '',
    phone: '',
    password: '',
    acceptCarePolicy: false
  };

  copy = {
    eyebrow: text('حساب کاربری کلینیک', 'Clinic account'),
    title: text('ورود و عضویت', 'Sign in and membership'),
    subtitle: text('برای پیگیری درخواست تماس، ذخیره خدمات مورد علاقه و دریافت راهنمای درمان وارد شوید.', 'Sign in to follow consultant calls, save favorite services and receive care guidance.'),
    login: text('ورود', 'Sign in'),
    register: text('عضویت', 'Join'),
    fullName: text('نام و نام خانوادگی', 'Full name'),
    phone: text('شماره موبایل', 'Mobile number'),
    password: text('رمز عبور', 'Password'),
    policy: text('می‌پذیرم اطلاعات تماس من فقط برای ارتباط کلینیک و راهنمای درمان استفاده شود.', 'I accept that my contact details are used only for clinic communication and care guidance.'),
    loginAction: text('ورود به حساب', 'Sign in'),
    registerAction: text('ساخت حساب', 'Create account'),
    successTitle: text('درخواست شما آماده پیگیری است', 'Your request is ready for follow-up'),
    successText: text('اطلاعات شما ثبت شد و می‌توانید پیگیری خدمات، درخواست تماس و راهنمای درمان را از مسیر حساب کاربری دنبال کنید.', 'Your information has been recorded so you can follow services, call requests and care guidance through your account path.'),
    done: text('متوجه شدم', 'Got it')
  };

  submit(): void {
    if (!this.form.phone || !this.form.password) return;
    if (this.mode() === 'register' && (!this.form.fullName || !this.form.acceptCarePolicy)) return;

    this.submitted.set(true);
  }

  resetAndClose(): void {
    this.submitted.set(false);
    this.closed.emit();
  }

  protected readonly pickText = pickText;
}
