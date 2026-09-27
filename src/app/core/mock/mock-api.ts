import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { defer, switchMap, timer } from 'rxjs';
import { AuditEntry, Employee, Policy, PolicyInput, Session } from '../models';
import { policyErrors } from '../policy-rules';
import { AUDIT, EMPLOYEES, POLICIES, ROLES } from './seed';

const SESSIONS: Session[] = [
  { token: 'demo-admin', name: 'Anna Kowalska', email: 'admin@policyadmin.demo', role: 'admin' },
  { token: 'demo-auditor', name: 'Michał Nowak', email: 'auditor@policyadmin.demo', role: 'auditor' },
];
@Injectable({ providedIn: 'root' })
export class MockDatabase {
  readonly employees: Employee[] = structuredClone(EMPLOYEES);
  readonly policies: Policy[] = structuredClone(POLICIES);
  readonly audit: AuditEntry[] = structuredClone(AUDIT);
  handle(request: HttpRequest<unknown>): HttpResponse<unknown> {
    const fail = (status: number, message: string): never => { throw new HttpErrorResponse({ status, error: { message }, url: request.url }); };
    const respond = (body: unknown, status = 200) => new HttpResponse({ body: structuredClone(body), status });
    const url = request.url;
    if (url === '/api/auth/login' && request.method === 'POST') {
      const body = request.body as { email?: string; password?: string } | null;
      const session = SESSIONS.find(item => item.email === body?.email?.trim().toLowerCase());
      if (!session || body?.password !== 'PolicyDemo123!') return fail(401, 'Invalid email address or password.');
      this.audit.unshift({ id: crypto.randomUUID(), actor: session.name, action: 'Signed in to the dashboard', target: 'PolicyAdmin', createdAt: new Date().toISOString(), outcome: 'success' });
      return respond(session);
    }
    const session = SESSIONS.find(item => request.headers.get('Authorization') === `Bearer ${item.token}`);
    if (!session) return fail(401, 'Your session has expired. Please sign in again.');
    if (request.method === 'GET') {
      const normalized = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l').toLowerCase();
      const search = normalized(request.params.get('search') ?? '').trim();
      const paginate = <T>(items: T[]) => {
        const numberParam = (key: string, fallback: number, max: number) => {
          const raw = Number(request.params.get(key) ?? fallback);
          return Number.isFinite(raw) ? Math.min(max, Math.max(1, Math.floor(raw))) : fallback;
        };
        const pageSize = numberParam('pageSize', 10, 50);
        const page = numberParam('page', 1, Math.max(1, Math.ceil(items.length / pageSize)));
        return respond({ items: items.slice((page - 1) * pageSize, page * pageSize), total: items.length, page, pageSize });
      };
      if (url === '/api/employees/stats') return respond({ total: this.employees.length, active: this.employees.filter(e => e.status === 'active').length, invited: this.employees.filter(e => e.status === 'invited').length, suspended: this.employees.filter(e => e.status === 'suspended').length });
      if (url === '/api/employees') return paginate(this.employees.filter(employee =>
        normalized(`${employee.name} ${employee.email} ${employee.id}`).includes(search) &&
        (!request.params.get('department') || employee.department === request.params.get('department')) &&
        (!request.params.get('status') || employee.status === request.params.get('status'))));
      if (url.startsWith('/api/employees/')) {
        const employee = this.employees.find(item => item.id === decodeURIComponent(url.split('/').at(-1) ?? ''));
        return employee ? respond(employee) : fail(404, 'Employee not found.');
      }
      if (url === '/api/roles') return respond(ROLES);
      if (url === '/api/policies') return respond(this.policies);
      if (url === '/api/audit') return paginate(this.audit.filter(entry => normalized(`${entry.actor} ${entry.action} ${entry.target}`).includes(search) && (!request.params.get('outcome') || entry.outcome === request.params.get('outcome'))));
    }
    if (url === '/api/policies' && request.method === 'POST') {
      if (session.role !== 'admin') {
        this.audit.unshift({ id: crypto.randomUUID(), actor: session.name, action: 'Policy creation denied', target: 'Access policies', createdAt: new Date().toISOString(), outcome: 'denied' });
        return fail(403, 'Only administrators can create policies.');
      }
      const value = request.body;
      if (!value || typeof value !== 'object') return fail(400, 'Invalid policy data.');
      const input = value as PolicyInput;
      if (['name', 'description', 'roleId', 'resource', 'environment', 'effect', 'duration', 'startsAt', 'endsAt'].some(key => typeof (value as Record<string, unknown>)[key] !== 'string') || !Array.isArray(input.actions) || typeof input.requireMfa !== 'boolean') return fail(400, 'Invalid policy data.');
      const errors = policyErrors(input);
      if (Object.keys(errors).length) return fail(400, Object.values(errors)[0]);
      if (this.policies.some(policy => policy.name.toLowerCase() === input.name.trim().toLowerCase())) return fail(409, 'A policy with this name already exists.');
      const policy: Policy = { ...input, name: input.name.trim(), startsAt: input.duration === 'scheduled' ? input.startsAt : '', endsAt: input.duration === 'scheduled' ? input.endsAt : '', id: `POL-${String(this.policies.length + 1).padStart(3, '0')}`, createdAt: new Date().toISOString(), createdBy: session.name };
      this.policies.unshift(policy);
      this.audit.unshift({ id: crypto.randomUUID(), actor: session.name, action: 'Policy created', target: policy.name, createdAt: policy.createdAt, outcome: 'success' });
      return respond(policy, 201);
    }
    return fail(404, 'API endpoint not found.');
  }
}
export const mockApiInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith('/api/')) return next(request);
  const database = inject(MockDatabase);
  return timer(180).pipe(switchMap(() => defer(() => [database.handle(request)])));
};
