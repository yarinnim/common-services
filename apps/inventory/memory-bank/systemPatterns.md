# System Patterns: Inventory Service

## Architecture Overview

### Microservice

- Package: `apps/inventory` (`@common-services/inventory`)
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
src/services/<feature>/         — planned domain modules
  index.ts                      — Route map
  *.controller.ts               — HTTP + validation; calls service only
  *.service.ts                  — calls model
  *.middleware.ts               — validateResource for /:id detail routes
src/models/
  pool.ts                       — knexify connection + initModel
  test.model.ts                 — scaffold model (`test` table)
src/jobs/                       — planned cron jobs (`FEATURE.job.ts`)
src/utils/                      — planned helpers
```

## Route pattern (`xpref`)

```typescript
export default {
  '/items': ['item', [], {
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

- Resource paths are plural (`/items`, not `/item`)
- Detail is a nested `/:id` with middleware; do not use `items/:itemId`
- Do not nest the same param twice
- Register new route modules in `src/routes/index.ts`
- Errors: `{ message }` only; `logger().error` in controller `catch`
- `paginate` uses `page` and `pageSize` from `request.query`
- Never wrap responses with extra `data`, `pagination`, or `status` fields

## Model pattern (`knexify`)

```typescript
import { initModel } from './pool';
import { type BaseEntity } from 'knexify/types';

export type Item = BaseEntity & {
  /* domain fields */
};

const TABLE = 'item';
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
| `src/index.ts` | Present |
| `src/constants.ts` / `src/config.ts` / `src/log-client.ts` | Present |
| `src/routes/test.route.ts` | Present |
| `src/models/pool.ts` | Present |
| `src/models/test.model.ts` | Present (scaffold) |
| `database/migrations/` | Missing |
| `database/seeds/` | Missing |
| `src/services/` | Missing |
| `src/jobs/` | Missing |
| `src/utils/` | Missing |
| `memory-bank/feature/` | Present (user-owned) |
