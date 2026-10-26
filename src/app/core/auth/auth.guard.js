import { Router } from "@angular/router";
import { inject } from "@angular/core";
import { AuthService } from "./auth.service";

export const authGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) return true;

  return router.parseUrl("/");
};

export const dashboardRedirectGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.user();

  return user
    ? router.parseUrl(auth.dashboardUrl(user))
    : router.parseUrl("/");
};

export const roleGuard = (allowedRoles) => {
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
