# Active Context: Cart Service

## Current Work Focus

Phase 1 tenant isolation is in place. Next is Phase 2 schema (`cart`,
`cart_item`) from `memory-bank/feature/index.md`.

See user-defined scope in `memory-bank/feature/index.md`.

### In repository today

| Area | Status |
|------|--------|
| `xpref` bootstrap (`src/index.ts`) | Done |
| Env, MQ config, log-client | Done |
| `/test` smoke route | Done |
| `knexify` pool (`src/models/pool.ts`) | Done |
| Tenant interceptor (`app-id` / `app-secret-key`) | Done |
| `src/application/` CRUD | Done |
| `application` migration + seed | Done |
| Scaffold `test` model | Done |
| `cart` / `cart_item` schema | **Missing** |
| Domain modules `src/cart/`, `src/cart-item/` | **Missing** |
| Jobs under `src/jobs/` | **Missing** |
| Unit tests beyond tenant middleware | **Missing** |

## Recent Changes

- Phase 1 tenant isolation: headers, `application` table, interceptor,
  `/applications` module
- `GET`/`POST` `/test` still skips credential checks
- Service still has no cart domain APIs

## Next Steps

1. Phase 2: migrations for `cart` and `cart_item` (singular, soft delete,
   always `application_id`)
2. Phase 3: cart and cart-item models
3. Phase 4–5: `src/cart/` and `src/cart-item/` modules
4. Phase 6–7: catalog/price sync and guest-cart cleanup job
5. Point `nginx.conf` at this service (it still proxies media-api)

## Active Decisions

- HTTP via `xpref`; persistence via `knexify` (not `@core/api` / `@core/db`)
- Tenant from `app-id` + `app-secret-key`; user from `x-user-id`
- Required env vars fail fast in `src/constants.ts`
- Dual RabbitMQ configs: `internal` and `common` (`src/config.ts`)
- Logs go through the common MQ connection and `LOG_EXCHANGE`
- Do not generate or overwrite `memory-bank/feature/` content

## Development Environment

- Path: `apps/cart`
- Lint: `npm run eslint`
- DB: `npm run migrate:latest` / `npm run seed:run`
- Node: `.node-version` `v24.19.0`
