import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from "@angular/core";
@Component({
  selector: "app-base-modal",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@if (open) {
    <div class="backdrop" (click)="backdropClick($event)">
      <section role="dialog" aria-modal="true" [attr.aria-labelledby]="titleId">
        <header>
          <h2 [id]="titleId">{{ title }}</h2>
          <button type="button" aria-label="بستن" (click)="close.emit()">
            ×
          </button>
        </header>
        <main><ng-content /></main>
        <footer><ng-content select="[baseModalFooter]" /></footer>
      </section>
    </div>
  }`,
  styleUrl: "./modal.component.scss",
})
export class BaseModalComponent {
  @Input() open = false;
  @Input({ required: true }) title = "";
  @Input() closeOnBackdrop = true;
  @Output() close = new EventEmitter<void>();
  readonly titleId = `bm-modal-${Math.random().toString(36).slice(2)}`;
  @HostListener("document:keydown.escape") onEscape(): void {
    if (this.open) {
      this.close.emit();
    }
  }
  backdropClick(event: MouseEvent): void {
    if (this.closeOnBackdrop && event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}
