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
    if (allowedRoles.some((role) => auth.hasRole(role, user))) return true;

    if (auth.needsRoleSelection(user)) {
      return router.parseUrl(auth.roleSelectionUrl());
    }

    return router.parseUrl(auth.dashboardUrl(user));
  };
};
