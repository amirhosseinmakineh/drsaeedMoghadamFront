import { CanActivateFn, Router } from "@angular/router";
import { inject } from "@angular/core";
import { AuthRole, AuthService } from "./auth.service";

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) return true;

  return router.parseUrl("/");
};

export const roleGuard = (allowedRoles: AuthRole[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const user = auth.user();

    if (!user) return router.parseUrl("/");
    if (allowedRoles.includes(user.role)) return true;

    return router.parseUrl(auth.dashboardUrl(user));
  };
};

export const dashboardRedirectGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.user();

  if (!user) return router.parseUrl("/");

  return router.parseUrl(auth.dashboardUrl(user));
};
