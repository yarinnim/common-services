# Active Context: Catalog Service

## Current Work Focus

Implement the **multi-tenant product catalog** documented in
`memory-bank/feature/index.md`: client isolation, categories, products,
variants, attributes, pricing, media, and search.

See user-defined scope in `memory-bank/feature/index.md`.

### In repository today

| Area | Status |
|------|--------|
| `xpref` bootstrap (`src/index.ts`) | Done |
| Env, MQ config, log-client | Done |
| `/test` smoke route | Done |
| `knexify` pool (`src/models/pool.ts`) | Done |
| Scaffold `test` model | Done |
| Tenant middleware (client id) | **Missing** |
| `database/migrations/` | **Missing** |
| `database/seeds/` | **Missing** |
| `src/service/` | **Missing** |
| Domain models beyond `test` | **Missing** |
| Jobs under `src/jobs/` | **Missing** |
| Unit tests (`*.test.ts`) | **Missing** |

## Recent Changes

- User wrote `memory-bank/feature/index.md` (multi-tenant product catalog)
- Core memory bank updated to match that scope
- Service remains a generated API scaffold (test route + test model)

## Next Steps

1. Add tenant middleware: require client id, skip `/test`, attach to request
2. Add migrations and models for catalog entities (singular tables, soft
   delete, client scope)
3. Add `src/service/<feature>/` (router, controller, service, middleware)
4. Register routes in `src/routes/index.ts`
5. Add search, filter, sort, and `page` / `pageSize` pagination
6. Add Jest tests beside new modules (`*.test.ts`)
7. Point `nginx.conf` at this service (it still proxies media-api)

## Active Decisions

- HTTP via `xpref`; persistence via `knexify` (not `@core/api` / `@core/db`)
- Required env vars fail fast in `src/constants.ts`
- Dual RabbitMQ configs: `internal` and `common` (`src/config.ts`)
- Logs go through the common MQ connection and `LOG_EXCHANGE`
- Auth is upstream; catalog scopes all queries to the client id
- Do not generate or overwrite `memory-bank/feature/` content

## Development Environment

- Path: `apps/catalog`
- Lint: `npm run eslint`
- DB: `npm run migrate:latest` / `npm run seed:run` (after migrations exist)
- Node: `.node-version` `v24.19.0`
