import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export type DialogMode = 'create' | 'edit' | 'delete' | 'view' | 'auth';

@Component({
  selector: 'app-base-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="open" class="dialog-backdrop" (click)="cancel()">
      <section class="base-dialog" role="dialog" aria-modal="true" [attr.aria-label]="title || mode" (click)="$event.stopPropagation()">
        <button class="dialog-close" type="button" (click)="cancel()" aria-label="Close">×</button>
        <header *ngIf="title || subtitle">
          <p *ngIf="subtitle">{{ subtitle }}</p>
          <h2 *ngIf="title">{{ title }}</h2>
        </header>
        <main><ng-content></ng-content></main>
        <footer *ngIf="showFooter">
          <button class="ghost" type="button" (click)="cancel()">{{ cancelText }}</button>
          <button class="solid" type="button" (click)="confirm()">{{ confirmText }}</button>
        </footer>
      </section>
    </div>
  `,
  styles: [`
    .dialog-backdrop{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:18px;background:rgba(20,16,12,.42);backdrop-filter:blur(10px)}
    .base-dialog{position:relative;width:min(480px,100%);max-height:92vh;overflow:auto;border:1px solid rgba(191,151,93,.25);border-radius:30px;background:linear-gradient(145deg,#fffaf2,#ffffff);box-shadow:0 30px 90px rgba(31,25,18,.22);padding:26px;animation:dialogIn .28s ease both;color:#2d241c}
    .dialog-close{position:absolute;left:18px;top:14px;width:36px;height:36px;border:0;border-radius:50%;background:#f7efe4;color:#8a6334;font-size:26px;cursor:pointer}
    header{padding-left:42px;margin-bottom:18px} header p{margin:0 0 6px;color:#b78342;font-weight:900} h2{margin:0;font-size:1.55rem} main{display:grid;gap:14px} footer{display:flex;justify-content:flex-end;gap:10px;margin-top:20px}.ghost,.solid{border:0;border-radius:999px;padding:11px 18px;font-weight:900;cursor:pointer}.ghost{background:#f7efe4;color:#6f5334}.solid{background:#0e7c86;color:#fff}@keyframes dialogIn{from{opacity:0;transform:translateY(18px) scale(.96)}to{opacity:1;transform:none}}
  `]
})
export class BaseDialogComponent {
  @Input() open = false;
  @Input() mode: DialogMode = 'view';
  @Input() title = '';
  @Input() subtitle = '';
  @Input() showFooter = true;
  @Input() confirmText = 'تایید';
  @Input() cancelText = 'انصراف';
  @Output() openChange = new EventEmitter<boolean>();
  @Output() confirmClick = new EventEmitter<DialogMode>();
  @Output() cancelClick = new EventEmitter<DialogMode>();
  confirm(): void { this.confirmClick.emit(this.mode); }
  cancel(): void { this.close(); this.cancelClick.emit(this.mode); }
  close(): void { this.open = false; this.openChange.emit(this.open); }
}
