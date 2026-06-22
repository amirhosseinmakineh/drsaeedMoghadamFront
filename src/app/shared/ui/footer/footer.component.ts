import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({selector:'app-footer',standalone:true,imports:[RouterLink],template:`
<footer class="ftr">
  <div><h2>کلینیک دندانپزشکی دکتر سعید مقدم</h2><p>درمان دقیق، محیط آرام و لبخند طبیعی.</p></div>
  <div><h3>لینک‌های سریع</h3><a routerLink="/">خانه</a><a routerLink="/services">خدمات</a><a routerLink="/about">درباره ما</a><a routerLink="/contact">تماس</a></div>
  <div><h3>خدمات</h3><a routerLink="/services/implant">ایمپلنت دندان</a><a routerLink="/services/laminate">لمینت دندان</a><a routerLink="/services/composite">کامپوزیت دندان</a></div>
  <div><h3>تماس</h3><p>۰۲۱-۰۰۰۰۰۰۰۰</p><p>تهران، خیابان نمونه</p></div>
  <p class="copy">تمام حقوق برای کلینیک دندانپزشکی دکتر سعید مقدم محفوظ است.</p>
</footer>`,styles:[`.ftr{background:#211a16;color:#fff8ee;margin-top:48px;padding:42px max(24px,calc((100vw - 1200px)/2 + 24px)) 92px;display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:24px}.ftr h2{font-size:22px;margin:0 0 10px}.ftr h3{font-size:16px;margin:0 0 12px}.ftr a,.ftr p{display:block;color:#d8cbbc;margin:7px 0;font-size:14px;line-height:1.8}.copy{grid-column:1/-1;border-top:1px solid rgba(255,255,255,.12);padding-top:16px;margin-top:10px}@media(max-width:760px){.ftr{grid-template-columns:1fr 1fr;padding:32px 18px 86px}.ftr>div:first-child,.copy{grid-column:1/-1}}`]} )
export class FooterComponent {}
