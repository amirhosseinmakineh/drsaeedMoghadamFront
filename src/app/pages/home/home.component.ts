import { Component, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '../../shared/ui/fa-icon/fa-icon.component';
import { Meta, Title } from '@angular/platform-browser';
import { ClinicDataService } from '../../services/clinic-data.service';
@Component({selector:'app-home',standalone:true,imports:[NgFor,RouterLink,FaIconComponent],template:`
<section class="hero home-hero">
  <div>
    <p class="eyebrow">کلینیک تخصصی دندانپزشکی</p>
    <h1>لبخندی سالم، طبیعی و زیبا با دندانپزشکی مدرن</h1>
    <p>در کلینیک دندانپزشکی دکتر سعید مقدم، درمان‌های تخصصی و زیبایی دندان با تمرکز بر آرامش بیمار، دقت درمان و نتیجه‌ای طبیعی انجام می‌شود.</p>
    <a class="btn" routerLink="/contact">رزرو مشاوره</a>
    <a class="btn ghost" routerLink="/services">مشاهده خدمات</a>
    <div class="trust-row" aria-label="شاخص‌های اعتماد کلینیک">
      <span class="trust-pill"><app-fa-icon name="star"></app-fa-icon> +۵۰۰۰ مراجعه‌کننده</span>
      <span class="trust-pill"><app-fa-icon name="doctor"></app-fa-icon> ۱۵ سال سابقه</span>
      <span class="trust-pill"><app-fa-icon name="shield"></app-fa-icon> ۹۸٪ رضایت بیماران</span>
    </div>
  </div>
  <div class="hero-media">
    <img src="https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=900&q=80" alt="کلینیک دندانپزشکی مدرن">
    <span class="floating-card top"><app-fa-icon name="doctor"></app-fa-icon> تجربه تخصصی</span>
    <span class="floating-card middle"><app-fa-icon name="shield"></app-fa-icon> درمان بدون درد</span>
    <span class="floating-card bottom"><app-fa-icon name="calendar"></app-fa-icon> مشاوره دقیق</span>
  </div>
</section>

<section>
  <p class="eyebrow">خدمات منتخب</p>
  <h2>خدمات دندانپزشکی</h2>
  <p>درمان‌های ضروری و زیبایی، با توضیح شفاف و انتخاب روش مناسب برای هر بیمار.</p>
  <div class="grid services-grid">
    <article class="card icon-card" *ngFor="let s of services">
      <span class="service-icon"><app-fa-icon name="tooth"></app-fa-icon></span>
      <h3>{{s.title}}</h3>
      <p>{{s.description}}</p>
      <a [routerLink]="'/services/'+s.id">مشاهده خدمت <span><app-fa-icon name="arrowLeft"></app-fa-icon></span></a>
    </article>
  </div>
</section>

<section class="split doctor-panel">
  <div class="doctor-image-wrap"><img [src]="doctor.image" alt="دکتر سعید مقدم"><span class="floating-card bottom">۱۵+ سال تجربه</span></div>
  <div>
    <p class="eyebrow">درباره پزشک</p>
    <h2>دکتر سعید مقدم</h2>
    <p>{{doctor.bio}}</p>
    <span class="credential">دندانپزشکی زیبایی</span>
    <span class="credential">ایمپلنت دندان</span>
    <span class="credential">طراحی لبخند</span>
    <br>
    <a class="btn" routerLink="/about">درباره ما</a>
  </div>
</section>

<section>
  <p class="eyebrow">مزیت کلینیک</p>
  <h2>چرا کلینیک ما؟</h2>
  <div class="grid mini">
    <article class="card icon-card" *ngFor="let w of why"><span class="service-icon"><app-fa-icon name="shield"></app-fa-icon></span><h3>{{w.title}}</h3><p>{{w.description}}</p></article>
  </div>
</section>

<section>
  <p class="eyebrow">مسیر درمان</p>
  <h2>سفر درمان در چهار مرحله</h2>
  <div class="timeline compact-timeline">
    <div class="timeline-item" *ngFor="let step of journey"><span>{{step.no}}</span><div><h3>{{step.title}}</h3><p>{{step.text}}</p></div></div>
  </div>
</section>

<section class="split before-after-premium">
  <div>
    <p class="eyebrow">نتیجه درمان</p>
    <h2>قبل و بعد درمان</h2>
    <p>نمونه نتایج درمان با تمرکز بر طبیعی بودن فرم لبخند و حفظ سلامت دهان.</p>
  </div>
  <div class="before-after-frame">
    <img src="https://placehold.co/700x460/f3e6d7/6d5440?text=قبل" alt="قبل از درمان">
    <img src="https://placehold.co/700x460/e7d0b8/6d5440?text=بعد" alt="بعد از درمان">
    <span class="before-label">قبل</span><span class="after-label">بعد</span><span class="handle"></span>
  </div>
</section>

<section>
  <div class="section-title-row"><div><p class="eyebrow">درمان‌های محبوب</p><h2>پرطرفدارترین خدمات</h2></div><div class="slider-controls"><button type="button" (click)="scroll(popularRail, 1)" aria-label="بعدی"><app-fa-icon name="chevronRight"></app-fa-icon></button><button type="button" (click)="scroll(popularRail, -1)" aria-label="قبلی"><app-fa-icon name="chevronLeft"></app-fa-icon></button></div></div>
  <div class="testimonial-rail" #popularRail>
    <article class="card icon-card" *ngFor="let s of popularServices"><span class="service-icon"><app-fa-icon name="tooth"></app-fa-icon></span><h3>{{s.title}}</h3><p>{{s.description}}</p><a [routerLink]="'/services/'+s.id">جزئیات <span><app-fa-icon name="arrowLeft"></app-fa-icon></span></a></article>
  </div>
</section>

<section>
  <div class="section-title-row"><div><p class="eyebrow">تجربه بیماران</p><h2>نظرات بیماران</h2></div><div class="slider-controls"><button type="button" (click)="scroll(testimonialRail, 1)" aria-label="بعدی"><app-fa-icon name="chevronRight"></app-fa-icon></button><button type="button" (click)="scroll(testimonialRail, -1)" aria-label="قبلی"><app-fa-icon name="chevronLeft"></app-fa-icon></button></div></div>
  <div class="testimonial-rail" #testimonialRail>
    <article class="card quote-card" *ngFor="let t of testimonials">
      <span class="quote-mark"><app-fa-icon name="quote"></app-fa-icon></span>
      <h3>{{t.name}}</h3>
      <span class="credential">{{t.service}}</span>
      <p>«{{t.text}}»</p>
    </article>
  </div>
</section>

<section>
  <p class="eyebrow">پاسخ‌های کوتاه</p>
  <h2>سوالات متداول</h2>
  <details *ngFor="let f of faqs"><summary>{{f.question}}</summary><p>{{f.answer}}</p></details>
</section>

<section class="cta">
  <h2>برای شروع درمان، مشاوره تخصصی رزرو کنید</h2>
  <a class="btn" routerLink="/contact">تماس با کلینیک</a>
  <a class="btn ghost" routerLink="/contact">رزرو مشاوره</a>
</section>`,styleUrls:['../../public-pages.css']})
export class HomeComponent{private data=inject(ClinicDataService);services=this.data.getServices();popularServices=this.services.filter(s=>['implant','laminate','composite','orthodontics'].includes(s.id));doctor=this.data.getDoctor();why=this.data.getWhyUs().slice(0,4);journey=[{no:1,title:'مشاوره و معاینه',text:'ابتدا وضعیت دهان، انتظار بیمار و اولویت درمان مشخص می‌شود.'},{no:2,title:'تصویربرداری و برنامه‌ریزی',text:'در صورت نیاز عکس و بررسی تکمیلی برای انتخاب روش دقیق انجام می‌شود.'},{no:3,title:'درمان مرحله‌ای',text:'درمان با تمرکز بر آرامش، دقت و حفظ بافت سالم انجام می‌شود.'},{no:4,title:'پیگیری و مراقبت',text:'نکات مراقبتی و زمان ویزیت‌های بعدی به بیمار توضیح داده می‌شود.'}];testimonials=this.data.getTestimonials();faqs=[...this.data.getFaqs(),{id:'h5',question:'آیا امکان انتخاب رنگ و فرم لبخند وجود دارد؟',answer:'بله، در درمان‌های زیبایی فرم و رنگ دندان با توجه به چهره، سن، رنگ پوست و انتظار بیمار انتخاب می‌شود.'},{id:'h6',question:'برای شروع درمان از کجا باید شروع کنم؟',answer:'بهترین شروع، رزرو جلسه مشاوره و بررسی دقیق شرایط دهان و دندان است.'}];scroll(el:HTMLElement,dir:number){el.scrollBy({left:dir*360,behavior:'smooth'});}constructor(t:Title,m:Meta){t.setTitle('کلینیک دندانپزشکی دکتر سعید مقدم | دندانپزشکی زیبایی و درمانی');m.updateTag({name:'description',content:'وب‌سایت رسمی کلینیک دندانپزشکی دکتر سعید مقدم؛ ایمپلنت دندان، لمینت دندان، کامپوزیت دندان، ارتودنسی و سفید کردن دندان.'});}}
