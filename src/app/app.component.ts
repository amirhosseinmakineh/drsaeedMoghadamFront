import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/ui/header/header.component';
import { MobileNavComponent } from './shared/ui/mobile-nav/mobile-nav.component';
import { FooterComponent } from './shared/ui/footer/footer.component';
import { StickyCtaComponent } from './shared/ui/sticky-cta/sticky-cta.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, MobileNavComponent, FooterComponent, StickyCtaComponent],
  template: `
    <app-header></app-header>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
    <app-sticky-cta></app-sticky-cta>
    <app-mobile-nav></app-mobile-nav>
  `,
  styles: [`
    .main-content {
      min-height: 100vh;
      padding-bottom: 80px;
    }
  `]
})
export class AppComponent {}
