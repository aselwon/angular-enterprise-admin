import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { Session } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly state = signal<Session | null>(this.restore());
  readonly session = this.state.asReadonly();
  readonly isAdmin = computed(() => this.state()?.role === 'admin');
  login(email: string, password: string) {
    return this.http.post<Session>('/api/auth/login', { email, password }).pipe(tap(session => {
      this.state.set(session);
      try { sessionStorage.setItem('policyadmin.session', JSON.stringify(session)); } catch { /* Storage may be disabled. */ }
    }));
  }
  logout() {
    this.state.set(null);
    try { sessionStorage.removeItem('policyadmin.session'); } catch { /* In-memory logout still succeeds. */ }
  }
  private restore(): Session | null {
    try {
      const value: unknown = JSON.parse(sessionStorage.getItem('policyadmin.session') ?? 'null');
      if (value && typeof value === 'object' && 'token' in value && 'role' in value && 'name' in value && 'email' in value &&
        typeof value.name === 'string' && typeof value.email === 'string' &&
        ((value.role === 'admin' && value.token === 'demo-admin') || (value.role === 'auditor' && value.token === 'demo-auditor'))) return value as Session;
    } catch { /* Invalid or unavailable storage means signed out. */ }
    return null;
  }
}
