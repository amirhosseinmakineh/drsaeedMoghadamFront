import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sticky-cta',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a class="sticky-cta" routerLink="/booking">
      <span>رزرو نوبت</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
    </a>
  `,
  styles: [`
    .sticky-cta {
      position: fixed;
      bottom: 88px;
      left: 24px;
      z-index: 90;
      background: #0066cc;
      color: #fff;
      padding: 14px 24px;
      border-radius: 28px;
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 8px 24px rgba(0,102,204,0.3);
      transition: all 0.3s ease;
    }
    .sticky-cta:hover {
      background: #0055aa;
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(0,102,204,0.4);
    }
    .sticky-cta svg {
      width: 16px;
      height: 16px;
      transform: rotate(180deg);
    }
    @media (min-width: 769px) {
      .sticky-cta {
        bottom: 32px;
        left: 32px;
      }
    }
  `]
})
export class StickyCtaComponent {}
