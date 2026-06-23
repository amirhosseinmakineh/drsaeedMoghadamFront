import { NgFor, NgIf } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { AuthDialogComponent } from '../../auth/auth-dialog.component';
import { LeadFormModel, LanguageCode, NavItem, Service, SliderItem, ThemeMode } from '../../models/clinic.model';
import { PersianDatePickerComponent } from '../../shared/base/persian-date-picker/persian-date-picker.component';
import { FaIconComponent } from '../../shared/ui/fa-icon/fa-icon.component';

type CopySet = { nav: NavItem[]; badge: string; title: string; text: string; primary: string; secondary: string; phoneTitle: string; phoneText: string; };

@Component({ selector: 'app-home', standalone: true, imports: [NgFor, NgIf, FormsModule, RouterLink, FaIconComponent, AuthDialogComponent, PersianDatePickerComponent], templateUrl: './home.component.html', styleUrl: './home.component.scss' })
export class HomeComponent {
  lang = signal<LanguageCode>('fa'); theme = signal<ThemeMode>('light'); showAuth = false; menuOpen = false; activeSlide = 0;
  lead: LeadFormModel = { fullName: '', phone: '', serviceId: 'implant', message: '' };
  copy: Record<LanguageCode, CopySet> = {
    fa: { nav: [{label:'خانه',href:'#home',icon:'tooth'},{label:'خدمات',href:'#services',icon:'sparkle'},{label:'نمونه‌ها',href:'#gallery',icon:'star'},{label:'درباره ما',href:'/about',icon:'doctor'},{label:'تماس',href:'/contact',icon:'phone'}], badge:'کلینیک تخصصی دندانپزشکی زیبایی', title:'لبخندی آرام، طبیعی و لوکس با درمان‌های دقیق دندانپزشکی', text:'در کلینیک دکتر سعید مقدم، مسیر درمان با تحلیل لبخند، مشاوره شفاف و تجربه‌ای شبیه یک اپلیکیشن مدرن آغاز می‌شود؛ بدون رزرو نوبت آنلاین و با تمرکز بر ورود، عضویت و تماس مستقیم.', primary:'ورود / عضویت', secondary:'مشاهده خدمات', phoneTitle:'درخواست تماس مشاور', phoneText:'شماره‌تان را بگذارید تا مشاور کلینیک برای انتخاب بهترین مسیر درمان با شما تماس بگیرد.' },
    en: { nav: [{label:'Home',href:'#home',icon:'tooth'},{label:'Services',href:'#services',icon:'sparkle'},{label:'Cases',href:'#gallery',icon:'star'},{label:'About',href:'/about',icon:'doctor'},{label:'Contact',href:'/contact',icon:'phone'}], badge:'Premium cosmetic dental clinic', title:'Calm, natural and premium smiles with precise dentistry', text:'Dr. Saeed Moghaddam clinic blends smile analysis, transparent consultation and a polished app-like mobile experience with direct contact, sign in and membership actions.', primary:'Sign in / Join', secondary:'Explore services', phoneTitle:'Request a consultant call', phoneText:'Leave your number and our consultant will call you to suggest the right treatment path.' }
  };
  services: Service[] = ['implant','laminate','composite','orthodontics','bleaching','root-canal'].map((id, index) => ({ id, title: ['ایمپلنت دندان','لمینت سرامیکی','کامپوزیت ونیر','ارتودنسی شفاف','بلیچینگ تخصصی','درمان ریشه'][index], subtitle: ['بازسازی عملکرد و زیبایی','طراحی لبخند ظریف','اصلاح سریع فرم دندان','نظم لبخند با برنامه دقیق','درخشندگی کنترل‌شده','حفظ دندان طبیعی'][index], description: ['جایگزینی دندان از دست رفته با طرح درمان دیجیتال و ظاهر طبیعی.','پوسته‌های ظریف سرامیکی برای اصلاح رنگ، فرم و تقارن لبخند.','راهکار محافظه‌کارانه برای تغییر فرم و رنگ در زمان کوتاه.','برنامه مرتب‌سازی دندان‌ها با پایش شفاف و مرحله‌ای.','روشن‌تر شدن لبخند با پروتکل ایمن و کنترل حساسیت.','درمان درد و عفونت با تمرکز بر حفظ ساختار دندان.'][index], fullDescription: 'شرح کامل درمان، مزایا، مراقبت‌ها و پاسخ سوالات پرتکرار در صفحه اختصاصی خدمت ارائه می‌شود.', image: `https://images.unsplash.com/photo-${['1606811971618-4486d14f3f99','1609840114035-3c981b782dfe','1588776814546-1ffcf47267a5','1629909613654-28e377c37b09','1600170311833-c2cf5280ce49','1606811841689-23dfddce3e95'][index]}?w=640&q=70`, heroImage: '', beforeImage: '', afterImage: '', icon: ['tooth','sparkle','check','shield','star','doctor'][index], price: 'پس از معاینه', duration: ['۳ تا ۶ ماه','۱۰ تا ۱۴ روز','۱ تا ۲ جلسه','۶ تا ۱۸ ماه','۱ جلسه','۱ تا ۲ جلسه'][index], features: ['مشاوره شفاف','مواد باکیفیت','پیگیری پس از درمان'], steps: [], faqs: [] }));
  slides: SliderItem[] = [
    { title: 'Smile Design Motion', text: 'موشن گرافی فرم لبخند، آنالیز چهره و پیش‌نمایش نتیجه قبل از شروع درمان.', image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=900&q=70', badge: 'Digital' },
    { title: 'Calm Treatment Suite', text: 'فضایی روشن، کرم و مینیمال برای کاهش استرس و تجربه درمان آرام.', image: 'https://images.unsplash.com/photo-1629909615184-74f495363b67?w=900&q=70', badge: 'Comfort' },
    { title: 'Premium Care', text: 'هر درمان با پروتکل مراقبت، آموزش و تماس پیگیری تکمیل می‌شود.', image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=900&q=70', badge: 'Care' }
  ];
  faqs = ['هزینه درمان چطور مشخص می‌شود؟','آیا امکان رزرو نوبت آنلاین وجود دارد؟','آیا سایت دو زبانه است؟','شماره تماس را کجا ثبت کنم؟'];
  constructor(title: Title, meta: Meta) { title.setTitle('کلینیک دندانپزشکی دکتر سعید مقدم | ایمپلنت، لمینت و طراحی لبخند'); meta.updateTag({ name: 'description', content: 'وب‌سایت دوزبانه و ریسپانسیو کلینیک دندانپزشکی با خدمات اختصاصی، تماس مشاور، ورود و عضویت، تم روشن و تاریک.' }); }
  t() { return this.copy[this.lang()]; }
  toggleLang() { this.lang.set(this.lang() === 'fa' ? 'en' : 'fa'); }
  toggleTheme() { this.theme.set(this.theme() === 'light' ? 'dark' : 'light'); }
  nextSlide(direction: number) { this.activeSlide = (this.activeSlide + direction + this.slides.length) % this.slides.length; }
  submitLead() { this.lead.message = this.lead.message || 'درخواست تماس از صفحه اصلی ثبت شد.'; }
}
