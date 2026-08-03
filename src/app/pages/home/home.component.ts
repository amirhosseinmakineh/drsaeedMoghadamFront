import { NgFor } from "@angular/common";
import { Component, signal } from "@angular/core";
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

@Component({
  selector: "app-home",
  standalone: true,
  imports: [
    NgFor,
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
  services = DENTAL_SERVICES;
  featuredServices = FEATURED_DENTAL_SERVICES;
  heroSlides = HERO_SLIDES;
  workSamples = WORK_SAMPLES;
  benefits = BENEFIT_CARDS;
  stats = STATS;
  faqs = GLOBAL_FAQS;

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
