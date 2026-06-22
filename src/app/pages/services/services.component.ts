import { Component, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { ClinicDataService } from '../../services/clinic-data.service';
@Component({selector:'app-services',standalone:true,imports:[NgFor,RouterLink],template:`
<section>
  <h1>خدمات دندانپزشکی</h1>
  <p>در کلینیک دندانپزشکی دکتر سعید مقدم مجموعه‌ای از درمان‌های زیبایی، ترمیمی و تخصصی شامل ایمپلنت دندان، لمینت دندان، کامپوزیت دندان، ارتودنسی، سفید کردن دندان، درمان ریشه، دندانپزشکی کودکان و درمان لثه ارائه می‌شود.</p>
  <div class="grid">
    <article class="card" *ngFor="let s of services">
      <span class="service-icon">✦</span>
      <h2>{{s.title}}</h2>
      <p>{{s.description}}</p>
      <a class="btn ghost" [routerLink]="'/services/'+s.id">اطلاعات کامل</a>
    </article>
  </div>
</section>`,styleUrls:['../../public-pages.css']})
export class ServicesComponent{services=inject(ClinicDataService).getServices();constructor(t:Title,m:Meta){t.setTitle('خدمات دندانپزشکی | کلینیک دکتر سعید مقدم');m.updateTag({name:'description',content:'لیست کامل خدمات کلینیک دندانپزشکی دکتر سعید مقدم شامل ایمپلنت، لمینت، کامپوزیت، ارتودنسی، سفید کردن دندان و درمان ریشه.'});}}
