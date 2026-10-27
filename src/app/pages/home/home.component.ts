import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { finalize, timeout, TimeoutError } from "rxjs";
import { environment } from "../../../environments/environment";
import { NgIf } from "@angular/common";
import { Component, signal } from "@angular/core";
import { FormsModule, NgForm } from "@angular/forms";
import { RouterLink } from "@angular/router";
import {
  BENEFIT_CARDS,
  DENTAL_SERVICES,
  FEATURED_DENTAL_SERVICES,
  GLOBAL_FAQS,
  HERO_SLIDES,
  LanguageCode,
  STATS,
  WORK_SAMPLES,
  pickText,
} from "../../models/clinic.model";
import { FaIconComponent } from "../../shared/ui/fa-icon/fa-icon.component";
import { ToastService } from "../../core/toast/toast.service";
import { AnalyticsService } from "../../core/analytics/analytics.service";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    RouterLink,
    FaIconComponent,
  ],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.scss",
})
export class HomeComponent {
  language = signal<LanguageCode>("fa");
  activeSlide = signal(0);
  activeWorkSample = signal(0);
  leadSent = signal(false);
  submitting = signal(false);
  private requestId = "";
  private submittedPayload = "";
  leadFeedback = signal("");
  leadFeedbackType = signal<"success" | "error">("success");
  services = DENTAL_SERVICES;
  featuredServices = FEATURED_DENTAL_SERVICES;
  heroSlides = HERO_SLIDES;
  workSamples = WORK_SAMPLES;
  benefits = BENEFIT_CARDS;
  stats = STATS;
  faqs = GLOBAL_FAQS;
  lead: { fullName: string; phone: string } = {
    fullName: "",
    phone: "",
  };

  protected readonly pickText = pickText;

  constructor(
    private http: HttpClient,
    private toast: ToastService,
    private analytics: AnalyticsService,
  ) {}

  setLanguage(language: LanguageCode): void {
    this.language.set(language);
  }

  nextSlide(direction: number): void {
    const next =
      (this.activeSlide() + direction + this.heroSlides.length) %
      this.heroSlides.length;
    this.activeSlide.set(next);
  }

  nextWorkSample(direction: number): void {
    const next =
      (this.activeWorkSample() + direction + this.workSamples.length) %
      this.workSamples.length;
    this.activeWorkSample.set(next);
  }

  openAuth(): void {
    window.dispatchEvent(new CustomEvent("open-auth-dialog"));
  }

  normalizePhone(value: string): string {
    let phone = value.trim().replace(/[۰-۹]/g, c => String(c.charCodeAt(0) - 1776))
      .replace(/[٠-٩]/g, c => String(c.charCodeAt(0) - 1632)).replace(/[\s()\-]/g, "");
    if (phone.startsWith("+98")) phone = "0" + phone.slice(3);
    else if (phone.startsWith("0098")) phone = "0" + phone.slice(4);
    else if (phone.startsWith("98") && phone.length === 12) phone = "0" + phone.slice(2);
    return phone;
  }

  submitLead(form?: NgForm): void {
    if (this.submitting() || this.leadSent()) return;
    const validationError = this.validateLeadForm();
    if (validationError) {
      this.analytics.track("consultation_form_submit", { cta_location: "home_form", result: "failure" });
      this.showLeadFeedback(validationError, "error");
      return;
    }

    const payload = {
      fullName: this.lead.fullName.trim().replace(/\s+/g, " "),
      phoneNumber: this.normalizePhone(this.lead.phone),
    };
    const signature = JSON.stringify(payload);
    // Generate only on browser submission; SSR never needs a UUID. Keep it on uncertain retries.
    if (!this.requestId || signature !== this.submittedPayload) this.requestId = globalThis.crypto.randomUUID();
    this.submittedPayload = signature;
    this.submitting.set(true);
    this.leadFeedback.set("");
    this.http.post<{ success: boolean }>(`${environment.apiBaseUrl}/consultation-requests`, {
      ...payload, requestId: this.requestId,
    }).pipe(timeout(20000), finalize(() => this.submitting.set(false))).subscribe({
      next: result => {
        if (result?.success !== true) {
          this.analytics.track("consultation_form_submit", { cta_location: "home_form", result: "failure" });
          this.showLeadFeedback("ثبت درخواست تأیید نشد؛ دوباره تلاش کنید.", "error");
          return;
        }
        this.leadSent.set(true);
        this.lead = { fullName: "", phone: "" };
        form?.resetForm({ leadFullName: "", leadPhone: "" });
        this.analytics.track("consultation_form_submit", { cta_location: "home_form", result: "success" });
        this.showLeadFeedback("درخواست مشاوره شما با موفقیت ثبت شد. همکاران ما با شما تماس خواهند گرفت.", "success");
      },
      error: (error: unknown) => {
        this.analytics.track("consultation_form_submit", { cta_location: "home_form", result: "failure" });
        this.showLeadFeedback(this.requestErrorMessage(error), "error");
      },
    });
  }

  validateLeadForm(): string | null {
    const name = this.lead.fullName.trim().replace(/\s+/g, " ");
    if (!name) return "نام و نام خانوادگی را وارد کنید.";
    if (name.length < 3 || (name.match(/\p{L}/gu) || []).length < 3 || !/^[\p{L}\p{M} \u200c'’\-]+$/u.test(name))
      return "نام و نام خانوادگی معتبر وارد کنید (۳ تا ۱۰۰ کاراکتر).";
    if (name.length > 100) return "نام و نام خانوادگی نباید بیشتر از ۱۰۰ کاراکتر باشد.";
    if (!this.lead.phone.trim()) return "شماره موبایل را وارد کنید.";
    if (!/^09[0-9]{9}$/.test(this.normalizePhone(this.lead.phone)))
      return "شماره موبایل معتبر ایران وارد کنید.";
    return null;
  }

  private requestErrorMessage(error: unknown): string {
    if (error instanceof TimeoutError)
      return "پاسخ سرور به‌موقع دریافت نشد؛ برای پیگیری همان درخواست دوباره تلاش کنید.";
    if (!(error instanceof HttpErrorResponse)) return "ثبت درخواست موقتاً امکان‌پذیر نیست؛ دوباره تلاش کنید.";
    if (error.status === 0) return "ارتباط با سرور برقرار نشد؛ اینترنت را بررسی و دوباره تلاش کنید.";
    const backendMessage = typeof error.error?.message === "string" ? error.error.message : null;
    if (error.status === 400) return backendMessage || "نام و شماره موبایل را بررسی و دوباره تلاش کنید.";
    if (error.status === 409) return backendMessage || "درخواست با این شماره قبلاً ثبت شده است؛ برای پیگیری با کلینیک تماس بگیرید.";
    if (error.status === 429) return "تعداد درخواست‌ها زیاد است؛ چند دقیقه دیگر تلاش کنید.";
    if (error.status === 503) return "ثبت درخواست موقتاً امکان‌پذیر نیست؛ دوباره تلاش کنید.";
    return "ثبت درخواست موقتاً امکان‌پذیر نیست؛ دوباره تلاش کنید.";
  }

  private showLeadFeedback(message: string, type: "success" | "error"): void {
    this.leadFeedback.set(message);
    this.leadFeedbackType.set(type);
    if (type === "success") this.toast.success(message);
  }

}
