import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { ClinicDataService } from '../../services/clinic-data.service';
import { GalleryItem } from '../../models/clinic.model';
import { BeforeAfterSliderComponent } from '../../shared/ui/before-after-slider/before-after-slider.component';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [NgFor, BeforeAfterSliderComponent],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  template: `
    <div class="gallery-page" @fadeIn>
      <div class="page-hero">
        <span class="page-label">نمونه کارها</span>
        <h1 class="page-title">قبل و بعد از درمان</h1>
        <p class="page-desc">نتیجه واقعی درمان‌های انجام شده در کلینیک دکتر مقدم. دستگیره را جابجا کنید تا تغییر را ببینید.</p>
      </div>

      <div class="gallery-grid">
        <div class="gallery-item" *ngFor="let item of galleryItems">
          <app-before-after-slider
            [beforeImage]="item.beforeImage"
            [afterImage]="item.afterImage"
            [title]="item.title">
          </app-before-after-slider>
          <div class="gallery-caption">
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .gallery-page {
      max-width: 1000px;
      margin: 0 auto;
      padding: 48px 24px 80px;
    }
    .page-hero {
      text-align: center;
      margin-bottom: 48px;
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
      font-size: clamp(32px, 5vw, 42px);
      font-weight: 800;
      color: #2c2c2c;
      margin: 0 0 12px;
      line-height: 1.15;
    }
    .page-desc {
      font-size: 16px;
      color: #888;
      max-width: 500px;
      margin: 0 auto;
      line-height: 1.6;
    }
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
      gap: 40px;
    }
    .gallery-item {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .gallery-caption {
      padding: 0 8px;
    }
    .gallery-caption h3 {
      font-size: 17px;
      font-weight: 700;
      color: #2c2c2c;
      margin: 0 0 4px;
    }
    .gallery-caption p {
      font-size: 14px;
      color: #888;
      margin: 0;
      line-height: 1.5;
    }
    @media (max-width: 768px) {
      .gallery-page { padding: 32px 16px 80px; }
      .gallery-grid { grid-template-columns: 1fr; gap: 32px; }
    }
  `]
})
export class GalleryComponent {
  galleryItems: GalleryItem[];

  constructor(private data: ClinicDataService) {
    this.galleryItems = this.data.getGallery();
  }
}
