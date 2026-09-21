# Active Context: Payment Service

## Current Work Focus

Payment schema migrations are in place for multi-tenant vault, payments,
webhooks, and audit. Next work is domain models and feature modules from
`memory-bank/feature/`.

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
| `database/seeds/` | Done (application) |
| `src/<feature>/` | **Missing** |
| Domain models beyond `test` | **Missing** |
| Jobs under `src/jobs/` | **Missing** |
| Unit tests (`*.test.ts`) | **Missing** |

## Recent Changes

- Added migrations: `application`, `gateway_credential`, `payment`,
  `webhook_event`, `payment_audit`
- Added `database/seeds/application.ts`
- Feature scope already documented under `memory-bank/feature/`

## Next Steps

1. Add knexify models for the new tables
2. Add `src/<feature>/` (router, controller, service, middleware)
3. Register routes in `src/routes/index.ts`
4. Add Jest tests beside new modules (`*.test.ts`)
5. Run `npm run migrate:latest` / `npm run seed:run` against a real DB
6. Point `nginx.conf` at this service (it still proxies media-api)

## Active Decisions

- HTTP via `xpref`; persistence via `knexify` (not `@core/api` / `@core/db`)
- Required env vars fail fast in `src/constants.ts`
- Dual RabbitMQ configs: `internal` and `common` (`src/config.ts`)
- Logs go through the common MQ connection and `LOG_EXCHANGE`
- Do not generate or overwrite `memory-bank/feature/` content

## Development Environment

- Path: `apps/payment`
- Lint: `npm run eslint`
- DB: `npm run migrate:latest` / `npm run seed:run` (after migrations exist)
- Node: `.node-version` `v24.19.0`
