import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
@Component({ selector: 'pa-message-page', imports: [RouterLink, MatButtonModule], template: `<section class="panel message-page"><span class="eyebrow">{{ forbidden ? '403 · Access restricted' : '404 · Not found' }}</span><h1>{{ forbidden ? 'This section requires an administrator role' : 'This page does not exist' }}</h1><p>{{ forbidden ? 'As an auditor, you can view records, roles, and change history. Only administrators can create policies.' : 'Check the address or return to the employee directory.' }}</p><a mat-flat-button routerLink="/employees">Go to employees</a></section>` })
export class MessagePage { readonly forbidden = inject(ActivatedRoute).snapshot.data['forbidden'] === true; }
