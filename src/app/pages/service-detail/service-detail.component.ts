import { Component, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { ClinicDataService } from '../../services/clinic-data.service';
import { FaIconComponent } from '../../shared/ui/fa-icon/fa-icon.component';

@Component({selector:'app-service-detail',standalone:true,imports:[NgFor,RouterLink,FaIconComponent],template:`
@if(service){
<article>
  <section class="hero detail-hero">
    <div>
      <p class="eyebrow"><a routerLink="/">خانه</a> / <a routerLink="/services">خدمات</a></p>
      <h1>{{service.title}}</h1>
      <p>{{service.subtitle}}</p>
      <p>{{service.description}}</p>
      <a class="btn" routerLink="/contact">درخواست تماس مشاور برای این خدمت</a>
      <div class="trust-row">
        <span class="trust-pill"><app-fa-icon name="calendar"></app-fa-icon> طرح درمان اختصاصی</span>
        <span class="trust-pill"><app-fa-icon name="shield"></app-fa-icon> مراقبت پس از درمان</span>
        <span class="trust-pill"><app-fa-icon name="star"></app-fa-icon> نتیجه طبیعی</span>
      </div>
    </div>
    <div class="hero-media">
      <img [src]="service.heroImage" [alt]="service.title">
      <span class="floating-card top"><app-fa-icon name="doctor"></app-fa-icon> مشاوره دقیق</span>
      <span class="floating-card bottom"><app-fa-icon name="calendar"></app-fa-icon> درمان مرحله‌ای</span>
    </div>
  </section>

  <section class="surface-block">
    <h2>معرفی کامل خدمت</h2>
    <p class="long columns-text">{{service.fullDescription}}</p>
  </section>

  <section>
    <h2>علائم و مشکلاتی که نیاز به درمان دارند</h2>
    <div class="grid mini">
      <div class="card icon-card" *ngFor="let p of service.problems"><span class="service-icon"><app-fa-icon name="tooth"></app-fa-icon></span><h3>{{p}}</h3><p>در صورت مشاهده این مشکل، معاینه تخصصی کمک می‌کند علت اصلی مشخص و درمان مناسب انتخاب شود.</p></div>
    </div>
  </section>

  <section class="split surface-block">
    <div><h2>چرا این درمان لازم است؟</h2><ul><li *ngFor="let n of service.needed">{{n}}</li></ul></div>
    <div class="info-grid">
      <div class="mini-info"><strong>مدت درمان</strong><span>{{service.duration}}</span></div>
      <div class="mini-info"><strong>برآورد هزینه</strong><span>{{service.price}}</span></div>
      <div class="mini-info"><strong>پیگیری</strong><span>طبق طرح درمان</span></div>
    </div>
  </section>

  <section>
    <h2>مزایای {{service.title}}</h2>
    <div class="grid mini"><div class="card icon-card" *ngFor="let f of service.features"><span class="service-icon"><app-fa-icon name="check"></app-fa-icon></span><h3>{{f}}</h3></div></div>
  </section>

  <section>
    <h2>مراحل درمان</h2>
    <div class="timeline">
      <div class="timeline-item" *ngFor="let st of service.steps"><span>{{st.step}}</span><div><h3>{{st.title}}</h3><p>{{st.description}}</p></div></div>
    </div>
  </section>

  <section class="split">
    <div class="card"><h2>چه کسانی مناسب هستند؟</h2><ul><li *ngFor="let s of service.suitable">{{s}}</li></ul></div>
    <div class="card"><h2>چه کسانی فعلاً مناسب نیستند؟</h2><ul><li *ngFor="let s of service.notSuitable">{{s}}</li></ul></div>
  </section>

  <section class="split before-after-premium">
    <div><h2>نتایج قبل و بعد</h2><p>نتیجه درمان به شرایط اولیه، دقت اجرا و مراقبت بیمار وابسته است. هدف، لبخندی سالم، طبیعی و هماهنگ است.</p></div>
    <div class="before-after-frame"><img [src]="service.beforeImage" alt="قبل از درمان"><img [src]="service.afterImage" alt="بعد از درمان"><span class="before-label">قبل</span><span class="after-label">بعد</span><span class="handle"></span></div>
  </section>

  <section class="info-grid three">
    <div class="mini-info"><h2>مدت درمان و پیگیری</h2><p>تعداد جلسات و زمان بهبود برای هر بیمار متفاوت است. پس از درمان، زمان مراجعه پیگیری و مراقبت خانگی به‌صورت روشن توضیح داده می‌شود.</p></div>
    <div class="mini-info"><h2>عوامل مؤثر بر هزینه</h2><p>در این صفحه قیمت دقیق اعلام نمی‌شود، زیرا هزینه فقط پس از معاینه قابل تعیین است.</p><ul><li *ngFor="let c of service.costFactors">{{c}}</li></ul></div>
    <div class="mini-info"><h2>مراقبت‌های بعد از درمان</h2><ul><li *ngFor="let a of service.aftercare">{{a}}</li></ul></div>
  </section>

  <section class="split">
    <div>
      <h2>مراقبت‌های قبل از درمان</h2>
      <details *ngFor="let item of beforeCare"><summary>{{item.title}}</summary><p>{{item.text}}</p></details>
    </div>
    <div>
      <h2>اشتباهات رایج و باورهای غلط</h2>
      <details *ngFor="let item of myths"><summary>{{item.title}}</summary><p>{{item.text}}</p></details>
    </div>
  </section>

  <section class="surface-block"><h2>ریسک‌ها و محدودیت‌ها</h2><ul><li *ngFor="let r of service.risks">{{r}}</li></ul></section>

  <section><h2>سوالات متداول {{service.title}}</h2><details *ngFor="let f of service.faqs"><summary>{{f.question}}</summary><p>{{f.answer}}</p></details></section>

  <section><div class="section-title-row"><div><h2>خدمات مرتبط</h2></div><div class="slider-controls"><button type="button" (click)="scroll(relatedRail,1)" aria-label="بعدی"><app-fa-icon name="chevronRight"></app-fa-icon></button><button type="button" (click)="scroll(relatedRail,-1)" aria-label="قبلی"><app-fa-icon name="chevronLeft"></app-fa-icon></button></div></div><div class="testimonial-rail" #relatedRail><a class="card related-card" *ngFor="let r of related" [routerLink]="'/services/'+r.id"><span class="service-icon"><app-fa-icon name="arrowLeft"></app-fa-icon></span><h3>{{r.title}}</h3><p>{{r.description}}</p></a></div></section>

  <section class="split doctor-panel"><div><h2>توصیه دکتر سعید مقدم</h2><p>مشاوره قبل از درمان باعث می‌شود انتخاب نهایی بر اساس سلامت دهان، بودجه، زمان و انتظار واقعی بیمار باشد؛ نه تبلیغات یا تصمیم عجولانه.</p></div><span class="floating-card top">ارزیابی تخصصی</span></section>

  <section><div class="section-title-row"><div><h2>تجربه بیماران</h2></div><div class="slider-controls"><button type="button" (click)="scroll(reviewRail,1)" aria-label="بعدی"><app-fa-icon name="chevronRight"></app-fa-icon></button><button type="button" (click)="scroll(reviewRail,-1)" aria-label="قبلی"><app-fa-icon name="chevronLeft"></app-fa-icon></button></div></div><div class="testimonial-rail" #reviewRail><div class="card quote-card" *ngFor="let t of testimonials.slice(0,3)"><span class="quote-mark"><app-fa-icon name="quote"></app-fa-icon></span><p>«{{t.text}}»</p><b>{{t.name}}</b><span class="credential">{{t.service}}</span></div></div></section>

  <section class="cta"><h2>برای شروع درمان {{service.title}} آماده‌اید؟</h2><p>تلفن: ۰۲۱-۰۰۰۰۰۰۰۰ | آدرس: تهران، خیابان نمونه، پلاک نمونه</p><a class="btn" routerLink="/contact">درخواست تماس مشاور</a></section>
</article>}`,
styleUrls:['../../public-pages.css']})
export class ServiceDetailComponent{data=inject(ClinicDataService);doc=inject(DOCUMENT);beforeCare=[{title:'معاینه را عقب نیندازید',text:'قبل از شروع درمان، بهتر است وضعیت لثه، پوسیدگی‌ها، عکس‌ها و داروهای مصرفی دقیق بررسی شود تا طرح درمان ایمن‌تر باشد.'},{title:'انتظار خود را واضح بیان کنید',text:'اگر هدف شما زیبایی، کاهش درد، جایگزینی دندان یا اصلاح عملکرد جویدن است، بیان دقیق آن به انتخاب روش درست کمک می‌کند.'},{title:'بهداشت دهان را جدی بگیرید',text:'مسواک، نخ دندان و کنترل التهاب لثه قبل از درمان باعث افزایش کیفیت و ماندگاری نتیجه می‌شود.'}];myths=[{title:'هر درمانی برای همه مناسب است',text:'انتخاب درمان به وضعیت دندان، لثه، استخوان، سن، عادت‌های دهانی و انتظار بیمار بستگی دارد.'},{title:'نتیجه فقط به جنس مواد وابسته است',text:'کیفیت اجرا، تشخیص درست و مراقبت بیمار به اندازه مواد مصرفی در نتیجه نهایی اهمیت دارد.'},{title:'اگر درد ندارم نیاز به مراجعه نیست',text:'بسیاری از مشکلات دندانپزشکی در مراحل اولیه بدون درد هستند و معاینه دوره‌ای از درمان‌های پیچیده‌تر پیشگیری می‌کند.'}];scroll(el:HTMLElement,dir:number){el.scrollBy({left:dir*360,behavior:'smooth'});}service=this.data.getServiceById(inject(ActivatedRoute).snapshot.paramMap.get('id')||'');related=this.service?this.data.getRelatedServices(this.service.id):[];testimonials=this.data.getTestimonials();constructor(t:Title,m:Meta){if(this.service){t.setTitle(this.service.metaTitle!);m.updateTag({name:'description',content:this.service.metaDescription!});let link=this.doc.querySelector('link[rel="canonical"]') as HTMLLinkElement|null;if(!link){link=this.doc.createElement('link');link.setAttribute('rel','canonical');this.doc.head.appendChild(link);}link.setAttribute('href',location.href);m.updateTag({property:'og:title',content:this.service.metaTitle!});m.updateTag({property:'og:description',content:this.service.metaDescription!});}}}
