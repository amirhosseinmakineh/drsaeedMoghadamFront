import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-before-after-slider',
  standalone: true,
  template: `
    <div class="slider-container" #container>
      <div class="image-wrapper">
        <img class="after-image" [src]="afterImage" [alt]="title" loading="lazy" />
        <div class="before-image-wrapper" [style.width.%]="sliderPosition">
          <img class="before-image" [src]="beforeImage" [alt]="title + ' before'" loading="lazy" />
        </div>
        <div class="slider-handle" [style.right.%]="sliderPosition" (mousedown)="startDrag($event)" (touchstart)="startDrag($event)">
          <div class="handle-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>
      </div>
      <div class="slider-labels">
        <span class="label">بعد</span>
        <span class="label">قبل</span>
      </div>
    </div>
  `,
  styles: [`
    .slider-container {
      position: relative;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    .image-wrapper {
      position: relative;
      width: 100%;
      aspect-ratio: 3/2;
      overflow: hidden;
      cursor: ew-resize;
    }
    .after-image {
      position: absolute;
      top: 0;
      right: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .before-image-wrapper {
      position: absolute;
      top: 0;
      right: 0;
      height: 100%;
      overflow: hidden;
      z-index: 2;
    }
    .before-image {
      position: absolute;
      top: 0;
      right: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .slider-handle {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 4px;
      background: #fff;
      z-index: 3;
      transform: translateX(50%);
      box-shadow: 0 0 12px rgba(0,0,0,0.2);
      cursor: ew-resize;
    }
    .handle-circle {
      position: absolute;
      top: 50%;
      right: 50%;
      transform: translate(50%, -50%);
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }
    .handle-circle svg {
      width: 16px;
      height: 16px;
      color: #2c2c2c;
    }
    .slider-labels {
      display: flex;
      justify-content: space-between;
      padding: 10px 16px;
      background: #fff;
      direction: rtl;
    }
    .label {
      font-size: 12px;
      font-weight: 600;
      color: #888;
      letter-spacing: 0.5px;
    }
  `]
})
export class BeforeAfterSliderComponent {
  @Input() beforeImage = '';
  @Input() afterImage = '';
  @Input() title = '';
  @ViewChild('container') container!: ElementRef;

  sliderPosition = 50;
  isDragging = false;

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;
    this.updatePosition(event.clientX);
  }

  @HostListener('document:touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    if (!this.isDragging) return;
    this.updatePosition(event.touches[0].clientX);
  }

  @HostListener('document:mouseup')
  @HostListener('document:touchend')
  onDragEnd() {
    this.isDragging = false;
  }

  startDrag(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  private updatePosition(clientX: number) {
    const rect = this.container.nativeElement.getBoundingClientRect();
    const x = rect.right - clientX;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    this.sliderPosition = pct;
  }
}
