import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
export const authGuard: CanActivateFn = (_route, state) => inject(AuthService).session() ? true : inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
export const roleGuard: CanActivateFn = () => inject(AuthService).isAdmin() ? true : inject(Router).createUrlTree(['/forbidden']);
export function safeReturnUrl(value: string | null): string {
  return value && /^\/(employees|roles|policies|audit)(\/|\?|$)/.test(value) ? value : '/employees';
}
