import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated) {
      router.navigate(['/login']);
      return false;
    }

    if (authService.hasAnyRole(allowedRoles)) {
      return true;
    }

    // Redirigir según el rol del usuario
    const userRole = authService.userRole;
    if (userRole === 'HR') {
      router.navigate(['/hr']);
    } else if (userRole === 'Supervisor') {
      router.navigate(['/supervisor']);
    } else if (userRole === 'Employee') {
      router.navigate(['/employee']);
    } else {
      router.navigate(['/login']);
    }
    
    return false;
  };
};
