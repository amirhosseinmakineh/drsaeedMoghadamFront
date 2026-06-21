import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <span class="footer-mark">SM</span>
          <span class="footer-name">دکتر سعید مقدم</span>
          <p class="footer-tagline">کلینیک دندانپزشکی تخصصی و زیبایی</p>
        </div>
        <div class="footer-links">
          <div class="footer-col">
            <h4>خدمات</h4>
            <a routerLink="/services/implants">ایمپلنت دندان</a>
            <a routerLink="/services/whitening">بلیچینگ</a>
            <a routerLink="/services/orthodontics">ارتودنسی</a>
            <a routerLink="/services/cosmetic">cosmetic</a>
            <a routerLink="/services/emergency">اورژانس</a>
            <a routerLink="/services/pediatric">کودکان</a>
          </div>
          <div class="footer-col">
            <h4>دسترسی سریع</h4>
            <a routerLink="/">صفحه اصلی</a>
            <a routerLink="/doctor">درباره پزشک</a>
            <a routerLink="/gallery">گالری</a>
            <a routerLink="/faq">سوالات متداول</a>
            <a routerLink="/booking">رزرو نوبت</a>
          </div>
          <div class="footer-col">
            <h4>تماس</h4>
            <span>تهران، خیابان ولیعصر</span>
            <span>۰۲۱-۸۸۷۷۶۶۵۵</span>
            <span>info@drmoghaddam.ir</span>
            <span>شنبه تا پنج‌شنبه ۹ تا ۲۱</span>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>تمامی حقوق محفوظ است. کلینیک دندانپزشکی دکتر سعید مقدم.</span>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: #f7f3ee;
      border-top: 1px solid rgba(0,0,0,0.04);
      padding: 48px 24px 0;
    }
    .footer-inner {
      max-width: 1100px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 48px;
      padding-bottom: 40px;
    }
    .footer-brand {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .footer-mark {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: #2c2c2c;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 700;
    }
    .footer-name {
      font-size: 18px;
      font-weight: 700;
      color: #2c2c2c;
    }
    .footer-tagline {
      font-size: 14px;
      color: #8a8a8a;
      line-height: 1.6;
    }
    .footer-links {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }
    .footer-col {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .footer-col h4 {
      font-size: 14px;
      font-weight: 700;
      color: #2c2c2c;
      margin-bottom: 6px;
    }
    .footer-col a, .footer-col span {
      font-size: 13px;
      color: #8a8a8a;
      transition: color 0.2s ease;
    }
    .footer-col a:hover {
      color: #0066cc;
    }
    .footer-bottom {
      border-top: 1px solid rgba(0,0,0,0.06);
      padding: 20px 24px;
      text-align: center;
    }
    .footer-bottom span {
      font-size: 12px;
      color: #aaa;
    }
    @media (max-width: 768px) {
      .footer-inner {
        grid-template-columns: 1fr;
        gap: 32px;
      }
      .footer-links {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class FooterComponent {}
