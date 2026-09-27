import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { safeReturnUrl } from '../../core/guards';
import { IconComponent } from '../../shared/icon';
@Component({ selector: 'pa-login', imports: [ReactiveFormsModule, MatButtonModule, IconComponent], template: `
  <main class="login-layout"><section class="login-story"><a class="brand" href="/"><span class="brand-mark"><pa-icon /></span>Cobalt IAM</a><div><span class="eyebrow">IDENTITY & ACCESS MANAGEMENT</span><h1>Identity control.<br>Policy precision.</h1><p>Manage your organization’s identities, role permissions, and access policies from one administrative console.</p><div class="login-proof"><pa-icon name="shield" /><span>Employees / Roles / Access policies</span></div></div><small>Cobalt IAM · PolicyAdmin console</small></section>
  <section class="login-main"><div class="login-card"><span class="eyebrow">COBALT IAM / ADMINISTRATOR ACCESS</span><h2>Sign in to Cobalt IAM</h2><p class="muted">Use a demo account to explore the identity administration console.</p>
  <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
    <div class="field"><label for="email">Email address</label><input id="email" type="email" formControlName="email" autocomplete="username" [attr.aria-invalid]="form.controls.email.touched && form.controls.email.invalid" />@if (form.controls.email.touched && form.controls.email.invalid) { <span class="field-error">Enter a valid email address.</span> }</div>
    <div class="field"><label for="password">Password</label><input id="password" type="password" formControlName="password" autocomplete="current-password" />@if (form.controls.password.touched && form.controls.password.invalid) { <span class="field-error">Enter your password.</span> }</div>
    @if (error()) {<p class="error-banner" role="alert">{{ error() }}</p>}
    <button mat-flat-button class="full-width" type="submit" [disabled]="loading()">{{ loading() ? 'Sign in…' : 'Sign in' }} <pa-icon name="arrow" /></button>
  </form><div class="demo-credentials"><span class="eyebrow">CHOOSE A DEMO ACCOUNT</span><div class="demo-buttons"><button mat-stroked-button (click)="fill('admin')">Administrator</button><button mat-stroked-button (click)="fill('auditor')">Auditor</button></div><p><strong>Password:</strong> <code>PolicyDemo123!</code></p><small>Administrators create policies. Auditors have read-only access. Refreshing resets demo data.</small></div></div></section></main>
` })
export class LoginComponent {
  private readonly auth = inject(AuthService); private readonly router = inject(Router); private readonly route = inject(ActivatedRoute); private readonly destroyRef = inject(DestroyRef);
  readonly loading = signal(false); readonly error = signal('');
  readonly form = inject(FormBuilder).nonNullable.group({ email: ['admin@policyadmin.demo', [Validators.required, Validators.email]], password: ['', Validators.required] });
  fill(role: 'admin' | 'auditor') { this.form.setValue({ email: `${role}@policyadmin.demo`, password: 'PolicyDemo123!' }); this.error.set(''); }
  submit() {
    if (this.loading()) return;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true); this.error.set('');
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: () => void this.router.navigateByUrl(safeReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl'))), error: () => { this.loading.set(false); this.error.set('Sign-in failed. Check your email address and password.'); } });
  }
}
