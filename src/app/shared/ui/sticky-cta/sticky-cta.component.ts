import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sticky-cta',
  standalone: true,
  imports: [RouterLink],
  template: `<a class="sticky-cta" routerLink="/contact"><span>رزرو مشاوره</span></a>`,
  styles: [`.sticky-cta{position:fixed;bottom:88px;left:22px;z-index:90;background:#211a16;color:#fff;padding:11px 17px;border-radius:999px;font-size:13px;font-weight:900;text-decoration:none;display:flex;align-items:center;box-shadow:0 16px 42px rgba(33,26,22,.22);transition:transform .22s ease,box-shadow .22s ease}.sticky-cta:hover{transform:translateY(-2px);box-shadow:0 20px 50px rgba(33,26,22,.28)}@media(min-width:769px){.sticky-cta{bottom:28px;left:28px}}@media(max-width:760px){.sticky-cta{right:16px;left:16px;bottom:64px;justify-content:center;padding:12px 18px}}`]
})
export class StickyCtaComponent {}
