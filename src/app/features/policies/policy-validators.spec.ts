import { FormControl, FormGroup } from '@angular/forms';
import { PolicyInput } from '../../core/models';
import { policyErrors } from '../../core/policy-rules';
import { policyValidator } from './policy-validators';
describe('policy conditional validators', () => {
  const valid: PolicyInput = { name: 'Access reports', description: '', roleId: 'auditor', resource: 'Financial data', environment: 'production', effect: 'allow', actions: ['Read'], duration: 'permanent', startsAt: '', endsAt: '', requireMfa: true };
  it('accepts a complete permanent policy without dates', () => expect(policyErrors(valid)).toEqual({}));
  it('requires MFA for production and all environments, but not staging or denial', () => {
    expect(policyErrors({ ...valid, requireMfa: false })['requireMfa']).toBeTruthy();
    expect(policyErrors({ ...valid, environment: 'all', requireMfa: false })['requireMfa']).toBeTruthy();
    expect(policyErrors({ ...valid, environment: 'staging', requireMfa: false })).toEqual({});
    expect(policyErrors({ ...valid, effect: 'deny', requireMfa: false })).toEqual({});
  });
  it('requires valid dates, a non-past start and an end after start', () => {
    const scheduled = { ...valid, duration: 'scheduled' as const };
    expect(policyErrors(scheduled, '2026-09-26')).toHaveProperty('startsAt');
    expect(policyErrors({ ...scheduled, startsAt: '2026-09-25', endsAt: '2026-10-01' }, '2026-09-26')).toHaveProperty('startsAt');
    expect(policyErrors({ ...scheduled, startsAt: '2026-09-26', endsAt: '2026-09-26' }, '2026-09-26')).toHaveProperty('endsAt');
    expect(policyErrors({ ...scheduled, startsAt: '2027-02-30', endsAt: '2027-03-10' }, '2026-09-26')).toHaveProperty('startsAt');
    expect(policyErrors({ ...scheduled, startsAt: '2026-09-26', endsAt: '2026-10-01' }, '2026-09-26')).toEqual({});
  });
  it('rejects whitespace-only names, absent actions and unknown roles', () => {
    const errors = policyErrors({ ...valid, name: '    ', roleId: 'owner', actions: [] });
    expect(Object.keys(errors)).toEqual(expect.arrayContaining(['name', 'roleId', 'actions']));
  });
  it('reactive validator updates when dependent controls change', () => {
    const form = new FormGroup(Object.fromEntries(Object.entries(valid).map(([key, value]) => [key, new FormControl(value)])), { validators: policyValidator });
    expect(form.valid).toBe(true);
    form.get('requireMfa')?.setValue(false); expect(form.hasError('requireMfa')).toBe(true);
    form.get('environment')?.setValue('staging'); expect(form.valid).toBe(true);
    form.get('duration')?.setValue('scheduled'); expect(form.hasError('startsAt')).toBe(true);
    form.get('duration')?.setValue('permanent'); expect(form.valid).toBe(true);
  });
});
