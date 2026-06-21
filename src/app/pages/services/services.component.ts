import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor } from '@angular/common';
import { ClinicDataService } from '../../services/clinic-data.service';
import { Service } from '../../models/clinic.model';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [RouterLink, NgFor],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  template: `
    <div class="page-hero" @fadeIn>
      <span class="page-label">خدمات</span>
      <h1 class="page-title">درمان‌های تخصصی<br/>با بالاترین کیفیت</h1>
      <p class="page-desc">تمامی خدمات با تکنولوژی روز و توسط متخصصان با تجربه ارائه می‌شود.</p>
    </div>

    <section class="services-list" @fadeIn>
      <div class="service-row" *ngFor="let service of services">
        <div class="service-row-image">
          <img [src]="service.image" [alt]="service.title" loading="lazy" />
        </div>
        <div class="service-row-content">
          <h3>{{ service.title }}</h3>
          <p>{{ service.description }}</p>
          <div class="service-features">
            <span class="feature" *ngFor="let f of service.features.slice(0, 3)">{{ f }}</span>
          </div>
          <div class="service-row-meta">
            <span class="price">{{ service.price }}</span>
            <span class="duration">{{ service.duration }}</span>
          </div>
          <a class="service-link" [routerLink]="'/services/' + service.id">
            اطلاعات بیشتر
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .page-hero {
      text-align: center;
      padding: 64px 24px 48px;
      max-width: 700px;
      margin: 0 auto;
    }
    .page-label {
      display: block;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #a08b6d;
      margin-bottom: 12px;
    }
    .page-title {
      font-size: clamp(32px, 6vw, 48px);
      font-weight: 800;
      color: #2c2c2c;
      margin: 0 0 16px;
      line-height: 1.2;
    }
    .page-desc {
      font-size: 17px;
      color: #888;
      line-height: 1.7;
      margin: 0;
    }
    .services-list {
      max-width: 1000px;
      margin: 0 auto;
      padding: 0 24px 80px;
      display: flex;
      flex-direction: column;
      gap: 32px;
    }
    .service-row {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 32px;
      background: #fff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 2px 16px rgba(0,0,0,0.05);
      transition: all 0.3s ease;
    }
    .service-row:hover {
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      transform: translateY(-2px);
    }
    .service-row-image {
      height: 100%;
      min-height: 240px;
      overflow: hidden;
    }
    .service-row-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }
    .service-row:hover .service-row-image img {
      transform: scale(1.05);
    }
    .service-row-content {
      padding: 32px 32px 32px 0;
      display: flex;
      flex-direction: column;
    }
    .service-row-content h3 {
      font-size: 22px;
      font-weight: 700;
      color: #2c2c2c;
      margin: 0 0 10px;
    }
    .service-row-content p {
      font-size: 15px;
      color: #666;
      line-height: 1.7;
      margin: 0 0 16px;
    }
    .service-features {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 16px;
    }
    .feature {
      font-size: 12px;
      font-weight: 600;
      color: #666;
      background: #f5f5f5;
      padding: 5px 12px;
      border-radius: 12px;
    }
    .service-row-meta {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
      align-items: center;
    }
    .price {
      font-size: 16px;
      font-weight: 700;
      color: #0066cc;
    }
    .duration {
      font-size: 13px;
      color: #888;
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
      margin-top: auto;
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
      transform: translateX(-4px);
    }
    @media (max-width: 768px) {
      .service-row {
        grid-template-columns: 1fr;
      }
      .service-row-image {
        height: 200px;
        min-height: auto;
      }
      .service-row-content {
        padding: 24px;
      }
    }
  `]
})
export class ServicesComponent {
  services: Service[];

  constructor(private data: ClinicDataService) {
    this.services = this.data.getServices();
  }
}
