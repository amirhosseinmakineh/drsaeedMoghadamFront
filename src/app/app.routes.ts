import { Routes } from "@angular/router";
import { authGuard, roleGuard } from "./core/auth/auth.guard";

export const routes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./pages/home/home.component").then((m) => m.HomeComponent),
  },
  {
    path: "services",
    loadComponent: () =>
      import("./pages/services/services.component").then(
        (m) => m.ServicesComponent,
      ),
  },
  {
    path: "services/:id",
    loadComponent: () =>
      import("./pages/service-detail/service-detail.component").then(
        (m) => m.ServiceDetailComponent,
      ),
  },
  {
    path: "about",
    loadComponent: () =>
      import("./pages/about/about.component").then((m) => m.AboutComponent),
  },
  {
    path: "contact",
    loadComponent: () =>
      import("./pages/contact/contact.component").then(
        (m) => m.ContactComponent,
      ),
  },
  {
    path: "dashboard",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./pages/dashboard/dashboard.component").then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: "dashboard/admin",
    canActivate: [authGuard, roleGuard(["admin"])],
    loadComponent: () =>
      import("./pages/dashboard/dashboard.component").then(
        (m) => m.DashboardComponent,
      ),
    data: { role: "admin" },
  },
  {
    path: "dashboard/consultant",
    canActivate: [authGuard, roleGuard(["consultant"])],
    loadComponent: () =>
      import("./pages/consultant-dashboard/consultant-dashboard.component").then(
        (m) => m.ConsultantDashboardComponent,
      ),
    data: { role: "consultant" },
  },
  {
    path: "secretary/reservation-attendance-reviews",
    canActivate: [authGuard, roleGuard(["admin"])],
    loadComponent: () =>
      import("./pages/admin-dashboard/secretary-reservation-attendance-reviews.component").then(
        (m) => m.SecretaryReservationAttendanceReviewsComponent,
      ),
    data: { role: "admin" },
  },
  {
    path: "dashboard/patient",
    canActivate: [authGuard, roleGuard(["patient"])],
    loadComponent: () =>
      import("./pages/dashboard/dashboard.component").then(
        (m) => m.DashboardComponent,
      ),
    data: { role: "patient" },
  },
  { path: "**", redirectTo: "" },
];
