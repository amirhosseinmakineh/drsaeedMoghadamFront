import { Component, signal } from "@angular/core";
import { NgFor } from "@angular/common";
import { Meta, Title } from "@angular/platform-browser";
import { LanguageCode } from "../../models/clinic.model";
import { FaIconComponent } from "../../shared/ui/fa-icon/fa-icon.component";

@Component({
  selector: "app-contact",
  standalone: true,
  imports: [NgFor, FaIconComponent],
  templateUrl: "./contact.component.html",
  styleUrl: "./contact.component.scss",
})
export class ContactComponent {
  language = signal<LanguageCode>("fa");
  infoItems = [
    {
      icon: "user",
      title: { fa: "ثبت اطلاعات بیمار", en: "Patient details" },
      text: {
        fa: "اطلاعات مراجعه‌کننده در حساب کاربری ثبت می‌شود تا درخواست قابل پیگیری باشد.",
        en: "Patient details are submitted through an account so the request remains traceable.",
      },
    },
    {
      icon: "phone",
      title: { fa: "هماهنگی مراجعه", en: "Visit coordination" },
      text: {
        fa: "پس از ثبت درخواست، وضعیت هماهنگی و اطلاعات مراجعه از مسیر حساب کاربری پیگیری می‌شود.",
        en: "After submitting a request, coordination status and visit details can be followed through the account.",
      },
    },
    {
      icon: "tooth",
      title: { fa: "معاینه دندان‌پزشکی", en: "Dental examination" },
      text: {
        fa: "نوع درمان، تعداد جلسات و هزینه نهایی پس از معاینه و طرح درمان مشخص می‌شود.",
        en: "Treatment, visit count and final fees are confirmed after examination and treatment planning.",
      },
    },
  ];

  constructor(private title: Title, private meta: Meta) {
    this.updateSeo();
  }

  setLanguage(language: LanguageCode): void {
    this.language.set(language);
    this.updateSeo();
  }

  openAuth(): void {
    window.dispatchEvent(new CustomEvent("open-auth-dialog"));
  }

  private updateSeo(): void {
    const isFa = this.language() === "fa";
    this.title.setTitle(
      isFa
        ? "درخواست نوبت دندان‌پزشکی | دکتر سعید مقدم"
        : "Dental appointment request | Dr. Saeed Moghaddam",
    );
    this.meta.updateTag({
      name: "description",
      content: isFa
        ? "راهنمای ثبت درخواست نوبت، پیگیری مراجعه و معاینه برای خدمات کامپوزیت، لمینت و بلیچینگ دکتر سعید مقدم."
        : "How to request and follow a dental appointment for composite veneers, porcelain veneers and bleaching with Dr. Saeed Moghaddam.",
    });
  }
}
