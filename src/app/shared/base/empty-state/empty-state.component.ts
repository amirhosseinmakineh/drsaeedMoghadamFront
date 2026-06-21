import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section>
      <h2>{{ title }}</h2>
      <p *ngIf="description">{{ description }}</p>
      <button *ngIf="actionLabel" type="button" (click)="actionClick.emit()">{{ actionLabel }}</button>
    </section>
  `
})
export class EmptyStateComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() actionLabel = '';

  @Output() actionClick = new EventEmitter<void>();
}
