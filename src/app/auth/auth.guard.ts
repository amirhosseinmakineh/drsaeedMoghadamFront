import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, UserRole } from '../services/auth.service';

export const authGuard: CanActivateFn = route => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getToken();
  const role = auth.getRole();

  if (!token || !role) {
    return router.createUrlTree(['/'], { queryParams: { auth: 'login' } });
  }

  const allowedRoles = route.data?.['roles'] as UserRole[] | undefined;

  if (!allowedRoles || allowedRoles.includes(role) || role === 'ADMIN') {
    return true;
  }

  return router.createUrlTree([auth.getDashboardUrl(role)]);
};

export const dashboardRedirectGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.getToken()) {
    return router.createUrlTree(['/'], { queryParams: { auth: 'login' } });
  }

  return router.createUrlTree([auth.getDashboardUrl()]);
};
