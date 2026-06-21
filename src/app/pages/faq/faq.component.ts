import { Component } from '@angular/core';
import { ClinicDataService } from '../../services/clinic-data.service';
import { FaqItem } from '../../models/clinic.model';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('expand', [
      transition(':enter', [
        style({ opacity: 0, height: 0, overflow: 'hidden' }),
        animate('0.3s ease-out', style({ opacity: 1, height: '*' }))
      ]),
      transition(':leave', [
        style({ opacity: 1, height: '*' }),
        animate('0.2s ease-in', style({ opacity: 0, height: 0, overflow: 'hidden' }))
      ])
    ])
  ],
  template: `
    <div class="faq-page" @fadeIn>
      <div class="page-hero">
        <span class="page-label">سوالات متداول</span>
        <h1 class="page-title">پاسخ به سوالات شما</h1>
        <p class="page-desc">پاسخ کامل به رایج‌ترین سوالات بیماران. اگر پاسخ سوال خود را پیدا نکردید، با ما تماس بگیرید.</p>
      </div>

      <div class="faq-list">
        @for (faq of faqs; track faq.id) {
          <div class="faq-item" [class.open]="openId === faq.id" (click)="toggle(faq.id)">
            <div class="faq-question">
              <span>{{ faq.question }}</span>
              <div class="faq-icon">
                @if (openId === faq.id) {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                } @else {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                }
              </div>
            </div>
            @if (openId === faq.id) {
              <div class="faq-answer" @expand>
                <p>{{ faq.answer }}</p>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .faq-page {
      max-width: 800px;
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
      margin: 0;
      line-height: 1.6;
    }
    .faq-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .faq-item {
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.04);
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .faq-item:hover {
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }
    .faq-item.open {
      box-shadow: 0 4px 24px rgba(0,0,0,0.1);
    }
    .faq-question {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 22px 24px;
      font-size: 16px;
      font-weight: 700;
      color: #2c2c2c;
      line-height: 1.4;
    }
    .faq-icon {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.2s ease;
    }
    .faq-item.open .faq-icon {
      background: #0066cc;
      color: #fff;
    }
    .faq-icon svg {
      width: 14px;
      height: 14px;
    }
    .faq-answer {
      padding: 0 24px 22px;
    }
    .faq-answer p {
      font-size: 15px;
      color: #666;
      line-height: 1.8;
      margin: 0;
    }
    @media (max-width: 768px) {
      .faq-page { padding: 32px 16px 80px; }
      .faq-question { padding: 18px 20px; font-size: 15px; }
      .faq-answer { padding: 0 20px 18px; }
    }
  `]
})
export class FaqComponent {
  faqs: FaqItem[];
  openId: string | null = null;

  constructor(private data: ClinicDataService) {
    this.faqs = this.data.getFaqs();
  }

  toggle(id: string) {
    this.openId = this.openId === id ? null : id;
  }
}
