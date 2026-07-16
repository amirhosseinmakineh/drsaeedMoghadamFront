import { Component } from "@angular/core";
import { NgFor } from "@angular/common";
import { RouterLink } from "@angular/router";
import { Meta, Title } from "@angular/platform-browser";
import { signal } from "@angular/core";
import { LanguageCode, pickText, text } from "../../models/clinic.model";
import { FaIconComponent } from "../../shared/ui/fa-icon/fa-icon.component";

@Component({
  selector: "app-about",
  standalone: true,
  imports: [NgFor, RouterLink, FaIconComponent],
  templateUrl: "./about.component.html",
  styles: [
    `
      .about-hero {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(300px, 0.55fr);
        gap: 28px;
        align-items: center;
        padding-top: 140px;
      }

      .about-hero h1 {
        margin: 0 0 16px;
        font-size: clamp(2rem, 3.8vw, 3.55rem);
      }

      .doctor-card {
        padding: 30px;
        border: 1px solid var(--line);
        border-radius: 42px;
        background: var(--surface);
        box-shadow: var(--shadow);
      }

      .doctor-card .icon-bubble {
        width: 76px;
        height: 76px;
        font-size: 2.2rem;
      }

      .story-panel {
        display: grid;
        grid-template-columns: minmax(0, 0.75fr) minmax(0, 1fr);
        gap: 26px;
        align-items: center;
        padding: 38px;
        border: 1px solid var(--line);
        border-radius: 42px;
        background: color-mix(in srgb, var(--surface) 82%, transparent);
        box-shadow: var(--shadow);
      }

      @media (max-width: 820px) {
        .about-hero,
        .story-panel {
          grid-template-columns: 1fr;
          padding-top: 112px;
        }

        .story-panel {
          padding: 24px;
        }
      }
    `,
  ],
})
export class AboutComponent {
  language = signal<LanguageCode>("fa");
  protected readonly pickText = pickText;
  values = [
    {
      icon: "shield",
      title: text("صداقت درمانی", "Clinical honesty"),
      text: text(
        "اگر درمانی برای بیمار مناسب نباشد، به همان شفافیت توضیح داده می‌شود.",
        "If a treatment is not suitable, it is explained with the same clarity.",
      ),
    },
    {
      icon: "sparkle",
      title: text("زیبایی طبیعی", "Natural aesthetics"),
      text: text(
        "هدف، لبخندی هماهنگ با چهره است؛ نه نتیجه اغراق‌آمیز و مصنوعی.",
        "The goal is a smile that fits the face, not an exaggerated artificial result.",
      ),
    },
    {
      icon: "tooth",
      title: text("مسیر روشن درمان", "Clear care path"),
      text: text(
        "از مشاهده خدمات تا ثبت درخواست تماس مشاور، مسیر باید ساده، دقیق و متناسب با نیاز دندان‌پزشکی بیمار باشد.",
        "From viewing services to submitting a consultant call request, the path should be simple, precise and aligned with the patient’s dental need.",
      ),
    },
    {
      icon: "heart",
      title: text("آرامش بیمار", "Patient calm"),
      text: text(
        "توضیح مرحله‌ها و کنترل اضطراب بخش مهمی از درمان است.",
        "Explaining steps and managing anxiety is an important part of care.",
      ),
    },
  ];

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

  openAuth(): void {
    window.dispatchEvent(new CustomEvent("open-auth-dialog"));
  }

  private updateSeo(): void {
    const isFa = this.language() === "fa";
    this.title.setTitle(
      isFa
        ? "درباره ما | کلینیک دندان‌پزشکی دکتر سعید مقدم"
        : "About us | Dr. Saeed Moghaddam Dental Clinic",
    );
    this.meta.updateTag({
      name: "description",
      content: isFa
        ? "معرفی کلینیک دندان‌پزشکی دکتر سعید مقدم، ارزش‌ها، رویکرد درمانی و تمرکز بر زیبایی طبیعی و آرامش بیمار."
        : "About Dr. Saeed Moghaddam Dental Clinic, values, care philosophy and focus on natural aesthetics and patient calm.",
    });
  }
}
