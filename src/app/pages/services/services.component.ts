import { NgFor } from "@angular/common";
import { Component, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { Meta, Title } from "@angular/platform-browser";
import {
  FEATURED_DENTAL_SERVICES,
  LanguageCode,
  pickText,
} from "../../models/clinic.model";
import { FaIconComponent } from "../../shared/ui/fa-icon/fa-icon.component";

@Component({
  selector: "app-services",
  standalone: true,
  imports: [NgFor, RouterLink, FaIconComponent],
  templateUrl: "./services.component.html",
  styles: [
    `
      .page-hero {
        padding-top: 140px;
      }

      .page-hero h1 {
        margin: 0 0 16px;
        font-size: clamp(1.7rem, 3vw, 2.8rem);
      }

      @media (max-width: 820px) {
        .page-hero {
          padding-top: 112px;
        }
      }
    `,
  ],
})
export class ServicesComponent {
  language = signal<LanguageCode>("fa");
  services = FEATURED_DENTAL_SERVICES;
  protected readonly pickText = pickText;

  constructor(
    private title: Title,
    private meta: Meta,
  ) {
    this.updateSeo();
  }

  setLanguage(language: LanguageCode): void {
    this.language.set(language);
    this.updateSeo();
  }

  private updateSeo(): void {
    const isFa = this.language() === "fa";
    this.title.setTitle(
      isFa
        ? "خدمات زیبایی دندان | کلینیک دندان‌پزشکی دکتر سعید مقدم"
        : "Cosmetic dental services | Dr. Saeed Moghaddam Dental Clinic",
    );
    this.meta.updateTag({
      name: "description",
      content: isFa
        ? "معرفی خدمات زیبایی دندان در کلینیک دندان‌پزشکی دکتر سعید مقدم؛ کامپوزیت ونیر، لمینت سرامیکی و بلیچینگ دندان با توضیح سلامت‌محور."
        : "Cosmetic dental service list at Dr. Saeed Moghaddam Dental Clinic: composite veneers, porcelain veneers and dental bleaching with health-first guidance.",
    });
  }
}
