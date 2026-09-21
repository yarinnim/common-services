# System Patterns: Order Service

## Architecture Overview

### Microservice

- Package: `apps/order` (`@core-services/order`)
- HTTP: `xpref` (Express-compatible `Request` / `Response` / `Route`)
- Data: PostgreSQL + `knexify` (`knexfile.ts`, `src/models/pool.ts`)
- Logs: `@core/log-client` over RabbitMQ (`src/log-client.ts`)

### Request flow (target)

```
Client
  → xpref route map (`src/routes/index.ts`)
  → Feature middleware (resource exists)
  → Controller action (`*Action`)
  → Service (`find` / `search*` / writes)
  → Model (`initModel` + knexify helpers)
```

User-facing goals: `memory-bank/feature/index.md`.

### Layering

```
src/index.ts                    — xpref bootstrap
src/constants.ts                — required env vars
src/config.ts                   — MQ connection objects
src/log-client.ts               — logger factory
src/routes/index.ts             — merges route modules
src/<feature>/                  — domain modules
  index.ts                      — Route map
  *.controller.ts               — HTTP + validation; calls service only
  *.service.ts                  — calls model
  *.middleware.ts               — validateResource for /:id detail routes
src/middleware/
  validate-application.middleware.ts — tenant gate (interceptor)
src/models/
  pool.ts                       — knexify connection + initModel
  application.model.ts
  order.model.ts
  order-item.model.ts
  order-status-history.model.ts
  test.model.ts                 — scaffold model (`test` table)
src/jobs/                       — planned cron jobs (`FEATURE.job.ts`)
src/utils/                      — planned helpers
```

## Route pattern (`xpref`)

```typescript
export default {
  '/orders': ['order', [], {
    get: getAction,
    post: postAction,
  }, {
    '/:id': ['order-detail', [validateResource], {
      get: detailAction,
    }, {
      '/status': ['order-status', [], { patch: statusAction }],
      '/cancel': ['order-cancel', [], { post: cancelAction }],
    }],
  }],
} as Route;
```

Rules:

- Resource paths are plural (`/orders`, not `/order`)
- Detail is a nested `/:id` with middleware; do not use `orders/:orderId`
- Do not nest the same param twice
- Register new route modules in `src/routes/index.ts`
- Errors: `{ message }` only; `logger().error` in controller `catch`
- `paginate` uses `page` and `pageSize` from `request.query`
- Never wrap responses with extra `data`, `pagination`, or `status` fields

## Model pattern (`knexify`)

```typescript
import { initModel } from './pool';
import { type BaseEntity } from 'knexify/types';

export type Order = BaseEntity & {
  /* domain fields */
};

const TABLE = 'order';
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

## Component map (repository)

| Path | Status |
|------|--------|
| `src/index.ts` | Present (tenant interceptor) |
| `src/constants.ts` / `src/config.ts` / `src/log-client.ts` | Present |
| `src/routes/test.route.ts` | Present |
| `src/middleware/validate-application.middleware.ts` | Present |
| `src/application/` | Present |
| `src/order/` | Present |
| `src/models/pool.ts` | Present |
| `src/models/application.model.ts` | Present |
| `src/models/order.model.ts` | Present |
| `src/models/order-item.model.ts` | Present |
| `src/models/order-status-history.model.ts` | Present |
| `src/models/test.model.ts` | Present (scaffold) |
| `database/migrations/` | Present |
| `database/seeds/` | Present |
| `src/jobs/` | Missing |
| `src/utils/` | Missing |
| `memory-bank/feature/` | Present (user-owned) |
