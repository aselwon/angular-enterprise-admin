import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { Policy, PolicyInput } from '../../core/models';
import { PolicyStore } from './policy-store';
describe('PolicyStore', () => {
  it('tracks pending writes, reports errors and supports retry', () => {
    let response = new Subject<Policy>();
    const api = { createPolicy: vi.fn(() => response.asObservable()) };
    TestBed.configureTestingModule({ providers: [PolicyStore, { provide: ApiService, useValue: api }] });
    const store = TestBed.inject(PolicyStore);
    const input: PolicyInput = { name: 'Store policy', description: '', roleId: 'member', resource: 'Infrastructure', environment: 'staging', effect: 'allow', actions: ['Read'], duration: 'permanent', startsAt: '', endsAt: '', requireMfa: false };
    store.create(input).subscribe({ error: () => undefined });
    expect(store.saving()).toBe(true); expect(store.status()).toBe('Saving');
    response.error({ error: { message: 'Name conflict.' } });
    expect(store.saving()).toBe(false); expect(store.error()).toBe('Name conflict.'); expect(store.saved()).toBeNull();
    response = new Subject<Policy>();
    store.create(input).subscribe();
    expect(store.error()).toBe('');
    response.next({ ...input, id: 'POL-004', createdAt: new Date().toISOString(), createdBy: 'Admin' });
    response.complete();
    expect(store.saving()).toBe(false); expect(store.status()).toBe('Saved'); expect(store.saved()?.id).toBe('POL-004');
  });
});
