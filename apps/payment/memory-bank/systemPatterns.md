# System Patterns: Payment Service

## Architecture Overview

### Microservice

- Package: `apps/payment` (`@common-services/payment`)
- HTTP: `xpref` (Express-compatible `Request` / `Response` / `Route`)
- Data: PostgreSQL + `knexify` (`knexfile.ts`, `src/models/pool.ts`)
- Logs: `@core/log-client` over RabbitMQ (`src/log-client.ts`)

### Request flow

```
Client
  → Tenant interceptor (app-id / app-secret-key; skip /test, /webhooks)
  → xpref route map (`src/routes/index.ts`)
  → Feature middleware (resource exists + tenant scope)
  → Controller action (`*Action`)
  → Service (`find` / `search*` / writes)
  → Model (`initModel` + knexify helpers)
```

User-facing goals: `memory-bank/feature/index.md`.

### Layering

```
src/index.ts                    — xpref bootstrap + tenant interceptor
src/constants.ts                — required env vars (incl. ENCRYPTION_MASTER_KEY)
src/config.ts                   — MQ, headers, payment enums
src/log-client.ts               — logger factory
src/middleware/
  validate-application.middleware.ts — tenant gate (skip /test, /webhooks)
src/routes/index.ts             — merges route modules
src/application/                — tenant CRUD (`/applications`)
src/gateway-credential/         — encrypted vault (`/gateway-credentials`)
src/payment/                    — charge/authorize/capture/refund
  provider/                     — adapter strategy (Stripe first)
src/webhook/                    — inbound gateway webhooks
src/payment-audit/              — compliance audit list/detail
src/models/                     — knexify models
src/utils/                      — encrypt, idempotency, audit write
src/jobs/                       — planned cron jobs (`FEATURE.job.ts`)
```

## Component map (repository)

| Path | Status |
|------|--------|
| `src/index.ts` | Present |
| `src/constants.ts` / `src/config.ts` / `src/log-client.ts` | Present |
| `src/middleware/validate-application.middleware.ts` | Present |
| `src/application/` | Present |
| `src/gateway-credential/` | Present |
| `src/payment/` | Present |
| `src/webhook/` | Present |
| `src/payment-audit/` | Present |
| `src/utils/encrypt.ts` | Present |
| `src/models/*` | Present |
| `database/migrations/` | Present (5 tables) |
| `database/seeds/application.ts` | Present |
| `src/jobs/` | Missing |
| `memory-bank/feature/` | Present (user-owned) |

## Schema map

| Table | Purpose |
|-------|---------|
| `application` | Tenant registry (`app-id` / `app-secret-key`) |
| `gateway_credential` | Encrypted per-provider vault keys |
| `payment` | Charge / authorize / capture / refund |
| `webhook_event` | Inbound gateway events + DLQ status |
| `payment_audit` | Tenant-scoped compliance audit trail |

## API map

| Method | Path | Notes |
|--------|------|-------|
| CRUD | `/applications` | Tenant registry |
| CRUD | `/gateway-credentials` | Secrets never returned |
| GET | `/payments` | List / filter |
| POST | `/payments/charge` | Idempotent |
| POST | `/payments/authorize` | Idempotent |
| POST | `/payments/capture` | Idempotent |
| POST | `/payments/refund` | Idempotent |
| GET | `/payments/:id` | Detail |
| POST | `/webhooks/:applicationId/:provider` | Public; signature required |
| GET | `/payment-audits` | List / filter |
| GET | `/payment-audits/:id` | Detail |

## Route pattern (`xpref`)

```typescript
export default {
  '/payments': ['payment', [], {
    get: getAction,
    post: postAction,
  }, {
    '/:id': ['detail', [validateResource], {
      get: detailAction,
      put: updateAction,
      delete: deleteAction,
    }],
  }],
} as Route;
```

Rules:

- Resource paths are plural (`/payments`, not `/payment`)
- Detail is a nested `/:id` with middleware; do not use `payments/:paymentId`
- Do not nest the same param twice
- Register new route modules in `src/routes/index.ts`
- Errors: `{ message }` only; `logger().error` in controller `catch`
- `paginate` uses `page` and `pageSize` from `request.query`
- Never wrap responses with extra `data`, `pagination`, or `status` fields

## Model pattern (`knexify`)

```typescript
import { initModel } from './pool';
import { type BaseEntity } from 'knexify/types';

export type Payment = BaseEntity & {
  /* domain fields */
};

const TABLE = 'payment';
const table = initModel(TABLE);
export default table;
```

Conventions:

- Table names singular; DB columns snake_case; TS fields camelCase
- Soft delete via `deleted_at`; use `whereActive()` not raw `whereNull`
- Writes accept optional `Transaction` as last argument
- Do not import `knex`; do not re-implement knexify helpers
  (`find`, `search`, `paginate`, `create`, `remove`, `patch`, …)
- Do not export types from the model file as public API
- New inserts return id:
  `.then(([{ id }]: { id: number }[]) => id)`

## Service and controller

- Service: kebab-case `*.service.ts`; always include `find`; search is plural
- Controller: `*.controller.ts`; actions end with `Action`; return
  `Promise<Response>`
- Controller never calls models
- Middleware returns `void | Promise<void>` and uses `next()` or
  `return response.status(...).json({ message })`

## Job pattern

- Location: `src/jobs/FEATURE.job.ts`
- One default export; first argument is interval
- Process function is separate from the runner

## Code style

- `type` not `interface`; `import { type X }` or `import type { A, B }`
- Promise/then; no `async/await` or `Promise.all`
- Kebab-case file names; camelCase functions
- No `for` / `while`; use recursion
- Maximum 3 function parameters (third optional)
- JSDoc on functions

