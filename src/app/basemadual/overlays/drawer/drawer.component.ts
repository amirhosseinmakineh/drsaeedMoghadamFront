import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from "@angular/core";
@Component({
  selector: "app-base-drawer",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@if (open) {
    <div class="backdrop" (click)="backdropClick($event)">
      <aside
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="title"
        [class.loading]="loading"
      >
        <header>
          <h2>{{ title }}</h2>
          <button type="button" aria-label="بستن" (click)="close.emit()">
            ×
          </button>
        </header>
        <main><ng-content /></main>
        <footer><ng-content select="[baseDrawerFooter]" /></footer>
      </aside>
    </div>
  }`,
  styleUrl: "./drawer.component.scss",
})
export class BaseDrawerComponent {
  @Input() open = false;
  @Input({ required: true }) title = "";
  @Input() loading = false;
  @Input() closeOnBackdrop = true;
  @Output() close = new EventEmitter<void>();
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
