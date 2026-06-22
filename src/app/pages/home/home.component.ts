import { Component, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { ClinicDataService } from '../../services/clinic-data.service';
@Component({selector:'app-home',standalone:true,imports:[NgFor,RouterLink],template:`
<section class="hero home-hero">
  <div>
    <p class="eyebrow">کلینیک تخصصی دندانپزشکی</p>
    <h1>لبخندی سالم، طبیعی و زیبا با دندانپزشکی مدرن</h1>
    <p>در کلینیک دندانپزشکی دکتر سعید مقدم، درمان‌های تخصصی و زیبایی دندان با تمرکز بر آرامش بیمار، دقت درمان و نتیجه‌ای طبیعی انجام می‌شود.</p>
    <a class="btn" routerLink="/contact">رزرو مشاوره</a>
    <a class="btn ghost" routerLink="/services">مشاهده خدمات</a>
    <div class="trust-row" aria-label="شاخص‌های اعتماد کلینیک">
      <span class="trust-pill">+۵۰۰۰ مراجعه‌کننده</span>
      <span class="trust-pill">۱۵ سال سابقه</span>
      <span class="trust-pill">۹۸٪ رضایت بیماران</span>
    </div>
  </div>
  <div class="hero-media">
    <img src="https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=900&q=80" alt="کلینیک دندانپزشکی مدرن">
    <span class="floating-card top">تجربه تخصصی</span>
    <span class="floating-card middle">درمان بدون درد</span>
    <span class="floating-card bottom">مشاوره دقیق</span>
  </div>
</section>

<section>
  <p class="eyebrow">خدمات منتخب</p>
  <h2>خدمات دندانپزشکی</h2>
  <p>درمان‌های ضروری و زیبایی، با توضیح شفاف و انتخاب روش مناسب برای هر بیمار.</p>
  <div class="grid services-grid">
    <article class="card icon-card" *ngFor="let s of services">
      <span class="service-icon">✦</span>
      <h3>{{s.title}}</h3>
      <p>{{s.description}}</p>
      <a [routerLink]="'/services/'+s.id">مشاهده خدمت <span>←</span></a>
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
    <article class="card icon-card" *ngFor="let w of why"><span class="service-icon">◇</span><h3>{{w.title}}</h3><p>{{w.description}}</p></article>
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
  <p class="eyebrow">تجربه بیماران</p>
  <h2>نظرات بیماران</h2>
  <div class="testimonial-rail">
    <article class="card quote-card" *ngFor="let t of testimonials">
      <span class="quote-mark">“</span>
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
export class HomeComponent{private data=inject(ClinicDataService);services=this.data.getServices();doctor=this.data.getDoctor();why=this.data.getWhyUs();testimonials=this.data.getTestimonials();faqs=this.data.getFaqs();constructor(t:Title,m:Meta){t.setTitle('کلینیک دندانپزشکی دکتر سعید مقدم | دندانپزشکی زیبایی و درمانی');m.updateTag({name:'description',content:'وب‌سایت رسمی کلینیک دندانپزشکی دکتر سعید مقدم؛ ایمپلنت دندان، لمینت دندان، کامپوزیت دندان، ارتودنسی و سفید کردن دندان.'});}}
