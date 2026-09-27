import { Component, input } from '@angular/core';
@Component({
  selector: 'pa-icon',
  template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path [attr.d]="paths[name()] || paths[\'shield\']" /></svg>',
  styles: ':host {display:inline-flex;width:20px;height:20px;flex-shrink:0} svg{width:100%;height:100%}',
})
export class IconComponent {
  readonly name = input('shield');
  readonly paths: Record<string, string> = {
    shield: 'M12 3 3 7v6c0 5 9 9 9 9s9-4 9-9V7l-9-4Zm-4 9 3 3 5-6',
    users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.87M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
    key: 'M15 3a6 6 0 1 1-5 9L3 19v3h4v-3h3l3-3M17 7h.01',
    file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6ZM14 2v6h6M8 13h8M8 17h5',
    clock: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM12 6v6l4 2',
    search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
    plus: 'M12 5v14M5 12h14', arrow: 'M5 12h14m-6-6 6 6-6 6', back: 'M19 12H5m6-6-6 6 6 6',
    check: 'm5 12 4 4L19 6', logout: 'M9 3H4v18h5M10 12h12m-5-5 5 5-5 5',
    menu: 'M4 6h16M4 12h16M4 18h16', chevron: 'm9 5 7 7-7 7', info: 'M12 16v-4m0-4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  };
}
