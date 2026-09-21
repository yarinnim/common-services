# Active Context: Order Service

## Current Work Focus

Core order APIs are implemented. Optional leftovers: Redis idempotency /
rate limiting from the feature brief, nginx upstream fix, and jobs.

See user-defined scope in `memory-bank/feature/index.md`.

### In repository today

| Area | Status |
|------|--------|
| `xpref` bootstrap (`src/index.ts`) | Done |
| Env, MQ config, log-client | Done |
| Tenant interceptor (`validateApplication`) | Done |
| `/test` smoke route | Done |
| `knexify` pool (`src/models/pool.ts`) | Done |
| Domain models | Done |
| `database/migrations/` | Done |
| `database/seeds/application.ts` | Done |
| `src/application/` | Done |
| `src/order/` | Done |
| Unit tests (`*.test.ts`) | Done |
| Jobs under `src/jobs/` | **Missing** |
| Redis idempotency / rate limit | **Not in stack** |

## Recent Changes

- Models: application, order, order_item, order_status_history
- Global tenant middleware via `app-id` / `app-secret-key`
- Application CRUD and order create / list / detail / status / cancel
- Application seed and co-located Jest tests (14 passing)

## Next Steps

1. Point `nginx.conf` at this service (it still proxies media-api)
2. Add `package.json` description
3. Optionally add Redis-backed idempotency if the platform adopts Redis
4. Add background jobs only if feature scope requires them

## Active Decisions

- HTTP via `xpref`; persistence via `knexify`
- Tenant headers match cart/inventory (`app-id`, `app-secret-key`)
- Errors return `{ message }` only (workspace rule over feature brief)
- Status machine: pending → confirmed → processing → shipped → delivered;
  cancel allowed until delivered
- Do not generate or overwrite `memory-bank/feature/` content

## Development Environment

- Path: `apps/order`
- Lint: `npm run eslint`
- DB: `npm run migrate:latest` / `npm run seed:run`
- Node: `.node-version` `v24.19.0`
