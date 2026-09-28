# Cobalt IAM / PolicyAdmin

Cobalt IAM is a compact Angular 21 administration console for managing employees, roles, access policies, and audit history. It is an offline first portfolio application backed by an in memory mock API; refreshing the browser restores the seed data.

**Demo:** [Open the live Cobalt IAM demo](https://cobalt-iam.pages.dev)

## Requirements and setup

Node.js 22.12 or newer and npm are required.

```bash
npm ci
npm start
```

The application is available at `http://127.0.0.1:4200/`. No `.env` files, API keys, or external services are required. The production build is written to `dist/policyadmin/browser`; an SPA host should route unknown paths to `index.html`.

## Commands

```bash
npm run build
npm run lint
npm test
npx playwright install chromium
npm run e2e
```

## Demo access

- Administrator: `admin@policyadmin.demo` / `PolicyDemo123!`
- Auditor: `auditor@policyadmin.demo` / `PolicyDemo123!`

Login is for demonstration only. The session is stored in `sessionStorage`; this is not a production security mechanism.

## Product scope

The application uses standalone components, strict TypeScript, typed Reactive Forms, Angular Material/CDK, Angular Signals, RxJS, Vitest/Testing Library, and Playwright. The code is organized into:

- `core` — session, guards, interceptor, mock API, and models;
- `shared` — presentational components, icons, and statuses;
- `layout` — application shell and responsive navigation;
- `features` — employees, roles, policies, policy form, and audit.

`PolicyStore` uses Signals to store the policy and the `saving`, `error`, `saved`, and `status` states. The form preview uses `toSignal` and `computed`, while lists have their own signals. The employee and audit pages use RxJS `switchMap` to cancel stale requests; the mock API filters and paginates data before responding. The form has conditional validation: MFA for `allow all` access and the production environment, plus date ordering in scheduled mode.

System roles and the permissions matrix are read-only. The mock verifies the token and administrator role on `POST /api/policies`, returns 403, and records the denial in the audit log. It does not enforce policies on external resources and does not replace backend enforcement.

The console includes an employee directory with filtering and pagination, a read-only roles matrix, searchable audit history, policy listing and validated policy creation, authentication and role guards, error handling, mock API interceptors, and responsive Angular Material navigation with dense Cobalt IAM slate/blue styling.

## Limitations

The mock API, accounts, session, and audit data are in memory and reset on reload. Client-side guards and credentials are demonstration mechanisms, not production security. There is no external backend, persistent database, SSR, or enforcement of policies in external systems.
