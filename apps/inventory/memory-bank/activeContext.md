# Active Context: Inventory Service

## Current Work Focus

Initialize the memory bank for the inventory microservice scaffold. Domain
scope belongs in `memory-bank/feature/index.md` (user-maintained).

See user-defined scope in `memory-bank/feature/index.md`.

### In repository today

| Area | Status |
|------|--------|
| `xpref` bootstrap (`src/index.ts`) | Done |
| Env, MQ config, log-client | Done |
| `/test` smoke route | Done |
| `knexify` pool (`src/models/pool.ts`) | Done |
| Scaffold `test` model | Done |
| `database/migrations/` | **Missing** |
| `database/seeds/` | **Missing** |
| `src/services/` | **Missing** |
| Domain models beyond `test` | **Missing** |
| Jobs under `src/jobs/` | **Missing** |
| Unit tests (`*.test.ts`) | **Missing** |

## Recent Changes

- Memory bank initialized from cursor rules and current `src/`
- `memory-bank/feature/` created; content is user-owned
- Service remains a generated API scaffold (test route + test model)

## Next Steps

1. User fills `memory-bank/feature/index.md` with inventory domain scope
2. Add migrations and models for those features (singular tables, soft delete)
3. Add `src/services/<feature>/` (router, controller, service, middleware)
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

- Path: `apps/inventory`
- Lint: `npm run eslint`
- DB: `npm run migrate:latest` / `npm run seed:run` (after migrations exist)
- Node: `.node-version` `v24.19.0`
