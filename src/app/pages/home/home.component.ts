import { NgFor, NgIf } from "@angular/common";
import { Component, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import {
  BENEFIT_CARDS,
  DENTAL_SERVICES,
  FEATURED_DENTAL_SERVICES,
  GLOBAL_FAQS,
  HERO_SLIDES,
  LeadFormModel,
  LanguageCode,
  STATS,
  WORK_SAMPLES,
  pickText,
} from "../../models/clinic.model";
import { FaIconComponent } from "../../shared/ui/fa-icon/fa-icon.component";
import { ToastService } from "../../core/toast/toast.service";
import { NG_MODEL_UPDATE_ON_BLUR } from "../../shared/forms/ng-model-options";
import { AnalyticsService } from "../../core/analytics/analytics.service";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [
    NgFor,
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
  leadFeedback = signal("");
  leadFeedbackType = signal<"success" | "error">("success");
  services = DENTAL_SERVICES;
  featuredServices = FEATURED_DENTAL_SERVICES;
  heroSlides = HERO_SLIDES;
  workSamples = WORK_SAMPLES;
  benefits = BENEFIT_CARDS;
  stats = STATS;
  faqs = GLOBAL_FAQS;
  lead: LeadFormModel = {
    fullName: "",
    phone: "",
    serviceId: DENTAL_SERVICES[0].id,
    message: "",
  };

  protected readonly pickText = pickText;
  readonly ngModelBlurOptions = NG_MODEL_UPDATE_ON_BLUR;

  constructor(
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

  submitLead(): void {
    const validationError = this.validateLeadForm();
    if (validationError) {
      this.analytics.track("consultation_form_submit", { service_name: this.lead.serviceId, cta_location: "home_form", result: "failure" });
      this.showLeadFeedback(validationError, "error");
      return;
    }

    this.leadSent.set(true);
    this.analytics.track("consultation_form_submit", { service_name: this.lead.serviceId, cta_location: "home_form", result: "success" });
    this.showLeadFeedback(
      this.language() === "fa"
        ? "درخواست تماس شما ثبت شد."
        : "Your call request has been recorded.",
      "success",
    );
  }

  validateLeadForm(): string | null {
    const isFa = this.language() === "fa";
    if (!this.lead.fullName.trim())
      return isFa ? "نام و نام خانوادگی الزامی است" : "Full name is required";
    if (this.lead.fullName.trim().length > 100)
      return isFa
        ? "نام نباید بیشتر از ۱۰۰ کاراکتر باشد"
        : "Full name must be at most 100 characters";
    if (!/^09\d{9}$/.test(this.lead.phone.trim()))
      return isFa ? "شماره تماس معتبر نیست" : "Phone number is invalid";
    if (!this.services.some((service) => service.id === this.lead.serviceId))
      return isFa ? "درمان مورد نظر معتبر نیست" : "Selected service is invalid";
    if (this.lead.message.trim().length > 1000)
      return isFa
        ? "توضیح کوتاه نباید بیشتر از ۱۰۰۰ کاراکتر باشد"
        : "Short note must be at most 1000 characters";
    return null;
  }

  private showLeadFeedback(message: string, type: "success" | "error"): void {
    this.leadFeedback.set(message);
    this.leadFeedbackType.set(type);
    if (type === "success") {
      this.toast.success(message);
      return;
    }
    this.toast.error(message);
  }

}
