# Progress: Cart Service

## What Works

### Infrastructure

- TypeScript build (`tsc --build`), ESLint, Jest config, nodemon
- Docker (`Dockerfile`) and `nginx.conf` (`common-services_cart:3000`)
- `xpref` entry (`src/index.ts`), log-client, RabbitMQ config
- PostgreSQL via `knexify` (`src/models/pool.ts`, `knexfile.ts`)
- `/test` route for smoke checks (excluded from tenant interceptor)
- `package.json` description: Multi-tenant shopping cart HTTP API

### Tenant isolation (Phase 1)

- Headers `app-id`, `app-secret-key`, `x-user-id`, `x-session-id`
- Table `application` with migration and one seed tenant
- Global interceptor attaches `request.application` (secret stripped)
- `/applications` CRUD with nested `/:id` and `validateResource`

### Domain

- Tables and models: `application`, `cart`, `cart_item`
- `/carts`: user and guest sessions, merge on login, guest TTL refresh
- `/cart-items`: add, combine SKU quantity, update quantity, remove, clear
- Catalog/inventory validation when URLs are set; otherwise request snapshots
- Job `src/jobs/cleanup-guest-cart.job.ts` (hourly) expires guest carts

### Tests

- Tenant middleware, cart/item middleware, application middleware
- Cart/item/application controllers (`page` / `pageSize`, `{ message }`)
- Services: tenant/user/session scope, merge, 404 across tenants, quantity
- Catalog sync and guest-cart cleanup

### Memory bank

- Core docs under `memory-bank/` (except user-owned `feature/` content)
- User-defined cart scope in `memory-bank/feature/index.md`
- Phase 9 closeout: `activeContext.md`, `progress.md`, `systemPatterns.md`

## What's Left to Build

### Domain (user-defined in `feature/`)

- [x] Write cart scope in `memory-bank/feature/index.md`
- [x] Tenant isolation (application table, interceptor, `/applications`)
- [x] `cart` and `cart_item` migrations
- [x] Domain models (no extra knexify helpers; always client-scoped)
- [x] Cart session management (user + guest, merge on login)
- [x] Item operations (add, update quantity, remove, clear)
- [x] Price and catalog sync (validate or snapshot)
- [x] Guest-cart TTL cleanup job

### Quality

- [x] Tenant middleware tests (`validate-application.middleware.test.ts`)
- [x] Cart session tests (`cart.service.test.ts`, `cart.middleware.test.ts`)
- [x] Cart item tests (`cart-item.service.test.ts`, `cart-item.middleware.test.ts`)
- [x] Catalog sync tests (`src/utils/catalog-sync.test.ts`)
- [x] Guest-cart cleanup tests (`cleanup-guest-cart.job.test.ts`)
- [x] Controller tests (`*.controller.test.ts`)
- [x] Replace leftover `nginx.conf` upstream (`media-services-test_media-api`)
- [x] Add `package.json` description
- [x] Close the loop in core memory bank (Phase 9)

## Current Status

| Area | Status |
|------|--------|
| Project scaffold | Done |
| HTTP + logging bootstrap | Done |
| DB pool + domain models | Done |
| Feature spec (`feature/index.md`) | Done (user-owned) |
| Tenant isolation | Done |
| Cart schema | Done |
| Cart models | Done |
| Cart session APIs | Done |
| Cart item APIs | Done |
| Catalog/price sync | Done |
| Guest-cart cleanup job | Done |
| Tests | Done |
| Nginx upstream | `common-services_cart:3000` |
| Package description | Done |
| Core memory bank closeout | Done |

## Known Issues

- `test.model.ts` targets table `test` with no migration (scaffold leftover)

## Evolution

- **Phase 1** (done): Tenant isolation
- **Phase 2** (done): Schema for `cart` and `cart_item`
- **Phase 3** (done): Cart and cart-item models
- **Phase 4** (done): Cart session management
- **Phase 5** (done): Item operations
- **Phase 6** (done): Price and catalog sync
- **Phase 7** (done): Guest-cart TTL cleanup job
- **Phase 8** (done): Tests and quality
- **Phase 9** (done): Close the loop
