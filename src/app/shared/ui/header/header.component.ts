import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({selector:'app-header',standalone:true,imports:[RouterLink],template:`
<header class="hdr">
  <a class="brand" routerLink="/">کلینیک دندانپزشکی دکتر سعید مقدم</a>
  <nav aria-label="ناوبری اصلی"><a routerLink="/">خانه</a><a routerLink="/services">خدمات</a><a routerLink="/about">درباره ما</a><a routerLink="/contact">تماس با ما</a></nav>
  <a class="cta" routerLink="/contact">رزرو مشاوره</a>
</header>`,styles:[`.hdr{position:sticky;top:0;z-index:10;width:min(1180px,calc(100% - 32px));margin:12px auto 0;background:rgba(255,253,248,.78);backdrop-filter:blur(20px);display:flex;align-items:center;justify-content:space-between;padding:10px 12px 10px 18px;border:1px solid rgba(133,109,84,.16);border-radius:999px;box-shadow:0 14px 40px rgba(57,42,30,.08)}.brand{font-size:14px;font-weight:900;color:#2e241d;white-space:nowrap}nav{display:flex;gap:4px;color:#5d5047}nav a{padding:8px 12px;border-radius:999px;font-size:14px;font-weight:700;transition:background .2s ease}nav a:hover{background:rgba(133,109,84,.09)}.cta{background:#211a16;color:white;padding:9px 15px;border-radius:999px;font-size:13px;font-weight:800;box-shadow:0 10px 24px rgba(33,26,22,.18)}@media(max-width:760px){.hdr{width:calc(100% - 20px);margin-top:8px;padding:9px 10px}.brand{font-size:13px;max-width:58%;overflow:hidden;text-overflow:ellipsis}nav{display:none}.cta{font-size:12px;padding:8px 12px}}`]} )
export class HeaderComponent {}
