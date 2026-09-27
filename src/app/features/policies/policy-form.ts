import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ACTIONS, PolicyInput, RESOURCES } from '../../core/models';
import { policyValidator } from './policy-validators';
import { PolicyStore } from './policy-store';
import { IconComponent } from '../../shared/icon';
@Component({ selector: 'pa-policy-form', imports: [ReactiveFormsModule, RouterLink, MatButtonModule, IconComponent], providers: [PolicyStore], template: `
  <a class="back-link" routerLink="/policies"><pa-icon name="back" /> Access policies</a>
  <div class="page-heading"><div><span class="eyebrow">NEW RULE</span><h1>Create policy</h1><p>Define the scope of access and security requirements.</p></div><span class="subtle-chip"><span class="dot"></span>{{ store.status() }}</span></div>
  <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="policy-form-layout"><div class="form-sections">
    <section class="panel form-section"><div class="section-title"><span class="step-number">01</span><div><h2>Basic information</h2><p>Choose a name your whole team will recognize.</p></div></div>
      <div class="field"><label for="policy-name">Policy name <span>*</span></label><input id="policy-name" formControlName="name" placeholder="e.g. Auditor access to reports" maxlength="80" aria-describedby="name-error" [attr.aria-invalid]="!!errorFor('name')" />@if (errorFor('name')) {<span id="name-error" class="field-error">{{ errorFor('name') }}</span>}</div>
      <div class="field"><label for="description">Description <small>optional</small></label><textarea id="description" formControlName="description" rows="3" maxlength="500" placeholder="Describe the purpose and context of this policy…"></textarea><span class="field-hint">{{ value().description?.length ?? 0 }}/500 characters</span></div>
    </section>
    <section class="panel form-section"><div class="section-title"><span class="step-number">02</span><div><h2>Access scope</h2><p>Choose a role, resource, and permitted actions.</p></div></div>
      <div class="field-row"><div class="field"><label for="role">Role <span>*</span></label><select id="role" formControlName="roleId" aria-describedby="role-error"><option value="">Select a role</option><option value="admin">Administrator</option><option value="auditor">Auditor</option><option value="member">Employee</option></select>@if (errorFor('roleId')) {<span id="role-error" class="field-error">{{ errorFor('roleId') }}</span>}</div><div class="field"><label for="resource">Resource <span>*</span></label><select id="resource" formControlName="resource" aria-describedby="resource-error"><option value="">Select a resource</option>@for (resource of resources; track resource) {<option [value]="resource">{{ resource }}</option>}</select>@if (errorFor('resource')) {<span id="resource-error" class="field-error">{{ errorFor('resource') }}</span>}</div></div>
      <fieldset><legend>Permissions <span>*</span></legend><div class="checkbox-options">@for (action of actions; track action) {<label class="check-option"><input type="checkbox" [checked]="form.controls.actions.value.includes(action)" (change)="toggleAction(action, $any($event.target).checked)" />{{ action }}</label>}</div>@if (errorFor('actions')) {<span class="field-error">{{ errorFor('actions') }}</span>}</fieldset>
      <div class="field-row"><div class="field"><label for="effect">Policy effect</label><select id="effect" formControlName="effect"><option value="allow">Allow access</option><option value="deny">Deny access</option></select></div><div class="field"><label for="environment">Environment</label><select id="environment" formControlName="environment"><option value="all">All environments</option><option value="staging">Staging</option><option value="production">Production</option></select></div></div>
    </section>
    <section class="panel form-section"><div class="section-title"><span class="step-number">03</span><div><h2>Security requirements</h2><p>Limit the access period and protect production resources.</p></div></div>
      <div class="field"><label for="duration">Access duration</label><select id="duration" formControlName="duration"><option value="permanent">Indefinite</option><option value="scheduled">Scheduled</option></select></div>
      @if (value().duration === 'scheduled') { <div class="field-row"><div class="field"><label for="start-date">Start date <span>*</span></label><input id="start-date" type="date" formControlName="startsAt" [min]="today" aria-describedby="start-error" />@if (errorFor('startsAt')) {<span id="start-error" class="field-error">{{ errorFor('startsAt') }}</span>}</div><div class="field"><label for="end-date">End date <span>*</span></label><input id="end-date" type="date" formControlName="endsAt" [min]="value().startsAt || today" aria-describedby="end-error" />@if (errorFor('endsAt')) {<span id="end-error" class="field-error">{{ errorFor('endsAt') }}</span>}</div></div> }
      <label class="mfa-option"><input type="checkbox" formControlName="requireMfa" /><span><strong>Require MFA</strong><small>An extra identity check when accessing the resource.</small></span><pa-icon name="shield" /></label>
      @if (requiresMfa()) {<p class="field-hint">Access that includes production requires MFA to be enabled.</p>}
      @if (errorFor('requireMfa')) {<span class="field-error">{{ errorFor('requireMfa') }}</span>}
    </section>
    @if (submitted() && form.invalid) {<p class="error-banner" role="alert">Complete the required fields and correct the highlighted conditions.</p>}
    @if (store.error()) {<p class="error-banner" role="alert">{{ store.error() }}</p>}
    <div class="form-actions"><a mat-button routerLink="/policies" [attr.aria-disabled]="store.saving()">Cancel</a><button mat-flat-button type="submit" [disabled]="store.saving()"><pa-icon name="check" />{{ store.saving() ? 'Saving…' : 'Create policy' }}</button></div>
  </div><aside class="policy-preview"><div class="panel"><div class="panel-heading"><h2>Rule summary</h2><pa-icon name="file" /></div><div class="preview-body"><span class="eyebrow">{{ value().effect === 'allow' ? 'ALLOW ACCESS' : 'DENY ACCESS' }}</span><h3>{{ value().name || 'Your new policy' }}</h3><dl><dt>Role</dt><dd>{{ roleNames[value().roleId || ''] || 'Not selected' }}</dd><dt>Resource</dt><dd>{{ value().resource || 'Not selected' }}</dd><dt>Permissions</dt><dd>{{ value().actions?.join(', ') || 'Not selected' }}</dd><dt>Environment</dt><dd>{{ environmentNames[value().environment || 'all'] }}</dd><dt>Period</dt><dd>{{ value().duration === 'permanent' ? 'Indefinite' : (value().startsAt || '…') + ' — ' + (value().endsAt || '…') }}</dd><dt>Verification</dt><dd>{{ value().requireMfa ? 'MFA required' : 'MFA not required' }}</dd></dl></div><div class="preview-note"><pa-icon name="info" /><span>Once saved, the rule will appear in the policy list and audit log.</span></div></div><p class="field-hint">Fields marked * are required.</p></aside></form>
` })
export class PolicyFormPage {
  readonly store = inject(PolicyStore); private readonly router = inject(Router); private readonly snack = inject(MatSnackBar); private readonly destroyRef = inject(DestroyRef);
  readonly submitted = signal(false); readonly today = new Date().toISOString().slice(0, 10); readonly resources = RESOURCES; readonly actions = ACTIONS;
  readonly roleNames: Record<string, string> = { admin: 'Administrator', auditor: 'Auditor', member: 'Employee' };
  readonly environmentNames: Record<string, string> = { all: 'All environments', staging: 'Staging', production: 'Production' };
  readonly form = inject(FormBuilder).nonNullable.group({ name: '', description: '', roleId: '', resource: '', environment: 'production' as PolicyInput['environment'], effect: 'allow' as PolicyInput['effect'], actions: [[] as string[]], duration: 'permanent' as PolicyInput['duration'], startsAt: '', endsAt: '', requireMfa: true }, { validators: policyValidator });
  readonly value = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });
  readonly requiresMfa = computed(() => this.value().effect === 'allow' && this.value().environment !== 'staging');
  errorFor(key: keyof PolicyInput): string { return (this.submitted() || this.form.controls[key].touched) ? this.form.errors?.[key] ?? '' : ''; }
  toggleAction(action: string, checked: boolean) { const control = this.form.controls.actions; control.setValue(checked ? [...control.value, action] : control.value.filter(item => item !== action)); control.markAsTouched(); }
  submit() {
    if (this.store.saving()) return;
    this.submitted.set(true); this.form.markAllAsTouched(); this.form.updateValueAndValidity();
    if (this.form.invalid) return;
    this.store.create(this.form.getRawValue()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: policy => { this.snack.open(`Policy created “${policy.name}”.`, 'Close', { duration: 5000 }); void this.router.navigate(['/policies']); }, error: () => { /* Store and interceptor expose the error. Form stays intact. */ } });
  }
}
