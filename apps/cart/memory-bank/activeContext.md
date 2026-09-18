# Active Context: Cart Service

## Current Work Focus

Phase 5 item operations are in place. Next is Phase 6 price and catalog
sync from `memory-bank/feature/index.md`.

See user-defined scope in `memory-bank/feature/index.md`.

### In repository today

| Area | Status |
|------|--------|
| `xpref` bootstrap (`src/index.ts`) | Done |
| Tenant interceptor (`app-id` / `app-secret-key`) | Done |
| `src/application/` CRUD | Done |
| `cart` / `cart_item` schema and models | Done |
| `src/cart/` session APIs | Done |
| `src/cart-item/` item APIs | Done |
| Jobs under `src/jobs/` | **Missing** |

## Recent Changes

- Phase 5: `src/cart-item/` add, update quantity, remove, and clear
- Items must belong to a cart the caller owns; other tenants 404
- Catalog/price validation is still Phase 6 (snapshots stored as sent)

## Next Steps

1. Phase 6: catalog/price sync (validate or keep snapshots)
2. Phase 7: guest-cart cleanup job
3. Point `nginx.conf` at this service (it still proxies media-api)

## Active Decisions

- HTTP via `xpref`; persistence via `knexify`
- Tenant from `app-id` + `app-secret-key`; user from `x-user-id`;
  guest session from `x-session-id`
- Item writes run in a transaction after ownership selects
- Do not generate or overwrite `memory-bank/feature/` content

## Development Environment

- Path: `apps/cart`
- Lint: `npm run eslint`
- DB: `npm run migrate:latest` / `npm run seed:run`
- Node: `.node-version` `v24.19.0`
