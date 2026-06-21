import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export type DialogMode = 'create' | 'edit' | 'delete' | 'view';

@Component({
  selector: 'app-base-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section *ngIf="open" role="dialog" aria-modal="true" [attr.aria-label]="title || mode">
      <header>
        <h2 *ngIf="title">{{ title }}</h2>
      </header>

      <main>
        <ng-content></ng-content>
      </main>

      <footer>
        <button type="button" (click)="cancel()">Cancel</button>
        <button type="button" (click)="confirm()">Confirm</button>
      </footer>
    </section>
  `
})
export class BaseDialogComponent {
  @Input() open = false;
  @Input() mode: DialogMode = 'view';
  @Input() title = '';

  @Output() openChange = new EventEmitter<boolean>();
  @Output() confirmClick = new EventEmitter<DialogMode>();
  @Output() cancelClick = new EventEmitter<DialogMode>();

  confirm(): void {
    this.confirmClick.emit(this.mode);
  }

  cancel(): void {
    this.close();
    this.cancelClick.emit(this.mode);
  }

  close(): void {
    this.open = false;
    this.openChange.emit(this.open);
  }
}
