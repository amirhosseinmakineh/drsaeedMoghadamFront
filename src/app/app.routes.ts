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
    path: "select-dashboard",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./pages/select-dashboard/select-dashboard.component").then(
        (m) => m.SelectDashboardComponent,
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
    path: "dashboard/secretary",
    canActivate: [authGuard, roleGuard(["secretary"])],
    loadComponent: () =>
      import("./pages/secretary-dashboard/secretary-dashboard.component").then(
        (m) => m.SecretaryDashboardComponent,
      ),
    data: { role: "secretary" },
  },
  {
    path: "secretary/reservation-attendance-reviews",
    redirectTo: "dashboard/secretary",
    pathMatch: "full",
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
