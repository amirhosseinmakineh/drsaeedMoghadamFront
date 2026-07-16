import { Component, signal } from "@angular/core";
import { NgFor, NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Meta, Title } from "@angular/platform-browser";
import {
  ContactFormModel,
  DENTAL_SERVICES,
  LanguageCode,
  pickText,
} from "../../models/clinic.model";
import { BaseDatepickerComponent } from "../../shared/base/base-datepicker/base-datepicker.component";
import { FaIconComponent } from "../../shared/ui/fa-icon/fa-icon.component";
import { ToastService } from "../../core/toast/toast.service";
import { NG_MODEL_UPDATE_ON_BLUR } from "../../shared/forms/ng-model-options";

@Component({
  selector: "app-contact",
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, BaseDatepickerComponent, FaIconComponent],
  templateUrl: "./contact.component.html",
  styles: [
    `
      .contact-hero {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 22px;
        align-items: end;
        padding-top: 140px;
      }

      .contact-hero h1 {
        margin: 0 0 16px;
        font-size: clamp(2rem, 3.8vw, 3.55rem);
      }

      .contact-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }

      .contact-layout {
        display: grid;
        grid-template-columns: minmax(290px, 0.8fr) minmax(0, 1.2fr);
        gap: 24px;
      }

      .info-panel,
      .contact-form {
        display: grid;
        gap: 14px;
      }

      .info-panel article,
      .map-card,
      .contact-form {
        padding: 22px;
        border: 1px solid var(--line);
        border-radius: 30px;
        background: var(--surface);
        box-shadow: var(--shadow);
      }

      .info-panel article {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 14px;
      }

      .info-panel h3,
      .info-panel p {
        margin: 0;
      }

      .map-card {
        display: grid;
        place-items: center;
        min-height: 230px;
        color: var(--muted);
        text-align: center;
      }

      .map-card app-fa-icon {
        color: var(--brand);
        font-size: 3rem;
      }

      .map-card strong {
        color: var(--text);
      }

      .contact-form label {
        display: grid;
        gap: 8px;
        color: var(--muted);
        font-weight: 900;
      }

      .success-message {
        margin: 0;
        padding: 12px 14px;
        border-radius: 18px;
        background: color-mix(in srgb, #22c55e 14%, var(--surface));
        color: var(--text);
        font-weight: 800;
      }

      @media (max-width: 860px) {
        .contact-hero,
        .contact-layout {
          grid-template-columns: 1fr;
        }

        .contact-hero {
          padding-top: 112px;
        }
      }
    `,
  ],
})
export class ContactComponent {
  language = signal<LanguageCode>("fa");
  sent = signal(false);
  feedback = signal("");
  feedbackType = signal<"success" | "error">("success");
  services = DENTAL_SERVICES;
  form: ContactFormModel = {
    fullName: "",
    phone: "",
    serviceId: DENTAL_SERVICES[0].id,
    message: "",
  };
  protected readonly pickText = pickText;
  readonly ngModelBlurOptions = NG_MODEL_UPDATE_ON_BLUR;
  infoItems = [
    {
      icon: "phone",
      title: { fa: "تماس مشاور", en: "Consultant call" },
      text: {
        fa: "شماره خود را ثبت کنید تا برای راهنمایی اولیه تماس گرفته شود.",
        en: "Leave your number for an initial guidance call.",
      },
    },
    {
      icon: "location",
      title: { fa: "مراجعه حضوری", en: "In-person visit" },
      text: {
        fa: "مسیر مراجعه پس از هماهنگی با کلینیک اعلام می‌شود.",
        en: "Visit directions are shared after clinic coordination.",
      },
    },
    {
      icon: "clock",
      title: { fa: "ساعات پاسخگویی", en: "Response hours" },
      text: {
        fa: "شنبه تا پنجشنبه، ۹ تا ۲۰",
        en: "Saturday to Thursday, 9:00 to 20:00",
      },
    },
  ];

  constructor(
    private title: Title,
    private meta: Meta,
    private toast: ToastService,
  ) {
    this.updateSeo();
  }

  setLanguage(language: LanguageCode): void {
    this.language.set(language);
    this.updateSeo();
  }

  submit(): void {
    const validationError = this.validateContactForm();
    if (validationError) {
      this.showFeedback(validationError, "error");
      return;
    }

    this.sent.set(true);
    this.showFeedback(
      this.language() === "fa"
        ? "درخواست شما ثبت شد."
        : "Your request has been recorded.",
      "success",
    );
  }

  validateContactForm(): string | null {
    const isFa = this.language() === "fa";
    if (!this.form.fullName.trim())
      return isFa ? "نام و نام خانوادگی الزامی است" : "Full name is required";
    if (this.form.fullName.trim().length > 100)
      return isFa
        ? "نام نباید بیشتر از ۱۰۰ کاراکتر باشد"
        : "Full name must be at most 100 characters";
    if (!/^09\d{9}$/.test(this.form.phone.trim()))
      return isFa ? "شماره موبایل معتبر نیست" : "Mobile number is invalid";
    if (!this.services.some((service) => service.id === this.form.serviceId))
      return isFa ? "درمان مورد نظر معتبر نیست" : "Selected service is invalid";
    if (this.form.message.trim().length > 1000)
      return isFa
        ? "پیام کوتاه نباید بیشتر از ۱۰۰۰ کاراکتر باشد"
        : "Short message must be at most 1000 characters";
    return null;
  }

  private showFeedback(message: string, type: "success" | "error"): void {
    this.feedback.set(message);
    this.feedbackType.set(type);
    if (type === "success") {
      this.toast.success(message);
      return;
    }
    this.toast.error(message);
  }

  openAuth(): void {
    window.dispatchEvent(new CustomEvent("open-auth-dialog"));
  }

  private updateSeo(): void {
    const isFa = this.language() === "fa";
    this.title.setTitle(
      isFa
        ? "تماس با ما | کلینیک دندان‌پزشکی دکتر سعید مقدم"
        : "Contact us | Dr. Saeed Moghaddam Dental Clinic",
    );
    this.meta.updateTag({
      name: "description",
      content: isFa
        ? "فرم درخواست تماس مشاور، ساعات پاسخگویی و راهنمای هماهنگی مراجعه کلینیک دندان‌پزشکی دکتر سعید مقدم."
        : "Consultant call request form, response hours and visit coordination guidance for Dr. Saeed Moghaddam Dental Clinic.",
    });
  }
}
