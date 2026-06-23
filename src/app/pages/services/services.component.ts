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
        <p class="eyebrow">{{ language() === 'fa' ? 'همه خدمات' : 'All services' }}</p>
        <h1>{{ language() === 'fa' ? 'خدمات دندان‌پزشکی با صفحه اختصاصی برای هر نیاز' : 'Dental services with a dedicated page for every need' }}</h1>
        <p>{{ language() === 'fa'
          ? 'هر خدمت در این ساختار صفحه‌ی کامل خود را دارد تا کاربر پیش از تماس، مزایا، مراحل، مراقبت‌ها و محدودیت‌های درمان را بفهمد.'
          : 'Every service has a complete page so users understand benefits, steps, care and limits before contacting the clinic.' }}</p>
      </div>
      <div class="hero-pattern">
        <app-fa-icon name="sparkle"></app-fa-icon>
        <span>{{ language() === 'fa' ? 'SEO + Mobile app UX' : 'SEO + Mobile app UX' }}</span>
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
            {{ language() === 'fa' ? 'اطلاعات کامل خدمت' : 'Full service guide' }}
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
      font-size: clamp(2rem, 3.8vw, 3.55rem);
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
    this.title.setTitle(isFa ? 'خدمات دندان‌پزشکی | کلینیک دکتر سعید مقدم' : 'Dental services | Dr. Saeed Moghaddam Clinic');
    this.meta.updateTag({
      name: 'description',
      content: isFa
        ? 'لیست کامل خدمات دندان‌پزشکی شامل ایمپلنت، لمینت، کامپوزیت، ارتودنسی، سفید کردن دندان، درمان ریشه، کودکان و درمان لثه.'
        : 'Complete dental service list including implants, veneers, composite, orthodontics, whitening, root canal, pediatric care and gum treatment.'
    });
  }
}
