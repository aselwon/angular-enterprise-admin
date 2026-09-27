import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { authInterceptor, errorInterceptor } from './interceptors';
import { mockApiInterceptor } from './mock/mock-api';
import { PolicyInput } from './models';

describe('mock API + auth service + interceptors', () => {
  let api: ApiService;
  let auth: AuthService;
  const toast = { open: vi.fn() };
  const input: PolicyInput = { name: 'Test policy', description: '', roleId: 'member', resource: 'Infrastructure', environment: 'production', effect: 'allow', actions: ['Read'], duration: 'permanent', startsAt: '', endsAt: '', requireMfa: true };
  beforeEach(() => {
    sessionStorage.clear(); toast.open.mockClear();
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient(withInterceptors([errorInterceptor, authInterceptor, mockApiInterceptor])), { provide: MatSnackBar, useValue: toast }] });
    api = TestBed.inject(ApiService); auth = TestBed.inject(AuthService);
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });
  afterEach(() => sessionStorage.clear());
  const login = (role = 'admin') => firstValueFrom(TestBed.inject(AuthService).login(`${role}@policyadmin.demo`, 'PolicyDemo123!'));
  it('rejects bad credentials and displays a toast', async () => {
    await expect(firstValueFrom(auth.login('admin@policyadmin.demo', 'wrong'))).rejects.toMatchObject({ status: 401 });
    expect(auth.session()).toBeNull(); expect(toast.open).toHaveBeenCalled();
  });
  it('stores and clears the demo session', async () => {
    await login(); expect(auth.isAdmin()).toBe(true);
    expect(sessionStorage.getItem('policyadmin.session')).toContain('demo-admin');
    auth.logout(); expect(auth.session()).toBeNull(); expect(sessionStorage.getItem('policyadmin.session')).toBeNull();
  });
  it('restores a valid session and rejects malformed storage', () => {
    sessionStorage.setItem('policyadmin.session', '{not-json');
    const invalid = TestBed.runInInjectionContext(() => new AuthService());
    expect(invalid.session()).toBeNull();
    sessionStorage.setItem('policyadmin.session', JSON.stringify({ token: 'demo-auditor', role: 'auditor', name: 'Auditor', email: 'auditor@policyadmin.demo' }));
    const restored = TestBed.runInInjectionContext(() => new AuthService());
    expect(restored.session()?.role).toBe('auditor'); expect(restored.isAdmin()).toBe(false);
  });
  it('rejects API requests without auth and redirects to login', async () => {
    await expect(firstValueFrom(api.roles())).rejects.toMatchObject({ status: 401 });
    expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(['/login'], expect.any(Object));
  });
  it('filters the entire employee set before paginating', async () => {
    await login();
    const first = await firstValueFrom(api.employees({ search: '', department: '', status: '', page: 1, pageSize: 10 }));
    const second = await firstValueFrom(api.employees({ search: '', department: '', status: '', page: 2, pageSize: 10 }));
    expect(first.total).toBe(24); expect(first.items).toHaveLength(10); expect(second.items[0].id).toBe('EMP-011');
    const filtered = await firstValueFrom(api.employees({ search: 'tomasz', department: 'Engineering', status: 'active', page: 1, pageSize: 10 }));
    expect(filtered.total).toBe(1); expect(filtered.items[0].id).toBe('EMP-024');
    const empty = await firstValueFrom(api.employees({ search: 'nonexistent', department: '', status: '', page: 9, pageSize: 10 }));
    expect(empty.items).toEqual([]); expect(empty.page).toBe(1);
  });
  it('returns a detail and 404 for an unknown employee', async () => {
    await login(); expect((await firstValueFrom(api.employee('EMP-001'))).name).toBe('Anna Kowalska');
    await expect(firstValueFrom(api.employee('missing'))).rejects.toMatchObject({ status: 404 });
  });
  it('creates a policy, records audit, and rejects a duplicate', async () => {
    await login(); const policy = await firstValueFrom(api.createPolicy(input));
    expect(policy.id).toBe('POL-004'); expect(policy.createdBy).toBe('Anna Kowalska');
    expect((await firstValueFrom(api.policies()))[0].name).toBe(input.name);
    const audit = await firstValueFrom(api.audit('Test policy', 'success', 1));
    expect(audit.items[0].action).toBe('Policy created');
    await expect(firstValueFrom(api.createPolicy({ ...input, name: '  TEST POLICY  ' }))).rejects.toMatchObject({ status: 409 });
  });
  it('enforces conditional validation in the API as well as the form', async () => {
    await login();
    await expect(firstValueFrom(api.createPolicy({ ...input, requireMfa: false }))).rejects.toMatchObject({ status: 400 });
    await expect(firstValueFrom(api.createPolicy({ ...input, duration: 'scheduled', startsAt: '', endsAt: '' }))).rejects.toMatchObject({ status: 400 });
    await expect(firstValueFrom(TestBed.inject(HttpClient).post('/api/policies', { name: 123 }))).rejects.toBeInstanceOf(HttpErrorResponse);
  });
  it('blocks auditor writes at the API boundary and audits denial', async () => {
    await login('auditor');
    expect((await firstValueFrom(api.roles()))).toHaveLength(3);
    await expect(firstValueFrom(api.createPolicy(input))).rejects.toMatchObject({ status: 403 });
    const entries = await firstValueFrom(api.audit('', 'denied', 1));
    expect(entries.total).toBe(1); expect(entries.items[0].actor).toBe('Michał Nowak');
    expect((await firstValueFrom(api.policies()))).toHaveLength(3);
  });
});
