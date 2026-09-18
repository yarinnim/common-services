# Progress: Cart Service

## What Works

### Infrastructure

- TypeScript build (`tsc --build`), ESLint, Jest config, nodemon
- Docker (`Dockerfile`) and `nginx.conf` scaffolding
- `xpref` entry (`src/index.ts`), log-client, RabbitMQ config
- PostgreSQL via `knexify` (`src/models/pool.ts`, `knexfile.ts`)
- `/test` route for smoke checks (excluded from tenant interceptor)

### Tenant isolation (Phase 1)

- Headers `app-id`, `app-secret-key`, `x-user-id`, `x-session-id`
- Table `application` with migration and one seed tenant
- Global interceptor attaches `request.application` (secret stripped)
- `/applications` CRUD with nested `/:id` and `validateResource`

### Data layer

- Connection pool with write host and read replica settings
- Models: `application`, `cart`, `cart_item`, scaffold `test`
- Tables: `application`, `cart`, `cart_item`

### Memory bank

- Core docs under `memory-bank/` (except user-owned `feature/` content)
- User-defined cart scope in `memory-bank/feature/index.md`

## What's Left to Build

### Domain (user-defined in `feature/`)

- [x] Write cart scope in `memory-bank/feature/index.md`
- [x] Tenant isolation (application table, interceptor, `/applications`)
- [x] `cart` and `cart_item` migrations
- [x] Domain models (no extra knexify helpers; always client-scoped)
- [x] Cart session management (user + guest, merge on login)
- [ ] Item operations (add, update quantity, remove, clear)
- [ ] Price and catalog sync (validate or snapshot)
- [ ] Guest-cart TTL cleanup job

### Quality

- [x] Tenant middleware tests (`validate-application.middleware.test.ts`)
- [x] Cart session tests (`cart.service.test.ts`, `cart.middleware.test.ts`)
- [ ] Unit tests for remaining modules (`*.test.ts`)
- [ ] Replace leftover `nginx.conf` upstream (`media-services-test_media-api`)
- [ ] Add `package.json` description

## Current Status

| Area | Status |
|------|--------|
| Project scaffold | Done |
| HTTP + logging bootstrap | Done |
| DB pool + test model | Done |
| Feature spec (`feature/index.md`) | Done (user-owned) |
| Tenant isolation | Done |
| Cart schema | Done |
| Cart models | Done |
| Cart session APIs | Done |
| Domain services / APIs | Cart sessions only |
| Jobs | Not started |
| Tests | Tenant middleware + cart session |

## Known Issues

- `nginx.conf` still proxies to `media-services-test_media-api:3000`
- `package.json` `description` is empty
- `test.model.ts` targets table `test` with no migration
- No `src/cart-item/`, `src/jobs/`, or `src/utils/` yet

## Evolution

- **Phase 1** (done): Tenant isolation
- **Phase 2** (done): Schema for `cart` and `cart_item`
- **Phase 3** (done): Cart and cart-item models
- **Phase 4** (done): Cart session management
- **Phase 5** (now): Item operations
