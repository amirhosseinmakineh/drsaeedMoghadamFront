import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '../fa-icon/fa-icon.component';
@Component({selector:'app-footer',standalone:true,imports:[RouterLink,FaIconComponent],template:`
<footer class="ftr">
  <div><h2>کلینیک دندانپزشکی دکتر سعید مقدم</h2><p>درمان دقیق، محیط آرام و لبخند طبیعی.</p></div>
  <div><h3>لینک‌های سریع</h3><a routerLink="/">خانه</a><a routerLink="/services">خدمات</a><a routerLink="/about">درباره ما</a><a routerLink="/contact">تماس</a></div>
  <div><h3>خدمات</h3><a routerLink="/services/implant"><app-fa-icon name="tooth"></app-fa-icon> ایمپلنت دندان</a><a routerLink="/services/laminate"><app-fa-icon name="sparkle"></app-fa-icon> لمینت دندان</a><a routerLink="/services/composite"><app-fa-icon name="star"></app-fa-icon> کامپوزیت دندان</a></div>
  <div><h3>تماس</h3><p><app-fa-icon name="phone"></app-fa-icon> ۰۲۱-۰۰۰۰۰۰۰۰</p><p><app-fa-icon name="location"></app-fa-icon> تهران، خیابان نمونه</p><p><app-fa-icon name="clock"></app-fa-icon> شنبه تا پنجشنبه</p></div>
  <p class="copy">تمام حقوق برای کلینیک دندانپزشکی دکتر سعید مقدم محفوظ است.</p>
</footer>`,styles:[`.ftr{background:#f7f3ee;color:#222;margin-top:48px;padding:42px max(24px,calc((100vw - 1200px)/2 + 24px)) 92px;display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:24px;border-top:1px solid rgba(0,100,145,.12)}.ftr h2{font-size:22px;margin:0 0 10px}.ftr h3{font-size:16px;margin:0 0 12px}.ftr a,.ftr p{display:flex;align-items:center;gap:8px;color:#4a4a4a;margin:7px 0;font-size:14px;line-height:1.8}.ftr app-fa-icon{color:#006491}.copy{grid-column:1/-1;border-top:1px solid rgba(0,100,145,.12);padding-top:16px;margin-top:10px}@media(max-width:760px){.ftr{grid-template-columns:1fr 1fr;padding:32px 18px 86px}.ftr>div:first-child,.copy{grid-column:1/-1}}`]} )
export class FooterComponent {}
