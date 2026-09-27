import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const session = inject(AuthService).session();
  return next(session && request.url.startsWith('/api/') ? request.clone({ setHeaders: { Authorization: `Bearer ${session.token}` } }) : request);
};
export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const snack = inject(MatSnackBar);
  const auth = inject(AuthService);
  const router = inject(Router);
  return next(request).pipe(catchError((error: HttpErrorResponse) => {
    const message = typeof error.error?.message === 'string' ? error.error.message : 'Unable to load data. Please try again.';
    snack.open(message, 'Close', { duration: 6000, politeness: 'assertive' });
    if (error.status === 401 && request.url !== '/api/auth/login') {
      auth.logout();
      void router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
    }
    return throwError(() => error);
  }));
};
