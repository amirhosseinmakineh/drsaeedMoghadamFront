import { Component, DestroyRef, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';
import { normalizeName, normalizePhone, validName, validPhone } from './consultation-input';

interface ClinicService { id: number; title: string; }

@Component({
  selector: 'app-consultation-request', standalone: true, imports: [FormsModule],
  templateUrl: './consultation-request.component.html', styleUrl: './consultation-request.component.scss',
})
export class ConsultationRequestComponent {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly url = `${environment.apiBaseUrl.replace(/\/$/, '')}/consultation-requests`;
  readonly services = signal<ClinicService[]>([]);
  readonly loadingServices = signal(false);
  readonly servicesError = signal('');
  readonly sending = signal(false);
  readonly saved = signal(false);
  readonly feedback = signal('');
  readonly validName = validName;
  readonly validPhone = validPhone;
  name = ''; phone = ''; description = ''; serviceIds: number[] = [];
  private requestId = '';
  private fingerprint = '';

  constructor() { this.loadServices(); }

  loadServices(): void {
    if (this.loadingServices()) return;
    this.loadingServices.set(true); this.servicesError.set('');
    this.http.get<ClinicService[]>(`${this.url}/services`).pipe(timeout(15000), takeUntilDestroyed(this.destroyRef),
      finalize(() => this.loadingServices.set(false))).subscribe({
      next: services => {
        this.services.set(services);
        if (!services.length) this.servicesError.set('در حال حاضر خدمتی برای انتخاب فعال نیست. لطفاً با کلینیک تماس بگیرید.');
      },
      error: () => this.servicesError.set('دریافت خدمات انجام نشد. اتصال اینترنت را بررسی و دوباره تلاش کنید.'),
    });
  }
  changed(): void { this.saved.set(false); this.feedback.set(''); }
  toggleService(id: number, checked: boolean): void {
    this.serviceIds = checked ? [...this.serviceIds, id] : this.serviceIds.filter(value => value !== id);
    this.changed();
  }
  get valid(): boolean {
    return validName(this.name) && validPhone(this.phone) && this.serviceIds.length > 0 && this.serviceIds.length <= 10 &&
      this.serviceIds.every(id => this.services().some(service => service.id === id)) && this.description.length <= 1000;
  }
  submit(): void {
    if (this.sending() || this.saved()) return;
    if (!this.valid) { this.feedback.set('لطفاً نام، شماره موبایل و خدمت موردنظر را به‌درستی وارد کنید.'); return; }
    const payload = { fullName: normalizeName(this.name), phoneNumber: normalizePhone(this.phone),
      serviceIds: [...this.serviceIds].sort((a, b) => a - b), description: this.description.trim() || null };
    const fingerprint = JSON.stringify(payload);
    if (fingerprint !== this.fingerprint) {
      this.requestId = crypto.randomUUID(); this.fingerprint = fingerprint;
    }
    this.sending.set(true); this.feedback.set('');
    this.http.post<{ saved: boolean; message: string }>(this.url, payload, {
      headers: new HttpHeaders({ 'Idempotency-Key': this.requestId }),
    }).pipe(timeout(20000), takeUntilDestroyed(this.destroyRef), finalize(() => this.sending.set(false))).subscribe({
      next: response => {
        if (response.saved === true) {
          this.saved.set(true);
          this.feedback.set('درخواست مشاوره شما با موفقیت ثبت شد. همکاران ما برای هماهنگی با شما تماس خواهند گرفت.');
        } else this.feedback.set('تأیید ثبت درخواست دریافت نشد. دوباره تلاش کنید.');
      },
      error: (error: HttpErrorResponse) => {
        const messages: Record<number, string> = {
          400: 'اطلاعات فرم یا خدمات انتخابی معتبر نیست. آن‌ها را بررسی کنید.',
          409: 'امکان ثبت درخواست جدید با این اطلاعات وجود ندارد. برای پیگیری با کلینیک تماس بگیرید.',
          429: 'تعداد درخواست‌ها زیاد است. یک دقیقه دیگر تلاش کنید.',
        };
        this.feedback.set(messages[error.status] ?? 'ارتباط با سرور برقرار نشد یا پاسخ دریافت نشد. اطلاعات شما حفظ شده؛ دوباره تلاش کنید.');
      },
    });
  }
}
