import { Routes } from '@angular/router';
// Auth guards are disabled until the backend auth flow is ready.

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'services', loadComponent: () => import('./pages/services/services.component').then(m => m.ServicesComponent) },
  { path: 'services/:id', loadComponent: () => import('./pages/service-detail/service-detail.component').then(m => m.ServiceDetailComponent) },
  { path: 'doctor', loadComponent: () => import('./pages/doctor/doctor.component').then(m => m.DoctorComponent) },
  { path: 'booking', loadComponent: () => import('./pages/booking/booking.component').then(m => m.BookingComponent) },
  { path: 'gallery', loadComponent: () => import('./pages/gallery/gallery.component').then(m => m.GalleryComponent) },
  { path: 'faq', loadComponent: () => import('./pages/faq/faq.component').then(m => m.FaqComponent) },
  { path: 'dashboard', redirectTo: 'dashboard/patient', pathMatch: 'full' },
  {
    path: 'dashboard/admin',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'dashboard/consultant',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'dashboard/patient',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },

  {
    path: 'dashboard/users',
    loadComponent: () => import('./pages/dashboard/user-management/user-management.component').then(m => m.UserManagementComponent)
  },
  {
    path: 'dashboard/consultants',
    loadComponent: () => import('./pages/dashboard/consultant-management/consultant-management.component').then(m => m.ConsultantManagementComponent)
  },
  {
    path: 'dashboard/consultants/:consultantId/leads',
    loadComponent: () => import('./pages/dashboard/consultant-leads/consultant-leads.component').then(m => m.ConsultantLeadsComponent)
  },
  {
    path: 'dashboard/consultants/:consultantId/attendance',
    loadComponent: () => import('./pages/dashboard/consultant-attendance/consultant-attendance.component').then(m => m.ConsultantAttendanceComponent)
  },
  { path: '**', redirectTo: '' }
];
