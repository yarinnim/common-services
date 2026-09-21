# Active Context: Order Service

## Current Work Focus

Order domain migrations are in place. Next: models and APIs from
`memory-bank/feature/index.md` (multi-tenant orders, items, status history).

See user-defined scope in `memory-bank/feature/index.md`.

### In repository today

| Area | Status |
|------|--------|
| `xpref` bootstrap (`src/index.ts`) | Done |
| Env, MQ config, log-client | Done |
| `/test` smoke route | Done |
| `knexify` pool (`src/models/pool.ts`) | Done |
| Scaffold `test` model | Done |
| `database/migrations/` | Done |
| `database/seeds/` | **Missing** |
| `src/<feature>/` domain modules | **Missing** |
| Domain models beyond `test` | **Missing** |
| Jobs under `src/jobs/` | **Missing** |
| Unit tests (`*.test.ts`) | **Missing** |

## Recent Changes

- Migrations added: `application`, `order`, `order_item`,
  `order_status_history`
- Feature scope defined in `memory-bank/feature/index.md`

## Next Steps

1. Add domain models for application, order, order item, status history
2. Add seeds under `database/seeds/`
3. Add `src/<feature>/` (router, controller, service, middleware)
4. Register routes in `src/routes/index.ts`
5. Add Jest tests beside new modules (`*.test.ts`)
6. Point `nginx.conf` at this service (it still proxies media-api)

## Active Decisions

- HTTP via `xpref`; persistence via `knexify` (not `@core/api` / `@core/db`)
- Required env vars fail fast in `src/constants.ts`
- Dual RabbitMQ configs: `internal` and `common` (`src/config.ts`)
- Logs go through the common MQ connection and `LOG_EXCHANGE`
- Do not generate or overwrite `memory-bank/feature/` content

## Development Environment

- Path: `apps/order`
- Lint: `npm run eslint`
- DB: `npm run migrate:latest` / `npm run seed:run` (after migrations exist)
- Node: `.node-version` `v24.19.0`
