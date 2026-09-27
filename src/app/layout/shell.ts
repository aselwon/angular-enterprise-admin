import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../core/auth.service';
import { IconComponent } from '../shared/icon';
@Component({ selector: 'pa-shell', imports: [RouterLink, RouterLinkActive, RouterOutlet, MatButtonModule, IconComponent], template: `
  <a href="#main" class="skip-link">Skip to content</a>
  <div class="app-layout">
    <aside class="sidebar" [class.open]="menuOpen()">
      <a class="brand" routerLink="/employees" (click)="menuOpen.set(false)"><span class="brand-mark"><pa-icon /></span>Cobalt IAM</a>
      <div class="workspace"><span class="workspace-logo">CI</span><div><strong>Cobalt IAM</strong><small>Identity administration</small></div><span class="workspace-tag">IAM</span></div>
      <div class="nav-label">ACCESS MANAGEMENT</div>
      <nav aria-label="Main navigation">
        @for (item of links; track item.path) { <a [routerLink]="item.path" routerLinkActive="active" (click)="menuOpen.set(false)"><pa-icon [name]="item.icon" /><span>{{ item.label }}</span>@if (item.path === '/employees') {<span class="nav-count">24</span>}</a> }
      </nav>
      <div class="sidebar-bottom"><div class="demo-note"><pa-icon name="info" /><div><strong>Demo environment</strong><p>In-memory mock data. Refresh to restore the initial dataset.</p></div></div>
      <div class="user-card"><span class="avatar">{{ auth.isAdmin() ? 'AK' : 'MN' }}</span><div><strong>{{ auth.session()?.name }}</strong><small>{{ auth.isAdmin() ? 'Administrator' : 'Auditor · read only' }}</small></div><button mat-icon-button aria-label="Sign out" (click)="logout()"><pa-icon name="logout" /></button></div></div>
    </aside>
    @if (menuOpen()) { <button class="menu-backdrop" aria-label="Close navigation" (click)="menuOpen.set(false)"></button> }
    <div class="main-shell"><header class="topbar"><div class="topbar-left"><button mat-icon-button class="menu-button" aria-label="Open navigation" [attr.aria-expanded]="menuOpen()" (click)="menuOpen.set(!menuOpen())"><pa-icon name="menu" /></button><span>Cobalt IAM</span><span class="slash">/</span><strong>Administration</strong></div><span class="environment"><span class="dot"></span>Demo mode</span></header>
    <main id="main" tabindex="-1"><router-outlet /></main><footer class="app-footer"><span>Cobalt IAM <span class="muted">/</span> PolicyAdmin console</span><span>Identity & policy administration</span></footer></div>
  </div>`,
})
export class ShellComponent {
  readonly auth = inject(AuthService); private readonly router = inject(Router); readonly menuOpen = signal(false);
  readonly links = [{ path: '/employees', label: 'Employees', icon: 'users' }, { path: '/roles', label: 'Roles & permissions', icon: 'key' }, { path: '/policies', label: 'Access policies', icon: 'shield' }, { path: '/audit', label: 'Audit log', icon: 'clock' }];
  logout() { this.auth.logout(); void this.router.navigate(['/login']); }
}
