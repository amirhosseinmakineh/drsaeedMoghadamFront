import { NgFor } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { FEATURED_DENTAL_SERVICES, LanguageCode, pickText } from '../../models/clinic.model';
import { FaIconComponent } from '../../shared/ui/fa-icon/fa-icon.component';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [NgFor, RouterLink, FaIconComponent],
  template: `
    <section class="page-section page-hero">
      <div class="section-heading">
        <h1>{{ language() === 'fa' ? 'خدمات زیبایی دندان دکتر سعید مقدم' : 'Cosmetic dental services by Dr. Saeed Moghaddam' }}</h1>
        <p>{{ language() === 'fa'
          ? 'در این صفحه سه مسیر اصلی کامپوزیت ونیر، لمینت سرامیکی و بلیچینگ دندان را می‌بینید؛ برای هر خدمت کاربرد، مراحل، مراقبت‌ها، محدودیت‌ها و سوالات پرتکرار با رویکرد سلامت‌محور توضیح داده شده است.'
          : 'This page presents composite veneers, porcelain veneers and dental bleaching, with indications, steps, aftercare, limits and common questions explained through a health-first approach.' }}</p>
      </div>
    </section>

    <section class="page-section">
      <div class="service-grid">
        <article class="service-card" *ngFor="let service of services" [style.--accent]="service.accent">
          @switch (service.id) {
            @case ('laminate') {
              <img
                src="/2.png"
                width="1310"
                height="1200"
                [alt]="pickText(service.title, language())"
                loading="lazy"
                decoding="async"
                fetchpriority="low"
              />
            }
            @case ('composite') {
              <img
                src="/3.png"
                width="1310"
                height="1201"
                [alt]="pickText(service.title, language())"
                loading="lazy"
                decoding="async"
                fetchpriority="low"
              />
            }
            @case ('orthodontics') {
              <img
                src="/4.png"
                width="1310"
                height="1200"
                [alt]="pickText(service.title, language())"
                loading="lazy"
                decoding="async"
                fetchpriority="low"
              />
            }
            @case ('whitening') {
              <img
                src="/5.png"
                width="1310"
                height="1201"
                [alt]="pickText(service.title, language())"
                loading="lazy"
                decoding="async"
                fetchpriority="low"
              />
            }
            @case ('root-canal') {
              <img
                src="/6.png"
                width="1310"
                height="1201"
                [alt]="pickText(service.title, language())"
                loading="lazy"
                decoding="async"
                fetchpriority="low"
              />
            }
            @default {
              <img
                src="/1.png"
                width="1361"
                height="1156"
                [alt]="pickText(service.title, language())"
                loading="lazy"
                decoding="async"
                fetchpriority="low"
              />
            }
          }
          <span class="icon-bubble"><app-fa-icon [name]="service.icon"></app-fa-icon></span>
          <h3>{{ pickText(service.title, language()) }}</h3>
          <b>{{ pickText(service.subtitle, language()) }}</b>
          <p>{{ pickText(service.summary, language()) }}</p>
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
  `]
})
export class ServicesComponent {
  language = signal<LanguageCode>('fa');
  services = FEATURED_DENTAL_SERVICES;
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
    this.title.setTitle(isFa ? 'خدمات زیبایی دندان | کلینیک دندان‌پزشکی دکتر سعید مقدم' : 'Cosmetic dental services | Dr. Saeed Moghaddam Dental Clinic');
    this.meta.updateTag({
      name: 'description',
      content: isFa
        ? 'معرفی خدمات زیبایی دندان در کلینیک دندان‌پزشکی دکتر سعید مقدم؛ کامپوزیت ونیر، لمینت سرامیکی و بلیچینگ دندان با توضیح سلامت‌محور.'
        : 'Cosmetic dental service list at Dr. Saeed Moghaddam Dental Clinic: composite veneers, porcelain veneers and dental bleaching with health-first guidance.'
    });
  }
}
