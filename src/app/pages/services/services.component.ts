import { NgFor } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { DENTAL_SERVICES, LanguageCode, pickText } from '../../models/clinic.model';
import { FaIconComponent } from '../../shared/ui/fa-icon/fa-icon.component';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [NgFor, RouterLink, FaIconComponent],
  template: `
    <section class="page-section page-hero">
      <div class="section-heading">
        <p class="eyebrow">{{ language() === 'fa' ? 'کلینیک دندان‌پزشکی دکتر سعید مقدم' : 'Dr. Saeed Moghaddam Dental Clinic' }}</p>
        <h1>{{ language() === 'fa' ? 'خدمات دندان‌پزشکی دکتر سعید مقدم' : 'Dental services by Dr. Saeed Moghaddam' }}</h1>
        <p>{{ language() === 'fa'
          ? 'در این صفحه مسیرهای اصلی درمان، زیبایی و پیشگیری دندان‌پزشکی را می‌بینید و برای هر درمان توضیح دقیق، مراحل، مراقبت‌ها و سوالات پرتکرار در دسترس است.'
          : 'This page presents the main restorative, cosmetic and preventive dental care paths with focused explanations, steps, aftercare and common questions for each treatment.' }}</p>
      </div>
      <div class="hero-pattern">
        <app-fa-icon name="sparkle"></app-fa-icon>
        <span>{{ language() === 'fa' ? 'مشاهده درمان‌های کلینیک دکتر سعید مقدم' : 'View Dr. Saeed Moghaddam treatment paths' }}</span>
      </div>
    </section>

    <section class="page-section">
      <div class="service-grid">
        <article class="service-card" *ngFor="let service of services" [style.--accent]="service.accent">
          <img [src]="service.image" [alt]="pickText(service.title, language())" loading="lazy" />
          <span class="icon-bubble"><app-fa-icon [name]="service.icon"></app-fa-icon></span>
          <h2>{{ pickText(service.title, language()) }}</h2>
          <b>{{ pickText(service.subtitle, language()) }}</b>
          <p>{{ pickText(service.summary, language()) }}</p>
          <small>{{ pickText(service.cost, language()) }}</small>
          <a [routerLink]="['/services', service.id]">
            {{ language() === 'fa' ? 'مشاهده ' + pickText(service.title, language()) : 'View ' + pickText(service.title, language()) }}
            <app-fa-icon name="arrowLeft"></app-fa-icon>
          </a>
        </article>
      </div>
    </section>
  `,
  styles: [`
    .page-hero {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(260px, .45fr);
      gap: 24px;
      align-items: center;
      padding-top: 140px;
    }

    .page-hero h1 {
      margin: 0 0 16px;
      font-size: clamp(1.7rem, 3vw, 2.8rem);
    }

    .hero-pattern {
      display: grid;
      place-items: center;
      min-height: 280px;
      border: 1px solid var(--line);
      border-radius: 42px;
      background:
        radial-gradient(circle, color-mix(in srgb, var(--brand) 14%, transparent), transparent 62%),
        color-mix(in srgb, var(--surface) 82%, transparent);
      box-shadow: var(--shadow);
      color: var(--brand);
      font-weight: 950;
      text-align: center;
    }

    .hero-pattern app-fa-icon {
      font-size: 4rem;
      animation: pulse 2.4s ease-in-out infinite;
    }

    @keyframes pulse {
      50% {
        opacity: .7;
        transform: scale(1.08);
      }
    }

    @media (max-width: 820px) {
      .page-hero {
        grid-template-columns: 1fr;
        padding-top: 112px;
      }

      .hero-pattern {
        min-height: 180px;
      }
    }
  `]
})
export class ServicesComponent {
  language = signal<LanguageCode>('fa');
  services = DENTAL_SERVICES;
  protected readonly pickText = pickText;

  constructor(private title: Title, private meta: Meta) {
    this.updateSeo();
  }

  setLanguage(language: LanguageCode): void {
    this.language.set(language);
    this.updateSeo();
  }

  private updateSeo(): void {
    const isFa = this.language() === 'fa';
    this.title.setTitle(isFa ? 'خدمات دندان‌پزشکی | کلینیک دندان‌پزشکی دکتر سعید مقدم' : 'Dental services | Dr. Saeed Moghaddam Dental Clinic');
    this.meta.updateTag({
      name: 'description',
      content: isFa
        ? 'معرفی درمان‌های دندان‌پزشکی در کلینیک دندان‌پزشکی دکتر سعید مقدم؛ ایمپلنت، لمینت، کامپوزیت، ارتودنسی، بلیچینگ، درمان ریشه، کودکان و درمان لثه.'
        : 'Complete dental service list including implants, veneers, composite, orthodontics, whitening, root canal, pediatric care and gum treatment.'
    });
  }
}
