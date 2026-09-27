import { Component, computed, input } from '@angular/core';
@Component({ selector: 'pa-status', template: '<span class="badge" [class.green]="positive()" [class.amber]="value() === \'invited\'" [class.red]="negative()"><span class="dot"></span>{{ label() }}</span>' })
export class StatusBadge {
  readonly value = input.required<string>();
  readonly positive = computed(() => ['active', 'allow', 'success'].includes(this.value()));
  readonly negative = computed(() => ['suspended', 'deny', 'denied'].includes(this.value()));
  readonly label = computed(() => ({ active: 'Active', invited: 'Invited', suspended: 'Suspended', allow: 'Allow', deny: 'Deny', success: 'Success', denied: 'Denied' })[this.value()] ?? this.value());
}
