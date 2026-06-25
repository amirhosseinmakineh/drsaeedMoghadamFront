import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LanguageCode } from '../../../models/clinic.model';
import { FaIconComponent } from '../../ui/fa-icon/fa-icon.component';

@Component({
  selector: 'app-base-dialog',
  standalone: true,
  imports: [CommonModule, FaIconComponent],
  template: `
    <div *ngIf="open" class="dialog-backdrop" [attr.dir]="language === 'fa' ? 'rtl' : 'ltr'" (click)="close()">
      <section
        class="base-dialog"
        [class.wide]="size === 'wide'"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="title"
        (click)="$event.stopPropagation()"
      >
        <button class="dialog-close" type="button" (click)="close()" [attr.aria-label]="language === 'fa' ? 'بستن' : 'Close'">
          <app-fa-icon name="close"></app-fa-icon>
        </button>
        <header *ngIf="title || subtitle">
          <h2 *ngIf="title">{{ title }}</h2>
          <p *ngIf="subtitle" class="dialog-subtitle">{{ subtitle }}</p>
        </header>
        <main class="dialog-content"><ng-content></ng-content></main>
        <footer *ngIf="showFooter">
          <button class="dialog-btn ghost" type="button" (click)="close()">{{ cancelText }}</button>
          <button class="dialog-btn solid" type="button" (click)="confirm()">{{ confirmText }}</button>
        </footer>
      </section>
    </div>
  `,
  styles: [`
    .dialog-backdrop{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:18px;background:rgba(43,33,24,.34)}
    .base-dialog{position:relative;width:min(520px,100%);max-height:92vh;overflow:auto;border:1px solid color-mix(in srgb,var(--line,#d9e3ea) 75%,transparent);border-radius:34px;background:linear-gradient(145deg,var(--surface,#fff),var(--surface-soft,#f8fbff));box-shadow:0 24px 70px rgba(93,64,32,.16);padding:28px;color:var(--text,#13202b)}
    .base-dialog.wide{width:min(760px,100%)}
    .base-dialog::before{content:'';position:absolute;inset:0 0 auto;height:112px;border-radius:34px 34px 46% 46%;background:radial-gradient(circle at 18% 0,color-mix(in srgb,var(--brand,#a8793f) 22%,transparent),transparent 58%);pointer-events:none}
    .dialog-close{position:absolute;inset-block-start:16px;inset-inline-end:16px;z-index:2;display:grid;place-items:center;width:40px;height:40px;border:0;border-radius:16px;background:color-mix(in srgb,var(--surface-muted,#efe2d0) 86%,transparent);color:var(--brand,#a8793f);cursor:pointer}
    header{position:relative;z-index:1;margin-bottom:20px;padding-inline-end:48px}.dialog-subtitle{margin:10px 0 0;color:var(--muted,#786a59)}h2{margin:0;font-size:clamp(1.45rem,4vw,2rem);line-height:1.25}.dialog-content{position:relative;z-index:1;display:grid;gap:14px}footer{position:relative;z-index:1;display:flex;justify-content:flex-end;gap:10px;margin-top:22px}.dialog-btn{border:0;border-radius:999px;padding:12px 18px;font-weight:900;cursor:pointer}.ghost{background:var(--surface-muted,#efe2d0);color:var(--text,#2c241b)}.solid{background:linear-gradient(135deg,var(--brand,#a8793f),var(--brand-2,#d7b16d));color:#1b1712;box-shadow:0 14px 34px color-mix(in srgb,var(--brand,#a8793f) 24%,transparent)}
    @media (max-width:640px){.dialog-backdrop{align-items:end;padding:10px}.base-dialog,.base-dialog.wide{width:100%;max-height:min(92vh,calc(100dvh - 20px));border-radius:26px;padding:20px 16px 16px}.base-dialog::before{border-radius:26px 26px 40% 40%;height:92px}.dialog-close{inset-block-start:12px;inset-inline-end:12px}header{margin-bottom:16px;padding-inline-end:44px}h2{font-size:1.35rem}}
  `]
})
export class BaseDialogComponent {
  @Input() open = false;
  @Input() language: LanguageCode = 'fa';
  @Input() title = '';
  @Input() subtitle = '';
  @Input() showFooter = true;
  @Input() size: 'default' | 'wide' = 'default';
  @Input() confirmText = 'تایید';
  @Input() cancelText = 'انصراف';
  @Output() openChange = new EventEmitter<boolean>();
  @Output() confirmClick = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  confirm(): void {
    this.confirmClick.emit();
  }

  close(): void {
    this.open = false;
    this.openChange.emit(this.open);
    this.closed.emit();
  }
}
