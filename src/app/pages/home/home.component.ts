import { HttpClient } from "@angular/common/http";
import { finalize, timeout } from "rxjs";
import { environment } from "../../../environments/environment";
import { NgFor, NgIf } from "@angular/common";
import { Component, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Meta, Title } from "@angular/platform-browser";
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
  submitting = signal(false);
  servicesLoading = signal(false);
  servicesError = signal(false);
  consultationServices = signal<{id: number; title: string}[]>([]);
  consultationServiceId: number | null = null;
  private requestId = crypto.randomUUID();
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
  lead: { fullName: string; phone: string; message: string } = {
    fullName: "",
    phone: "",
    message: "",
  };

  protected readonly pickText = pickText;

  constructor(
    private http: HttpClient,
    private title: Title,
    private meta: Meta,
    private toast: ToastService,
  ) {
    this.updateSeo();
    this.loadConsultationServices();
  }

  setLanguage(language: LanguageCode): void {
    this.language.set(language);
    this.updateSeo();
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

  loadConsultationServices(): void {
    this.servicesLoading.set(true);
    this.servicesError.set(false);
    this.http.get<{id: number; title: string}[]>(`${environment.apiBaseUrl}/consultation-requests/services`)
      .pipe(timeout(20000), finalize(() => this.servicesLoading.set(false)))
      .subscribe({next: data => this.consultationServices.set(data), error: () => this.servicesError.set(true)});
  }

  normalizePhone(value: string): string {
    let phone = value.replace(/[۰-۹]/g, c => String(c.charCodeAt(0) - 1776))
      .replace(/[٠-٩]/g, c => String(c.charCodeAt(0) - 1632)).replace(/[\s()\-]/g, "");
    if (phone.startsWith("+98")) phone = "0" + phone.slice(3);
    else if (phone.startsWith("0098")) phone = "0" + phone.slice(4);
    else if (phone.startsWith("98") && phone.length === 12) phone = "0" + phone.slice(2);
    return phone;
  }

  submitLead(): void {
    if (this.submitting() || this.leadSent()) return;
    const validationError = this.validateLeadForm();
    if (validationError) { this.showLeadFeedback(validationError, "error"); return; }
    const payload = {fullName: this.lead.fullName.trim().replace(/\s+/g, " "),
      phoneNumber: this.normalizePhone(this.lead.phone), serviceId: this.consultationServiceId, notes: this.lead.message.trim()};
    const signature = JSON.stringify(payload);
    if (this.submittedPayload && signature !== this.submittedPayload) this.requestId = crypto.randomUUID();
    this.submittedPayload = signature;
    this.submitting.set(true);
    this.leadFeedback.set("");
    this.http.post<{success: boolean}>(`${environment.apiBaseUrl}/consultation-requests`, {...payload, requestId: this.requestId})
      .pipe(timeout(20000), finalize(() => this.submitting.set(false)))
      .subscribe({
        next: result => {
          if (!result.success) { this.showLeadFeedback("ثبت درخواست تأیید نشد؛ دوباره تلاش کنید.", "error"); return; }
          this.leadSent.set(true);
          this.showLeadFeedback("درخواست مشاوره شما با موفقیت ثبت شد. همکاران ما برای هماهنگی با شما تماس خواهند گرفت.", "success");
        },
        error: error => this.showLeadFeedback(error.status === 429 ? "تعداد درخواست‌ها زیاد است؛ چند دقیقه دیگر تلاش کنید."
          : error.status === 0 ? "ارتباط با سرور برقرار نشد؛ اینترنت را بررسی و دوباره تلاش کنید."
          : error.error?.message || "ثبت درخواست موقتاً امکان‌پذیر نیست؛ دوباره تلاش کنید.", "error")
      });
  }

  validateLeadForm(): string | null {
    const isFa = this.language() === "fa";
    if (this.lead.fullName.trim().length < 3 || (this.lead.fullName.match(/\p{L}/gu) || []).length < 3 || !/^[\p{L}\p{M} \u200c'’\-]+$/u.test(this.lead.fullName.trim()))
      return isFa ? "نام و نام خانوادگی الزامی است" : "Full name is required";
    if (this.lead.fullName.trim().length > 100)
      return isFa
        ? "نام نباید بیشتر از ۱۰۰ کاراکتر باشد"
        : "Full name must be at most 100 characters";
    if (!/^09[0-9]{9}$/.test(this.normalizePhone(this.lead.phone)))
      return isFa ? "شماره تماس معتبر نیست" : "Phone number is invalid";
    if (!this.consultationServices().some((service) => service.id === this.consultationServiceId))
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

  private updateSeo(): void {
    const isFa = this.language() === "fa";
    const pageTitle = isFa
      ? "دکتر سعید مقدم | کامپوزیت، لمینت و بلیچینگ دندان"
      : "Dr. Saeed Moghaddam | Veneers & Teeth Whitening";
    const description = isFa
      ? "وب‌سایت دکتر سعید مقدم (سعید مقدم)؛ راهنمای کامپوزیت ونیر، لمینت سرامیکی و بلیچینگ دندان، مقایسه روش‌ها، مراقبت، نمونه‌کار و درخواست تماس."
      : "Dr. Saeed Moghaddam’s guide to composite and porcelain veneers and professional teeth whitening, including comparison, aftercare and call requests.";
    const canonicalUrl = `${window.location.origin}/`;

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: "description", content: description });
    this.meta.updateTag({ name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" });
    this.meta.updateTag({ property: "og:locale", content: isFa ? "fa_IR" : "en_US" });
    this.meta.updateTag({ property: "og:type", content: "website" });
    this.meta.updateTag({ property: "og:title", content: pageTitle });
    this.meta.updateTag({ property: "og:description", content: description });
    this.meta.updateTag({ property: "og:url", content: canonicalUrl });
    this.meta.updateTag({ property: "og:image", content: `${window.location.origin}/images/1-960.png` });
    this.meta.updateTag({ name: "twitter:card", content: "summary_large_image" });
    this.meta.updateTag({ name: "twitter:title", content: pageTitle });
    this.meta.updateTag({ name: "twitter:description", content: description });
    this.setCanonical(canonicalUrl);
    this.setStructuredData(canonicalUrl, description, isFa);
  }
  private setCanonical(url: string): void {
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = url;
  }

  private setStructuredData(url: string, description: string, isFa: boolean): void {
    const data = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": `${url}#website`,
          url,
          name: isFa ? "کلینیک دندان‌پزشکی دکتر سعید مقدم" : "Dr. Saeed Moghaddam Dental Clinic",
          inLanguage: isFa ? "fa-IR" : "en-US",
        },
        {
          "@type": "MedicalWebPage",
          "@id": `${url}#webpage`,
          url,
          name: this.title.getTitle(),
          description,
          inLanguage: isFa ? "fa-IR" : "en-US",
          isPartOf: { "@id": `${url}#website` },
          about: ["دکتر سعید مقدم", "سعید مقدم", "کامپوزیت ونیر", "لمینت سرامیکی", "بلیچینگ دندان"],
          mainEntity: { "@id": `${url}#doctor` },
          lastReviewed: "2026-07-25",
        },
        {
          "@type": "Dentist",
          "@id": `${url}#clinic`,
          name: isFa ? "کلینیک دندان‌پزشکی دکتر سعید مقدم" : "Dr. Saeed Moghaddam Dental Clinic",
          alternateName: isFa ? "کلینیک سعید مقدم" : "Saeed Moghaddam Dental Clinic",
          url,
          image: `${window.location.origin}/images/1-960.png`,
          medicalSpecialty: "Dentistry",
          founder: { "@id": `${url}#doctor` },
        },
        {
          "@type": "Person",
          "@id": `${url}#doctor`,
          name: isFa ? "دکتر سعید مقدم" : "Dr. Saeed Moghaddam",
          alternateName: isFa ? "سعید مقدم" : "Saeed Moghaddam",
          url: `${url}about`,
          worksFor: { "@id": `${url}#clinic` },
          knowsAbout: ["Cosmetic dentistry", "Composite veneers", "Porcelain veneers", "Teeth whitening"],
        },
      ],
    };
    let script = document.querySelector<HTMLScriptElement>("#home-structured-data");
    if (!script) {
      script = document.createElement("script");
      script.id = "home-structured-data";
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
  }

}
