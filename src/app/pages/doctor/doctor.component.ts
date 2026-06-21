import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor } from '@angular/common';
import { ClinicDataService } from '../../services/clinic-data.service';
import { DoctorInfo } from '../../models/clinic.model';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-doctor',
  standalone: true,
  imports: [RouterLink, NgFor],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  template: `
    <div class="doctor-hero" @fadeIn>
      <div class="doctor-image">
        <img [src]="doctor.image" [alt]="doctor.name" loading="lazy" />
      </div>
      <div class="doctor-intro">
        <span class="doctor-label">درباره پزشک</span>
        <h1 class="doctor-name">{{ doctor.name }}</h1>
        <span class="doctor-title">{{ doctor.title }}</span>
        <p class="doctor-bio">{{ doctor.bio }}</p>
        <div class="doctor-badges">
          <span class="badge">{{ doctor.experience }} تجربه</span>
          <span class="badge">FICOI</span>
          <span class="badge">بورد هاروارد</span>
        </div>
        <a class="btn-primary" routerLink="/booking">رزرو مشاوره</a>
      </div>
    </div>

    <section class="doctor-section" @fadeIn>
      <div class="section-grid">
        <div class="section-block">
          <h2>تخصص‌ها</h2>
          <ul class="check-list">
            <li *ngFor="let s of doctor.specialties">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              {{ s }}
            </li>
          </ul>
        </div>
        <div class="section-block">
          <h2>تحصیلات</h2>
          <ul class="text-list">
            <li *ngFor="let e of doctor.education">{{ e }}</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="doctor-section alt" @fadeIn>
      <div class="section-grid">
        <div class="section-block">
          <h2>گواهینامه‌ها</h2>
          <ul class="check-list">
            <li *ngFor="let c of doctor.certifications">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              {{ c }}
            </li>
          </ul>
        </div>
        <div class="section-block">
          <h2>افتخارات</h2>
          <ul class="award-list">
            <li *ngFor="let a of doctor.awards">
              <svg class="award-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
              {{ a }}
            </li>
          </ul>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .doctor-hero {
      display: grid;
      grid-template-columns: 420px 1fr;
      gap: 48px;
      max-width: 1100px;
      margin: 0 auto;
      padding: 48px 24px;
      align-items: center;
    }
    .doctor-image {
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 12px 48px rgba(0,0,0,0.12);
    }
    .doctor-image img {
      width: 100%;
      display: block;
    }
    .doctor-intro {
      display: flex;
      flex-direction: column;
    }
    .doctor-label {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #a08b6d;
      margin-bottom: 12px;
    }
    .doctor-name {
      font-size: clamp(32px, 5vw, 48px);
      font-weight: 800;
      color: #2c2c2c;
      margin: 0 0 6px;
      line-height: 1.15;
    }
    .doctor-title {
      font-size: 18px;
      color: #888;
      font-weight: 500;
      margin-bottom: 20px;
    }
    .doctor-bio {
      font-size: 15px;
      color: #555;
      line-height: 1.8;
      margin: 0 0 24px;
    }
    .doctor-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 28px;
    }
    .badge {
      background: #f0e6d9;
      color: #5a4a32;
      font-size: 12px;
      font-weight: 700;
      padding: 8px 14px;
      border-radius: 20px;
    }
    .btn-primary {
      background: #0066cc;
      color: #fff;
      padding: 14px 32px;
      border-radius: 28px;
      text-decoration: none;
      font-size: 15px;
      font-weight: 700;
      transition: all 0.25s ease;
      display: inline-block;
      align-self: flex-start;
    }
    .btn-primary:hover {
      background: #0055aa;
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,102,204,0.25);
    }
    .doctor-section {
      padding: 48px 24px;
      max-width: 1100px;
      margin: 0 auto;
    }
    .doctor-section.alt {
      background: #f7f3ee;
      border-radius: 32px;
      max-width: 1100px;
      margin: 0 auto 40px;
    }
    .section-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
    }
    .section-block h2 {
      font-size: 22px;
      font-weight: 800;
      color: #2c2c2c;
      margin: 0 0 24px;
    }
    .check-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .check-list li {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      font-size: 15px;
      color: #555;
      line-height: 1.6;
    }
    .check-list li svg {
      width: 20px;
      height: 20px;
      color: #4a8b5a;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .text-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .text-list li {
      font-size: 15px;
      color: #555;
      line-height: 1.6;
      padding-right: 20px;
      position: relative;
    }
    .text-list li::before {
      content: '';
      position: absolute;
      right: 0;
      top: 9px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #a08b6d;
    }
    .award-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .award-list li {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      font-size: 15px;
      color: #555;
      line-height: 1.6;
    }
    .award-icon {
      width: 20px;
      height: 20px;
      color: #d4a843;
      flex-shrink: 0;
      margin-top: 1px;
    }
    @media (max-width: 768px) {
      .doctor-hero {
        grid-template-columns: 1fr;
        padding: 32px 20px;
        gap: 32px;
      }
      .doctor-image { max-height: 400px; }
      .section-grid { grid-template-columns: 1fr; gap: 32px; }
      .doctor-section { padding: 32px 20px; }
      .doctor-section.alt { border-radius: 24px; }
    }
  `]
})
export class DoctorComponent {
  doctor: DoctorInfo;

  constructor(private data: ClinicDataService) {
    this.doctor = this.data.getDoctor();
  }
}
