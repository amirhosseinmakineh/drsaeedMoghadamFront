import { Component, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { NgFor } from '@angular/common';
import { ClinicDataService } from '../../services/clinic-data.service';
import { Service } from '../../models/clinic.model';
import { BeforeAfterSliderComponent } from '../../shared/ui/before-after-slider/before-after-slider.component';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [RouterLink, NgFor, BeforeAfterSliderComponent],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  template: `
    @if (service) {
      <div class="detail-hero" @fadeIn>
        <img [src]="service.heroImage" [alt]="service.title" />
        <div class="detail-hero-overlay">
          <span class="detail-label">خدمات</span>
          <h1 class="detail-title">{{ service.title }}</h1>
          <p class="detail-desc">{{ service.subtitle }}</p>
        </div>
      </div>

      <section class="detail-body" @fadeIn>
        <div class="detail-grid">
          <div class="detail-main">
            <h2>توضیحات کامل</h2>
            <p class="detail-full">{{ service.fullDescription }}</p>

            <h2>مراحل درمان</h2>
            <div class="timeline">
              <div class="timeline-item" *ngFor="let step of service.steps">
                <span class="timeline-step">{{ step.step }}</span>
                <div class="timeline-content">
                  <h4>{{ step.title }}</h4>
                  <p>{{ step.description }}</p>
                </div>
              </div>
            </div>

            <h2>نمونه قبل و بعد</h2>
            <app-before-after-slider
              [beforeImage]="service.beforeImage"
              [afterImage]="service.afterImage"
              [title]="service.title">
            </app-before-after-slider>

            <h2>سوالات متداول</h2>
            <div class="faq-list">
              <div class="faq-item" *ngFor="let faq of service.faqs">
                <span class="faq-q">{{ faq.question }}</span>
                <p class="faq-a">{{ faq.answer }}</p>
              </div>
            </div>
          </div>

          <aside class="detail-sidebar">
            <div class="sidebar-card">
              <h3>اطلاعات سرویس</h3>
              <div class="sidebar-row">
                <span class="sidebar-label">هزینه</span>
                <span class="sidebar-value">{{ service.price }}</span>
              </div>
              <div class="sidebar-row">
                <span class="sidebar-label">مدت زمان</span>
                <span class="sidebar-value">{{ service.duration }}</span>
              </div>
              <div class="sidebar-row">
                <span class="sidebar-label">نرخ موفقیت</span>
                <span class="sidebar-value">۹۸٪</span>
              </div>
              <a class="sidebar-cta" routerLink="/booking">رزرو مشاوره رایگان</a>
            </div>

            <div class="sidebar-card features-card">
              <h3>ویژگی‌ها</h3>
              <ul class="feature-list">
                <li *ngFor="let f of service.features">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  {{ f }}
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    }

    @if (relatedServices.length) {
      <section class="related-section" @fadeIn>
        <div class="section-header">
          <h2>خدمات دیگر</h2>
          <p>درمان‌های تخصصی دیگر کلینیک دکتر مقدم</p>
        </div>
        <div class="related-grid">
          <a class="related-card" *ngFor="let s of relatedServices" [routerLink]="'/services/' + s.id">
            <div class="related-image">
              <img [src]="s.image" [alt]="s.title" loading="lazy" />
            </div>
            <span class="related-title">{{ s.title }}</span>
            <span class="related-price">{{ s.price }}</span>
          </a>
        </div>
      </section>
    }
  `,
  styles: [`
    .detail-hero {
      position: relative;
      height: 480px;
      overflow: hidden;
    }
    .detail-hero img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .detail-hero-overlay {
      position: absolute;
      bottom: 0;
      right: 0;
      left: 0;
      padding: 48px 24px 40px;
      background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 60%, transparent 100%);
      color: #fff;
      text-align: center;
    }
    .detail-label {
      display: inline-block;
      background: rgba(255,255,255,0.2);
      backdrop-filter: blur(10px);
      padding: 6px 14px;
      border-radius: 16px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 14px;
    }
    .detail-title {
      font-size: clamp(28px, 5vw, 44px);
      font-weight: 800;
      margin: 0 0 12px;
      line-height: 1.2;
    }
    .detail-desc {
      font-size: 16px;
      color: rgba(255,255,255,0.85);
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
    }
    .detail-body {
      max-width: 1100px;
      margin: 0 auto;
      padding: 48px 24px;
    }
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 40px;
    }
    .detail-main h2 {
      font-size: 24px;
      font-weight: 800;
      color: #2c2c2c;
      margin: 40px 0 16px;
    }
    .detail-main h2:first-child {
      margin-top: 0;
    }
    .detail-full {
      font-size: 15px;
      color: #555;
      line-height: 1.8;
      margin: 0 0 24px;
    }
    .timeline {
      display: flex;
      flex-direction: column;
      gap: 20px;
      position: relative;
      margin-bottom: 24px;
    }
    .timeline::before {
      content: '';
      position: absolute;
      right: 19px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #eee;
    }
    .timeline-item {
      display: flex;
      gap: 20px;
      align-items: flex-start;
      position: relative;
      z-index: 1;
    }
    .timeline-step {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #0066cc;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .timeline-content h4 {
      font-size: 16px;
      font-weight: 700;
      color: #2c2c2c;
      margin: 0 0 6px;
    }
    .timeline-content p {
      font-size: 14px;
      color: #777;
      line-height: 1.6;
      margin: 0;
    }
    .faq-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .faq-item {
      background: #fff;
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.04);
    }
    .faq-q {
      display: block;
      font-size: 15px;
      font-weight: 700;
      color: #2c2c2c;
      margin-bottom: 8px;
    }
    .faq-a {
      font-size: 14px;
      color: #666;
      line-height: 1.7;
      margin: 0;
    }
    .detail-sidebar {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .sidebar-card {
      background: #fff;
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 2px 16px rgba(0,0,0,0.05);
    }
    .sidebar-card h3 {
      font-size: 16px;
      font-weight: 700;
      color: #2c2c2c;
      margin: 0 0 18px;
    }
    .sidebar-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #f5f5f5;
    }
    .sidebar-row:last-child {
      border-bottom: none;
    }
    .sidebar-label {
      font-size: 13px;
      color: #888;
    }
    .sidebar-value {
      font-size: 14px;
      font-weight: 700;
      color: #2c2c2c;
    }
    .sidebar-cta {
      display: block;
      background: #0066cc;
      color: #fff;
      text-align: center;
      padding: 14px;
      border-radius: 14px;
      text-decoration: none;
      font-size: 14px;
      font-weight: 700;
      margin-top: 16px;
      transition: all 0.25s ease;
    }
    .sidebar-cta:hover {
      background: #0055aa;
      transform: translateY(-1px);
    }
    .feature-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .feature-list li {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-size: 14px;
      color: #555;
      line-height: 1.5;
    }
    .feature-list li svg {
      width: 18px;
      height: 18px;
      color: #4a8b5a;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .related-section {
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 24px 80px;
    }
    .related-section .section-header {
      text-align: center;
      margin-bottom: 36px;
    }
    .related-section h2 {
      font-size: 24px;
      font-weight: 800;
      color: #2c2c2c;
      margin: 0 0 8px;
    }
    .related-section p {
      font-size: 15px;
      color: #888;
      margin: 0;
    }
    .related-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
    }
    .related-card {
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      text-decoration: none;
      box-shadow: 0 2px 12px rgba(0,0,0,0.05);
      transition: all 0.3s ease;
    }
    .related-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 28px rgba(0,0,0,0.1);
    }
    .related-image {
      height: 140px;
      overflow: hidden;
    }
    .related-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .related-title {
      display: block;
      font-size: 15px;
      font-weight: 700;
      color: #2c2c2c;
      padding: 14px 16px 4px;
    }
    .related-price {
      display: block;
      font-size: 13px;
      color: #888;
      padding: 0 16px 16px;
    }
    @media (max-width: 768px) {
      .detail-hero { height: 360px; }
      .detail-grid { grid-template-columns: 1fr; }
      .timeline::before { right: 15px; }
      .timeline-step { width: 32px; height: 32px; font-size: 12px; }
      .related-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class ServiceDetailComponent implements OnInit {
  service: Service | null = null;
  relatedServices: Service[] = [];

  constructor(
    private data: ClinicDataService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.service = this.data.getServiceById(id) || null;
        this.relatedServices = this.data.getServices().filter(s => s.id !== id).slice(0, 3);
      }
    });
  }
}
