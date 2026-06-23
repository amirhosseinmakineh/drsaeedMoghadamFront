import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { FaIconComponent } from '../../shared/ui/fa-icon/fa-icon.component';

type Portfolio = { treatment: string; duration: string; text: string; before: string; after: string };
type Faq = { q: string; a: string };

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgFor, NgIf, FaIconComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  menuOpen = false;
  portfolioIndex = 0;
  testimonialIndex = 0;
  openFaq = 0;

  nav = ['خانه', 'خدمات', 'نمونه‌کارها', 'درباره دکتر', 'تماس'];

  services = [
    { icon: 'tooth', title: 'ایمپلنت دندان', text: 'جایگزینی دقیق دندان با فرم طبیعی و ماندگار.' },
    { icon: 'sparkle', title: 'لمینت دندان', text: 'طراحی لبخند روشن، ظریف و هماهنگ با چهره.' },
    { icon: 'check', title: 'کامپوزیت ونیر', text: 'اصلاح فرم و رنگ دندان در زمان کوتاه.' },
    { icon: 'shield', title: 'ارتودنسی', text: 'مرتب‌سازی اصولی دندان‌ها با برنامه درمانی شفاف.' },
    { icon: 'star', title: 'سفید کردن دندان', text: 'بلیچینگ کنترل‌شده برای لبخندی تمیزتر و درخشان‌تر.' },
    { icon: 'doctor', title: 'درمان ریشه', text: 'درمان دقیق درد و عفونت با حفظ ساختار دندان.' }
  ];

  portfolios: Portfolio[] = [
    { treatment: 'طراحی لبخند با لمینت', duration: '۱۴ روز', text: 'اصلاح فرم، رنگ و تقارن لبخند با نتیجه‌ای طبیعی.', before: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=900&q=80', after: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=900&q=80' },
    { treatment: 'ایمپلنت دندان', duration: '۳ ماه', text: 'بازسازی دندان از دست رفته با تمرکز بر عملکرد و زیبایی.', before: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=900&q=80', after: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=900&q=80' },
    { treatment: 'کامپوزیت ونیر', duration: '۱ جلسه', text: 'اصلاح شکستگی‌های ظریف و روشن‌تر شدن فرم لبخند.', before: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=900&q=80', after: 'https://images.unsplash.com/photo-1600170311833-c2cf5280ce49?w=900&q=80' }
  ];

  popular = ['ایمپلنت', 'لمینت', 'کامپوزیت', 'ارتودنسی', 'بلیچینگ'].map((title, i) => ({ title, text: ['بازسازی مطمئن دندان', 'لبخندی سفید و هماهنگ', 'اصلاح سریع فرم دندان', 'نظم اصولی و زیبا', 'درخشندگی کنترل‌شده'][i] }));

  testimonials = [
    { name: 'مهسا رضایی', treatment: 'لمینت دندان', text: 'نتیجه کاملاً طبیعی شد و روند درمان با آرامش پیش رفت.' },
    { name: 'علی محمدی', treatment: 'ایمپلنت', text: 'توضیحات دکتر دقیق بود و بعد از درمان احساس اطمینان داشتم.' },
    { name: 'سارا احمدی', treatment: 'کامپوزیت ونیر', text: 'فرم لبخندم بدون اغراق تغییر کرد؛ دقیقاً همان چیزی که می‌خواستم.' },
    { name: 'نیما کاظمی', treatment: 'درمان ریشه', text: 'دردم خیلی زود کنترل شد و تجربه درمان برخلاف تصورم راحت بود.' }
  ];

  faqs: Faq[] = [
    { q: 'آیا درمان درد دارد؟', a: 'قبل از شروع، شرایط دندان بررسی می‌شود و درمان با روش‌های کنترل درد و آرامش بیمار انجام می‌گیرد.' },
    { q: 'هزینه درمان چگونه مشخص می‌شود؟', a: 'هزینه پس از معاینه، نوع درمان، تعداد دندان‌ها و مواد مورد استفاده به‌صورت شفاف اعلام می‌شود.' },
    { q: 'آیا قبل از درمان مشاوره انجام می‌شود؟', a: 'بله، مشاوره تخصصی برای بررسی نیازها، اولویت‌ها و طراحی مسیر درمان انجام می‌شود.' },
    { q: 'ایمپلنت چقدر ماندگاری دارد؟', a: 'با اجرای صحیح و مراقبت مناسب، ایمپلنت دندان می‌تواند سال‌ها عملکرد پایدار داشته باشد.' },
    { q: 'سفید کردن دندان به مینای دندان آسیب می‌زند؟', a: 'در صورت انجام اصولی و کنترل‌شده، بلیچینگ به مینای دندان آسیب جدی وارد نمی‌کند.' },
    { q: 'چگونه نوبت رزرو کنم؟', a: 'از دکمه‌های رزرو مشاوره یا تماس با کلینیک در همین صفحه استفاده کنید.' }
  ];

  steps = ['مشاوره اولیه', 'بررسی تخصصی', 'طراحی درمان', 'پیگیری پس از درمان'];
  doctorChips = ['دندانپزشکی زیبایی', 'طراحی لبخند', 'درمان‌های تخصصی'];

  constructor(title: Title, meta: Meta) {
    title.setTitle('کلینیک دندانپزشکی دکتر سعید مقدم | طراحی لبخند، ایمپلنت و لمینت دندان');
    meta.updateTag({ name: 'description', content: 'لندینگ کلینیک دندانپزشکی دکتر سعید مقدم؛ دندانپزشکی زیبایی، ایمپلنت دندان، لمینت دندان و طراحی لبخند با تجربه‌ای آرام و مدرن.' });
  }

  scroll(el: HTMLElement, direction: number) { el.scrollBy({ left: direction * -320, behavior: 'smooth' }); }
  changePortfolio(direction: number) { this.portfolioIndex = (this.portfolioIndex + direction + this.portfolios.length) % this.portfolios.length; }
  setFaq(index: number) { this.openFaq = this.openFaq === index ? -1 : index; }
}
