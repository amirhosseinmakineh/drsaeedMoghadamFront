 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { EventEmitter, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { finalize } from "rxjs";



import {



  text,
} from "../models/clinic.model";
import { BaseDialogComponent } from "../shared/base/base-dialog/base-dialog.component";
import { FaIconComponent } from "../shared/ui/fa-icon/fa-icon.component";
import { NG_MODEL_UPDATE_ON_BLUR } from "../shared/forms/ng-model-options";

@Component({
  selector: "app-auth-dialog",
  standalone: true,
  imports: [FormsModule, BaseDialogComponent, FaIconComponent],
  templateUrl: "./auth-dialog.component.html",
  styleUrl: "./auth-dialog.component.scss",
})
export class AuthDialogComponent {
  Input() __init() {this.open = false}
  Input() __init2() {this.language = "fa"}
  Output() __init3() {this.closed = new EventEmitter()}

  __init4() {this.mode = signal("login")}
   __init5() {this.ngModelBlurOptions = NG_MODEL_UPDATE_ON_BLUR}
  __init6() {this.loading = signal(false)}
  __init7() {this.feedback = signal(
    null,
  )}
  __init8() {this.form = {
    firstName: "",
    lastName: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: 1,
  }}

  __init9() {this.copy = {
    title: text("ورود و عضویت", "Sign in and membership"),
    forgotTitle: text("فراموشی رمز عبور", "Forgot password"),
    subtitle: text(
      "برای پیگیری درخواست تماس، ذخیره خدمات مورد علاقه و دریافت راهنمای درمان وارد شوید.",
      "Sign in to follow consultant calls, save favorite services and receive care guidance.",
    ),
    forgotSubtitle: text(
      "شماره موبایلی که با آن وارد می‌شوید را وارد کنید و رمز عبور جدید تعیین کنید.",
      "Enter the mobile number you use to sign in and set a new password.",
    ),
    login: text("ورود", "Sign in"),
    register: text("عضویت", "Join"),
    firstName: text("نام", "First name"),
    lastName: text("نام خانوادگی", "Last name"),
    phone: text("شماره موبایل", "Mobile number"),
    password: text("رمز عبور", "Password"),
    newPassword: text("رمز عبور جدید", "New password"),
    confirmPassword: text("تکرار رمز عبور جدید", "Confirm new password"),
    gender: text("جنسیت", "Gender"),
    male: text("مرد", "Male"),
    female: text("زن", "Female"),
    loginAction: text("ورود به حساب", "Sign in"),
    registerAction: text("ساخت حساب", "Create account"),
    forgotAction: text("تغییر رمز عبور", "Change password"),
    forgotPassword: text("رمز عبور را فراموش کرده‌اید؟", "Forgot your password?"),
    backToLogin: text("بازگشت به ورود", "Back to sign in"),
    loading: text("در حال ارسال...", "Sending..."),
    forgotSuccess: text(
      "رمز عبور با موفقیت تغییر کرد. اکنون می‌توانید وارد شوید.",
      "Password changed successfully. You can now sign in.",
    ),
    registerSuccess: text(
      "ثبت نام با موفقیت انجام شد. برای دریافت توکن وارد حساب شوید.",
      "Registration succeeded. Please sign in to receive your token.",
    ),
  }}

  constructor(
     auth,
     router,
     toast,
     pushNotifications,
  ) {;this.auth = auth;this.router = router;this.toast = toast;this.pushNotifications = pushNotifications;AuthDialogComponent.prototype.__init.call(this);AuthDialogComponent.prototype.__init2.call(this);AuthDialogComponent.prototype.__init3.call(this);AuthDialogComponent.prototype.__init4.call(this);AuthDialogComponent.prototype.__init5.call(this);AuthDialogComponent.prototype.__init6.call(this);AuthDialogComponent.prototype.__init7.call(this);AuthDialogComponent.prototype.__init8.call(this);AuthDialogComponent.prototype.__init9.call(this);AuthDialogComponent.prototype.__init10.call(this);AuthDialogComponent.prototype.__init11.call(this);AuthDialogComponent.prototype.__init12.call(this);}

  __init10() {this.dialogTitle = () =>
    this.mode() === "forgot" ? this.copy.forgotTitle : this.copy.title}

  __init11() {this.dialogSubtitle = () =>
    this.mode() === "forgot" ? this.copy.forgotSubtitle : this.copy.subtitle}

  __init12() {this.submitLabel = () => {
    if (this.mode() === "login") return this.copy.loginAction;
    if (this.mode() === "forgot") return this.copy.forgotAction;
    return this.copy.registerAction;
  }}

  switchMode(mode) {
    this.mode.set(mode);
    this.feedback.set(null);
    if (mode === "login" || mode === "forgot") {
      this.form.password = "";
      this.form.confirmPassword = "";
    }
  }

    submit() {
        _optionalChain([(document.activeElement ), 'optionalAccess', _ => _.blur, 'call', _2 => _2()]);
    this.feedback.set(null);

    const validationError = this.validate();
    if (validationError) {
      this.feedback.set({ type: "error", message: validationError });
      this.toast.error(validationError);
      return;
    }

    this.loading.set(true);

    if (this.mode() === "forgot") {
      this.auth
        .forgotPassword(this.form.phone.trim(), this.form.password)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (response) => {
            this.mode.set("login");
            this.form.password = "";
            this.form.confirmPassword = "";
            this.feedback.set({
              type: "success",
              message: response.message || this.copy.forgotSuccess[this.language],
            });
            this.toast.success(
              response.message || this.copy.forgotSuccess[this.language],
            );
          },
          error: (error) =>
            this.feedback.set({
              type: "error",
              message: this.errorMessage(error, "تغییر رمز عبور انجام نشد"),
            }),
        });
      return;
    }

    if (this.mode() === "login") {
      this.auth
        .login(this.form.phone.trim(), this.form.password)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (user) => {
            this.resetForm();
            this.closed.emit();
            if (user.role === "consultant") {
              void this.pushNotifications.registerForConsultantOnLogin();
            } else {
              void this.pushNotifications.syncForCurrentProfile();
            }

            if (this.auth.needsRoleSelection(user)) {
              void this.router.navigateByUrl(this.auth.roleSelectionUrl());
              return;
            }

            const dashboardRoles = this.auth.selectableDashboardRoles(user);
            if (
              dashboardRoles.includes("consultant") ||
              dashboardRoles.includes("secretary") ||
              dashboardRoles.includes("admin")
            ) {
              void this.router.navigateByUrl(this.auth.dashboardUrl(user));
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
          this.form.confirmPassword = "";
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

  validate() {
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

    if (this.mode() === "forgot") {
      if (!this.form.confirmPassword)
        return this.language === "fa"
          ? "تکرار رمز عبور الزامی است"
          : "Password confirmation is required";
      if (this.form.password !== this.form.confirmPassword)
        return this.language === "fa"
          ? "رمز عبور و تکرار آن یکسان نیستند"
          : "Passwords do not match";
      return null;
    }

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

   buildRegisterRequest() {
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

   resetForm() {
    this.form = {
      firstName: "",
      lastName: "",
      phone: "",
      password: "",
      confirmPassword: "",
      gender: 1,
    };
    this.feedback.set(null);
  }

   errorMessage(error, fallback) {
    return error instanceof Error && error.message ? error.message : fallback;
  }
}
