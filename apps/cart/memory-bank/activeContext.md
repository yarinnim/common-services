# Active Context: Cart Service

## Current Work Focus

Phase 4 cart session management is in place. Next is Phase 5 item operations
from `memory-bank/feature/index.md`.

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
| `cart` / `cart_item` schema | Done |
| Domain models `cart` / `cart_item` | Done |
| `src/cart/` session APIs | Done |
| Domain modules `src/cart-item/` | **Missing** |
| Jobs under `src/jobs/` | **Missing** |

## Recent Changes

- Phase 4: `src/cart/` create-or-load user/guest carts, merge on login,
  `/carts` + nested `/:id`
- Guest identity from `x-session-id`; 7-day TTL on guest carts
- Item add/update/remove is still Phase 5

## Next Steps

1. Phase 5: item operations (`src/cart-item/`)
2. Phase 6–7: catalog/price sync and guest-cart cleanup job
3. Point `nginx.conf` at this service (it still proxies media-api)

## Active Decisions

- HTTP via `xpref`; persistence via `knexify` (not `@core/api` / `@core/db`)
- Tenant from `app-id` + `app-secret-key`; user from `x-user-id`;
  guest session from `x-session-id`
- POST `/carts` with both user and session identities merges guest lines
- Required env vars fail fast in `src/constants.ts`
- Do not generate or overwrite `memory-bank/feature/` content

## Development Environment

- Path: `apps/cart`
- Lint: `npm run eslint`
- DB: `npm run migrate:latest` / `npm run seed:run`
- Node: `.node-version` `v24.19.0`
