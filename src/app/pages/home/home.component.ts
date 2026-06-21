import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor } from '@angular/common';
import { ClinicDataService } from '../../services/clinic-data.service';
import { Service, Testimonial, WhyUsItem } from '../../models/clinic.model';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, NgFor],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('0.8s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  template: `
    <section class="hero" @fadeIn>
      <div class="hero-badge">کلینیک تخصصی دندانپزشکی</div>
      <h1 class="hero-title">لبخند زیبا،<br/>زندگی بهتر</h1>
      <p class="hero-subtitle">
        با تجربه دکتر سعید مقدم و تیم متخصص، زیباترین لبخند را برای خود بسازید.
        ایمپلنت، cosmetic، ارتودنسی نامرئی و بلیچینگ با بالاترین تکنولوژی روز دنیا.
      </p>
      <div class="hero-actions">
        <a class="btn-primary" routerLink="/booking">رزرو نوبت رایگان</a>
        <a class="btn-secondary" routerLink="/services">مشاهده خدمات</a>
      </div>
      <div class="hero-stats">
        <div class="stat">
          <span class="stat-number">۱۵+</span>
          <span class="stat-label">سال تجربه</span>
        </div>
        <div class="stat">
          <span class="stat-number">۵۰۰۰+</span>
          <span class="stat-label">بیمار راضی</span>
        </div>
        <div class="stat">
          <span class="stat-number">۹۸٪</span>
          <span class="stat-label">رضایت بیماران</span>
        </div>
      </div>
    </section>

    <section class="services-section" @fadeInUp>
      <div class="section-header">
        <span class="section-label">خدمات ما</span>
        <h2 class="section-title">درمان‌های تخصصی و زیبایی</h2>
        <p class="section-desc">تمامی خدمات با جدیدترین تکنولوژی و بالاترین استانداردهای جهانی ارائه می‌شود.</p>
      </div>
      <div class="services-grid">
        <div class="service-card" *ngFor="let service of featuredServices">
          <div class="service-image">
            <img [src]="service.image" [alt]="service.title" loading="lazy" />
          </div>
          <div class="service-content">
            <h3>{{ service.title }}</h3>
            <p>{{ service.description }}</p>
            <div class="service-meta">
              <span class="price">{{ service.price }}</span>
              <span class="duration">{{ service.duration }}</span>
            </div>
            <a class="service-link" [routerLink]="'/services/' + service.id">
              اطلاعات بیشتر
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </a>
          </div>
        </div>
      </div>
      <div class="section-cta">
        <a class="btn-outline" routerLink="/services">مشاهده همه خدمات</a>
      </div>
    </section>

    <section class="doctor-section" @fadeInUp>
      <div class="doctor-inner">
        <div class="doctor-image">
          <img [src]="doctor.image" [alt]="doctor.name" loading="lazy" />
        </div>
        <div class="doctor-content">
          <span class="section-label">درباره پزشک</span>
          <h2 class="section-title">دکتر سعید مقدم</h2>
          <p class="doctor-title">متخصص دندانپزشکی زیبایی و ایمپلنت</p>
          <p class="doctor-bio">{{ doctor.bio }}</p>
          <div class="doctor-badges">
            <span class="badge">{{ doctor.experience }} تجربه</span>
            <span class="badge">بورد هاروارد</span>
            <span class="badge">FICOI</span>
          </div>
          <a class="btn-primary" routerLink="/doctor">درباره دکتر مقدم</a>
        </div>
      </div>
    </section>

    <section class="why-us-section" @fadeInUp>
      <div class="section-header">
        <span class="section-label">چرا کلینیک دکتر مقدم؟</span>
        <h2 class="section-title">تفاوت ما در چیست</h2>
      </div>
      <div class="why-grid">
        <div class="why-card" *ngFor="let item of whyUs">
          <div class="why-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
          </div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
        </div>
      </div>
    </section>

    <section class="gallery-section" @fadeInUp>
      <div class="section-header">
        <span class="section-label">نمونه کارها</span>
        <h2 class="section-title">تغییرات شگفت‌انگیز</h2>
        <p class="section-desc">قبل و بعد از درمان‌های انجام شده در کلینیک دکتر مقدم</p>
      </div>
      <div class="gallery-cta">
        <a class="btn-outline" routerLink="/gallery">مشاهده گالری کامل</a>
      </div>
    </section>

    <section class="testimonials-section" @fadeInUp>
      <div class="section-header">
        <span class="section-label">نظرات بیماران</span>
        <h2 class="section-title">صدای بیماران ما</h2>
      </div>
      <div class="testimonials-grid">
        <div class="testimonial-card" *ngFor="let t of testimonials">
          <div class="testimonial-stars">
            <svg *ngFor="let s of [].constructor(t.rating)" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          </div>
          <p class="testimonial-text">"{{ t.text }}"</p>
          <div class="testimonial-author">
            <img [src]="t.image" [alt]="t.name" loading="lazy" />
            <div>
              <span class="author-name">{{ t.name }}</span>
              <span class="author-service">{{ t.service }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="faq-section" @fadeInUp>
      <div class="section-header">
        <span class="section-label">سوالات متداول</span>
        <h2 class="section-title">پاسخ به سوالات شما</h2>
      </div>
      <div class="faq-preview">
        <div class="faq-row" *ngFor="let faq of faqs.slice(0, 4)">
          <span class="faq-q">{{ faq.question }}</span>
          <span class="faq-a">{{ faq.answer }}</span>
        </div>
      </div>
      <div class="section-cta">
        <a class="btn-outline" routerLink="/faq">مشاهده همه سوالات</a>
      </div>
    </section>

    <section class="cta-section" @fadeInUp>
      <div class="cta-card">
        <h2>آماده‌اید لبخند خود را متحول کنید؟</h2>
        <p>مشاوره اولیه رایگان است. همین امروز نوبت خود را رزرو کنید و اولین قدم را به سوی لبخندی زیبا بردارید.</p>
        <a class="btn-primary" routerLink="/booking">رزرو مشاوره رایگان</a>
      </div>
    </section>
  `,
  styles: [`
    .hero {
      text-align: center;
      padding: 80px 24px 60px;
      max-width: 800px;
      margin: 0 auto;
    }
    .hero-badge {
      display: inline-block;
      background: #f0e6d9;
      color: #8a6a4a;
      font-size: 12px;
      font-weight: 600;
      padding: 8px 18px;
      border-radius: 24px;
      margin-bottom: 28px;
    }
    .hero-title {
      font-size: clamp(36px, 7vw, 64px);
      font-weight: 800;
      line-height: 1.2;
      color: #2c2c2c;
      margin: 0 0 20px;
    }
    .hero-subtitle {
      font-size: clamp(16px, 2.5vw, 20px);
      color: #666;
      line-height: 1.8;
      max-width: 600px;
      margin: 0 auto 36px;
    }
    .hero-actions {
      display: flex;
      gap: 14px;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 56px;
    }
    .btn-primary {
      background: #0066cc;
      color: #fff;
      padding: 14px 32px;
      border-radius: 28px;
      text-decoration: none;
      font-size: 15px;
      font-weight: 700;
      transition: all 0.25s ease;
      display: inline-block;
    }
    .btn-primary:hover {
      background: #0055aa;
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,102,204,0.25);
    }
    .btn-secondary {
      background: #f7f3ee;
      color: #2c2c2c;
      padding: 14px 32px;
      border-radius: 28px;
      text-decoration: none;
      font-size: 15px;
      font-weight: 700;
      transition: all 0.25s ease;
      display: inline-block;
    }
    .btn-secondary:hover {
      background: #ebe5dc;
      transform: translateY(-2px);
    }
    .btn-outline {
      border: 1.5px solid #2c2c2c;
      color: #2c2c2c;
      padding: 12px 28px;
      border-radius: 28px;
      text-decoration: none;
      font-size: 14px;
      font-weight: 700;
      transition: all 0.25s ease;
      display: inline-block;
    }
    .btn-outline:hover {
      background: #2c2c2c;
      color: #fff;
    }
    .hero-stats {
      display: flex;
      justify-content: center;
      gap: 48px;
      flex-wrap: wrap;
    }
    .stat {
      text-align: center;
    }
    .stat-number {
      display: block;
      font-size: 36px;
      font-weight: 800;
      color: #2c2c2c;
      line-height: 1;
    }
    .stat-label {
      display: block;
      font-size: 13px;
      color: #8a8a8a;
      margin-top: 6px;
      font-weight: 500;
    }
    .services-section {
      padding: 60px 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .section-header {
      text-align: center;
      margin-bottom: 48px;
    }
    .section-label {
      display: block;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #a08b6d;
      margin-bottom: 12px;
    }
    .section-title {
      font-size: clamp(28px, 5vw, 42px);
      font-weight: 800;
      color: #2c2c2c;
      margin: 0 0 14px;
      line-height: 1.3;
    }
    .section-desc {
      font-size: 16px;
      color: #888;
      max-width: 520px;
      margin: 0 auto;
      line-height: 1.7;
    }
    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }
    .service-card {
      background: #fff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 2px 16px rgba(0,0,0,0.05);
      transition: all 0.3s ease;
    }
    .service-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.1);
    }
    .service-image {
      height: 200px;
      overflow: hidden;
    }
    .service-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }
    .service-card:hover .service-image img {
      transform: scale(1.05);
    }
    .service-content {
      padding: 22px;
    }
    .service-content h3 {
      font-size: 18px;
      font-weight: 700;
      color: #2c2c2c;
      margin: 0 0 8px;
    }
    .service-content p {
      font-size: 14px;
      color: #777;
      line-height: 1.6;
      margin: 0 0 14px;
    }
    .service-meta {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-bottom: 14px;
    }
    .price {
      font-size: 14px;
      font-weight: 700;
      color: #0066cc;
    }
    .duration {
      font-size: 13px;
      color: #999;
      background: #f5f5f5;
      padding: 4px 10px;
      border-radius: 12px;
    }
    .service-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
      color: #2c2c2c;
      font-size: 14px;
      font-weight: 700;
      transition: all 0.2s ease;
    }
    .service-link svg {
      width: 16px;
      height: 16px;
      transition: transform 0.2s ease;
    }
    .service-link:hover {
      color: #0066cc;
    }
    .service-link:hover svg {
      transform: translateX(4px);
    }
    .section-cta {
      text-align: center;
      margin-top: 40px;
    }
    .doctor-section {
      padding: 60px 24px;
      background: #f7f3ee;
      border-radius: 32px;
      max-width: 1100px;
      margin: 40px auto;
    }
    .doctor-inner {
      display: grid;
      grid-template-columns: 380px 1fr;
      gap: 48px;
      align-items: center;
    }
    .doctor-image {
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 12px 48px rgba(0,0,0,0.1);
    }
    .doctor-image img {
      width: 100%;
      display: block;
    }
    .doctor-content {
      display: flex;
      flex-direction: column;
    }
    .doctor-title {
      font-size: 18px;
      color: #8a8a8a;
      margin: 0 0 16px;
    }
    .doctor-bio {
      font-size: 15px;
      color: #555;
      line-height: 1.8;
      margin: 0 0 24px;
    }
    .doctor-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 28px;
    }
    .badge {
      background: #fff;
      color: #5a4a32;
      font-size: 12px;
      font-weight: 700;
      padding: 8px 14px;
      border-radius: 20px;
      box-shadow: 0 1px 6px rgba(0,0,0,0.04);
    }
    .why-us-section {
      padding: 60px 24px;
      max-width: 1100px;
      margin: 0 auto;
    }
    .why-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-top: 40px;
    }
    .why-card {
      background: #fff;
      border-radius: 20px;
      padding: 28px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.04);
      transition: all 0.3s ease;
    }
    .why-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 28px rgba(0,0,0,0.08);
    }
    .why-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: #f0e6d9;
      color: #8a6a4a;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 14px;
    }
    .why-icon svg {
      width: 22px;
      height: 22px;
    }
    .why-card h3 {
      font-size: 16px;
      font-weight: 700;
      color: #2c2c2c;
      margin: 0 0 8px;
    }
    .why-card p {
      font-size: 14px;
      color: #777;
      line-height: 1.6;
      margin: 0;
    }
    .gallery-section {
      padding: 60px 24px;
      max-width: 1100px;
      margin: 0 auto;
      text-align: center;
    }
    .gallery-cta {
      margin-top: 24px;
    }
    .testimonials-section {
      padding: 60px 24px;
      max-width: 1100px;
      margin: 0 auto;
      background: #f7f3ee;
      border-radius: 32px;
      margin-top: 40px;
    }
    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 40px;
    }
    .testimonial-card {
      background: #fff;
      padding: 28px;
      border-radius: 20px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.04);
    }
    .testimonial-stars {
      display: flex;
      gap: 4px;
      margin-bottom: 14px;
    }
    .testimonial-stars svg {
      width: 16px;
      height: 16px;
      color: #d4a843;
    }
    .testimonial-text {
      font-size: 15px;
      color: #555;
      line-height: 1.8;
      margin: 0 0 20px;
    }
    .testimonial-author {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .testimonial-author img {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      object-fit: cover;
    }
    .author-name {
      display: block;
      font-size: 14px;
      font-weight: 700;
      color: #2c2c2c;
    }
    .author-service {
      display: block;
      font-size: 12px;
      color: #999;
    }
    .faq-section {
      padding: 60px 24px;
      max-width: 900px;
      margin: 0 auto;
    }
    .faq-preview {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 32px;
      margin-bottom: 32px;
    }
    .faq-row {
      background: #fff;
      border-radius: 16px;
      padding: 22px;
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
    }
    .cta-section {
      padding: 60px 24px;
      max-width: 800px;
      margin: 0 auto;
    }
    .cta-card {
      background: #0066cc;
      border-radius: 28px;
      padding: 48px 32px;
      text-align: center;
      color: #fff;
    }
    .cta-card h2 {
      font-size: clamp(24px, 4vw, 36px);
      font-weight: 800;
      margin: 0 0 14px;
      line-height: 1.3;
    }
    .cta-card p {
      font-size: 16px;
      color: rgba(255,255,255,0.85);
      line-height: 1.7;
      max-width: 480px;
      margin: 0 auto 28px;
    }
    .cta-card .btn-primary {
      background: #fff;
      color: #0066cc;
    }
    .cta-card .btn-primary:hover {
      background: #f5f0e8;
    }
    @media (max-width: 768px) {
      .hero { padding: 48px 20px 40px; }
      .hero-stats { gap: 28px; }
      .stat-number { font-size: 28px; }
      .services-section, .doctor-section, .why-us-section, .testimonials-section, .faq-section, .cta-section { padding: 40px 20px; }
      .doctor-inner { grid-template-columns: 1fr; gap: 32px; }
      .doctor-image { max-height: 400px; }
      .testimonials-grid, .services-grid, .why-grid { grid-template-columns: 1fr; }
      .cta-card { padding: 36px 24px; }
    }
  `]
})
export class HomeComponent {
  featuredServices: Service[];
  testimonials: Testimonial[];
  whyUs: WhyUsItem[];
  faqs: any[];
  doctor: any;

  constructor(private data: ClinicDataService) {
    this.featuredServices = this.data.getServices();
    this.testimonials = this.data.getTestimonials();
    this.whyUs = this.data.getWhyUs();
    this.faqs = this.data.getFaqs();
    this.doctor = this.data.getDoctor();
  }
}
