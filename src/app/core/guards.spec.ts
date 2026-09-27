import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { authGuard, roleGuard, safeReturnUrl } from './guards';

describe('guards', () => {
  const route = {} as ActivatedRouteSnapshot;
  const state = { url: '/policies/new' } as RouterStateSnapshot;
  let signedIn: boolean;
  let admin: boolean;
  beforeEach(() => {
    signedIn = false; admin = false;
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: AuthService, useValue: { session: () => signedIn ? { role: admin ? 'admin' : 'auditor' } : null, isAdmin: () => admin } }] });
  });
  it('redirects anonymous users and preserves the requested path', () => {
    const result = TestBed.runInInjectionContext(() => authGuard(route, state));
    expect(TestBed.inject(Router).serializeUrl(result as ReturnType<Router['createUrlTree']>)).toBe('/login?returnUrl=%2Fpolicies%2Fnew');
  });
  it('allows authenticated users to read', () => {
    signedIn = true;
    expect(TestBed.runInInjectionContext(() => authGuard(route, state))).toBe(true);
  });
  it('denies auditors and allows administrators to create', () => {
    signedIn = true;
    const result = TestBed.runInInjectionContext(() => roleGuard(route, state));
    expect(TestBed.inject(Router).serializeUrl(result as ReturnType<Router['createUrlTree']>)).toBe('/forbidden');
    admin = true;
    expect(TestBed.runInInjectionContext(() => roleGuard(route, state))).toBe(true);
  });
  it('limits return destinations to local feature routes', () => {
    expect(safeReturnUrl('https://external.example')).toBe('/employees');
    expect(safeReturnUrl('//external.example')).toBe('/employees');
    expect(safeReturnUrl('/login')).toBe('/employees');
    expect(safeReturnUrl('/policies/new')).toBe('/policies/new');
  });
});
