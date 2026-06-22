import { Routes } from '@angular/router';
import { authGuard, dashboardRedirectGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'services', loadComponent: () => import('./pages/services/services.component').then(m => m.ServicesComponent) },
  { path: 'services/:id', loadComponent: () => import('./pages/service-detail/service-detail.component').then(m => m.ServiceDetailComponent) },
  { path: 'doctor', loadComponent: () => import('./pages/doctor/doctor.component').then(m => m.DoctorComponent) },
  { path: 'booking', loadComponent: () => import('./pages/booking/booking.component').then(m => m.BookingComponent) },
  { path: 'gallery', loadComponent: () => import('./pages/gallery/gallery.component').then(m => m.GalleryComponent) },
  { path: 'faq', loadComponent: () => import('./pages/faq/faq.component').then(m => m.FaqComponent) },
  { path: 'dashboard', canActivate: [dashboardRedirectGuard], children: [] },
  {
    path: 'dashboard/admin',
    canActivate: [authGuard],
    data: { roles: ['ADMIN'], role: 'ADMIN' },
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'dashboard/consultant',
    canActivate: [authGuard],
    data: { roles: ['CONSULTANT'], role: 'CONSULTANT' },
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'dashboard/patient',
    canActivate: [authGuard],
    data: { roles: ['PATIENT'], role: 'PATIENT' },
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  { path: '**', redirectTo: '' }
];
