# Active Context: Cart Service

## Current Work Focus

Phases 1–9 from `memory-bank/feature/index.md` are complete. Cart is a
multi-tenant shopping-cart API: sessions (user + guest, merge on login),
line items with price snapshots, optional catalog/inventory validation, and
hourly guest-cart TTL cleanup.

See user-defined scope in `memory-bank/feature/index.md`. Do not overwrite
that file.

### In repository today

| Area | Status |
|------|--------|
| `xpref` bootstrap (`src/index.ts`) | Done |
| Tenant interceptor (`app-id` / `app-secret-key`) | Done |
| `src/application/` CRUD | Done |
| `cart` / `cart_item` schema and models | Done |
| `src/cart/` session APIs (`/carts`) | Done |
| `src/cart-item/` item APIs (`/cart-items`) | Done |
| Catalog/inventory sync on add/update | Done |
| Guest-cart cleanup job | Done |
| Controller / service / job tests | Done |
| `nginx.conf` upstream | `common-services_cart:3000` |
| `package.json` description | Done |

## Recent Changes

- Phase 9: core memory bank closed out against the implemented service
- Feature spec phases 1–8 remain implemented; this file no longer tracks
  a pending implementation slice

## Next Steps

No remaining slices in `memory-bank/feature/index.md`. Optional leftover:
scaffold `src/models/test.model.ts` still has no `test` table migration.

## Active Decisions

- HTTP via `xpref`; persistence via `knexify`
- Tenant from `app-id` + `app-secret-key`; user from `x-user-id`;
  guest session from `x-session-id`
- Item writes run in a transaction after ownership selects
- Catalog/inventory URLs are optional; snapshots stay on `cart_item`
- Guest-cart cleanup runs hourly from `src/index.ts`
- Nginx upstream is `common-services_cart:3000`
- Do not generate or overwrite `memory-bank/feature/` content

## Development Environment

- Path: `apps/cart`
- Lint: `npm run eslint`
- Test: `npm test`
- DB: `npm run migrate:latest` / `npm run seed:run`
- Node: `.node-version` `v24.19.0`
