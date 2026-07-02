import { Component, EventEmitter, Input, Output, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { finalize } from "rxjs";
import { AuthService, RegisterRequest } from "../core/auth/auth.service";
import { ToastService } from "../core/toast/toast.service";
import {
  AuthDialogMode,
  AuthDialogModel,
  LanguageCode,
  text,
} from "../models/clinic.model";
import { BaseDialogComponent } from "../shared/base/base-dialog/base-dialog.component";
import { FaIconComponent } from "../shared/ui/fa-icon/fa-icon.component";

@Component({
  selector: "app-auth-dialog",
  standalone: true,
  imports: [FormsModule, BaseDialogComponent, FaIconComponent],
  template: `
    <app-base-dialog
      [open]="open"
      [language]="language"
      [showFooter]="false"
      [title]="copy.title[language]"
      [subtitle]="copy.subtitle[language]"
      (closed)="closed.emit()"
    >
      <div class="tabs">
        <button
          type="button"
          [class.active]="mode() === 'login'"
          [disabled]="loading()"
          (click)="switchMode('login')"
        >
          {{ copy.login[language] }}
        </button>
        <button
          type="button"
          [class.active]="mode() === 'register'"
          [disabled]="loading()"
          (click)="switchMode('register')"
        >
          {{ copy.register[language] }}
        </button>
      </div>

      @if (feedback(); as currentFeedback) {
        <p
          class="feedback"
          [class.error]="currentFeedback.type === 'error'"
          [class.success]="currentFeedback.type === 'success'"
        >
          {{ currentFeedback.message }}
        </p>
      }

      <form class="auth-form" (ngSubmit)="submit()">
        @if (mode() === "register") {
          <div class="two-col">
            <label>
              {{ copy.firstName[language] }}
              <input
                [(ngModel)]="form.firstName"
                name="authFirstName"
                autocomplete="given-name"
                maxlength="100"
              />
            </label>
            <label>
              {{ copy.lastName[language] }}
              <input
                [(ngModel)]="form.lastName"
                name="authLastName"
                autocomplete="family-name"
                maxlength="100"
              />
            </label>
          </div>
        }

        <label>
          {{ copy.phone[language] }}
          <input
            [(ngModel)]="form.phone"
            name="authPhone"
            inputmode="tel"
            autocomplete="tel"
            placeholder="09123456789"
          />
        </label>

        <label>
          {{ copy.password[language] }}
          <input
            [(ngModel)]="form.password"
            name="authPassword"
            type="password"
            minlength="8"
            maxlength="100"
            [autocomplete]="
              mode() === 'login' ? 'current-password' : 'new-password'
            "
          />
        </label>

        @if (mode() === "register") {
          <div class="two-col">
            <label>
              {{ copy.gender[language] }}
              <select [(ngModel)]="form.gender" name="authGender">
                <option [ngValue]="1">{{ copy.male[language] }}</option>
                <option [ngValue]="2">{{ copy.female[language] }}</option>
              </select>
            </label>
          </div>
        }

        <button class="primary full" type="submit" [disabled]="loading()">
          <app-fa-icon name="user"></app-fa-icon>
          {{
            loading()
              ? copy.loading[language]
              : mode() === "login"
                ? copy.loginAction[language]
                : copy.registerAction[language]
          }}
        </button>
      </form>
    </app-base-dialog>
  `,
  styles: [
    `
      .tabs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        padding: 6px;
        border-radius: 999px;
        background: var(--surface-muted, #eefafa);
      }
      .tabs button {
        border: 0;
        border-radius: 999px;
        padding: 11px;
        font: inherit;
        font-weight: 900;
        background: transparent;
        color: var(--muted, #786a59);
        cursor: pointer;
      }
      .tabs button:disabled {
        cursor: not-allowed;
        opacity: 0.7;
      }
      .tabs .active {
        background: var(--surface, #fff);
        color: var(--brand, #a8793f);
        box-shadow: 0 10px 24px rgba(91, 64, 38, 0.08);
      }
      .auth-form {
        display: grid;
        gap: 14px;
      }
      .two-col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      label {
        display: grid;
        gap: 8px;
        color: var(--muted, #786a59);
        font-weight: 900;
      }
      input,
      select {
        width: 100%;
        border: 1px solid
          color-mix(in srgb, var(--line, #dbe6ee) 94%, transparent);
        border-radius: 17px;
        padding: 13px 14px;
        background: var(--surface, #fff);
        color: var(--text, #14222e);
        font: inherit;
      }
      .primary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        border: 0;
        border-radius: 999px;
        padding: 14px 18px;
        background: linear-gradient(
          135deg,
          var(--brand, #a8793f),
          var(--brand-2, #d7b16d)
        );
        color: #1b1712;
        font: inherit;
        font-weight: 950;
        cursor: pointer;
        box-shadow: 0 16px 36px
          color-mix(in srgb, var(--brand, #a8793f) 24%, transparent);
      }
      .primary:disabled {
        cursor: not-allowed;
        opacity: 0.72;
      }
      .full {
        width: 100%;
      }
      .feedback {
        margin: 0;
        padding: 10px 12px;
        border-radius: 16px;
        font-weight: 900;
        line-height: 1.7;
      }
      .feedback.error {
        background: color-mix(
          in srgb,
          var(--danger, #ef4444) 12%,
          var(--surface, #fff)
        );
        color: #991b1b;
      }
      .feedback.success {
        background: color-mix(in srgb, #22c55e 16%, var(--surface, #fff));
        color: #166534;
      }
      @media (max-width: 560px) {
        .two-col {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class AuthDialogComponent {
  @Input() open = false;
  @Input() language: LanguageCode = "fa";
  @Output() closed = new EventEmitter<void>();

  mode = signal<AuthDialogMode>("login");
  loading = signal(false);
  feedback = signal<{ type: "success" | "error"; message: string } | null>(
    null,
  );
  form: AuthDialogModel = {
    firstName: "",
    lastName: "",
    phone: "",
    password: "",
    gender: 1,
  };

  copy = {
    title: text("ورود و عضویت", "Sign in and membership"),
    subtitle: text(
      "برای پیگیری درخواست تماس، ذخیره خدمات مورد علاقه و دریافت راهنمای درمان وارد شوید.",
      "Sign in to follow consultant calls, save favorite services and receive care guidance.",
    ),
    login: text("ورود", "Sign in"),
    register: text("عضویت", "Join"),
    firstName: text("نام", "First name"),
    lastName: text("نام خانوادگی", "Last name"),
    phone: text("شماره موبایل", "Mobile number"),
    password: text("رمز عبور", "Password"),
    gender: text("جنسیت", "Gender"),
    male: text("مرد", "Male"),
    female: text("زن", "Female"),
    loginAction: text("ورود به حساب", "Sign in"),
    registerAction: text("ساخت حساب", "Create account"),
    loading: text("در حال ارسال...", "Sending..."),
    registerSuccess: text(
      "ثبت نام با موفقیت انجام شد. برای دریافت توکن وارد حساب شوید.",
      "Registration succeeded. Please sign in to receive your token.",
    ),
  };

  constructor(
    private auth: AuthService,
    private router: Router,
    private toast: ToastService,
  ) {}

  switchMode(mode: AuthDialogMode): void {
    this.mode.set(mode);
    this.feedback.set(null);
  }

  submit(): void {
    this.feedback.set(null);

    const validationError = this.validate();
    if (validationError) {
      this.feedback.set({ type: "error", message: validationError });
      this.toast.error(validationError);
      return;
    }

    this.loading.set(true);

    if (this.mode() === "login") {
      this.auth
        .login(this.form.phone.trim(), this.form.password)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (user) => {
            this.resetForm();
            this.closed.emit();
            if (user.role === "consultant") {
              this.router.navigateByUrl(this.auth.dashboardUrl(user));
            }
          },
          error: (error) =>
            this.feedback.set({
              type: "error",
              message: this.errorMessage(error, "ورود انجام نشد"),
            }),
        });
      return;
    }

    this.auth
      .register(this.buildRegisterRequest())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.mode.set("login");
          this.form.password = "";
          this.feedback.set({
            type: "success",
            message:
              response.message || this.copy.registerSuccess[this.language],
          });
        },
        error: (error) =>
          this.feedback.set({
            type: "error",
            message: this.errorMessage(error, "ثبت نام انجام نشد"),
          }),
      });
  }

  validate(): string | null {
    const phone = this.form.phone.trim();
    if (!phone)
      return this.language === "fa"
        ? "شماره موبایل الزامی است"
        : "Mobile number is required";
    if (!/^09\d{9}$/.test(phone))
      return this.language === "fa"
        ? "شماره موبایل معتبر نیست"
        : "Mobile number is invalid";
    if (!this.form.password)
      return this.language === "fa"
        ? "رمز عبور الزامی است"
        : "Password is required";
    if (this.form.password.length < 8)
      return this.language === "fa"
        ? "رمز عبور باید حداقل ۸ کاراکتر باشد"
        : "Password must be at least 8 characters";
    if (this.form.password.length > 100)
      return this.language === "fa"
        ? "رمز عبور نباید بیشتر از ۱۰۰ کاراکتر باشد"
        : "Password must be at most 100 characters";

    if (this.mode() === "login") return null;

    if (!this.form.firstName.trim())
      return this.language === "fa"
        ? "نام الزامی است"
        : "First name is required";
    if (this.form.firstName.trim().length > 100)
      return this.language === "fa"
        ? "نام نباید بیشتر از ۱۰۰ کاراکتر باشد"
        : "First name must be at most 100 characters";
    if (!this.form.lastName.trim())
      return this.language === "fa"
        ? "نام خانوادگی الزامی است"
        : "Last name is required";
    if (this.form.lastName.trim().length > 100)
      return this.language === "fa"
        ? "نام خانوادگی نباید بیشتر از ۱۰۰ کاراکتر باشد"
        : "Last name must be at most 100 characters";
    if (![1, 2].includes(Number(this.form.gender)))
      return this.language === "fa" ? "جنسیت معتبر نیست" : "Gender is invalid";

    return null;
  }

  private buildRegisterRequest(): RegisterRequest {
    return {
      firstName: this.form.firstName.trim(),
      lastName: this.form.lastName.trim(),
      phoneNumber: this.form.phone.trim(),
      passwordHash: this.form.password,
      isCompleteProfile: true,
      avatarImageName: "default-register-avatar.png",
      gender: Number(this.form.gender),
      roleName: "Patient",
    };
  }

  private resetForm(): void {
    this.form = {
      firstName: "",
      lastName: "",
      phone: "",
      password: "",
      gender: 1,
    };
    this.feedback.set(null);
  }

  private errorMessage(error: unknown, fallback: string): string {
    return error instanceof Error && error.message ? error.message : fallback;
  }
}
