# Progress: Order Service

## What Works

### Infrastructure

- TypeScript build (`tsc --build`), ESLint, Jest config, nodemon
- Docker (`Dockerfile`) and `nginx.conf` scaffolding
- `xpref` entry with tenant interceptor, log-client, RabbitMQ config
- PostgreSQL via `knexify` (`src/models/pool.ts`, `knexfile.ts`)
- `/test` route for smoke checks

### Data layer

- Migrations: `application`, `order`, `order_item`, `order_status_history`
- Seed: `database/seeds/application.ts`
- Models for application, order, order item, status history

### Domain APIs

- `GET/POST /applications`, `GET/PUT/DELETE /applications/:id`
- `GET/POST /orders` (list filters: status, channel, merchant, dates)
- `GET /orders/:id` (items + status history)
- `PATCH /orders/:id/status` (validated transitions)
- `POST /orders/:id/cancel`

### Tests

- Co-located unit tests for application, order, and tenant middleware
- 14 Jest tests passing

### Memory bank

- Core docs under `memory-bank/` (except user-owned `feature/` content)

## What's Left to Build

### Domain (user-defined in `feature/`)

- [x] Write order scope in `memory-bank/feature/index.md`
- [x] Migrations under `database/migrations/`
- [x] Seeds under `database/seeds/`
- [x] Domain models (no extra knexify helpers)
- [x] `src/<feature>/` modules and route registration

### Quality

- [x] Unit tests (`*.test.ts`) next to modules
- [ ] Replace leftover `nginx.conf` upstream (`media-services-test_media-api`)
- [ ] Add `package.json` description
- [ ] Redis idempotency / rate limiting (not in current stack)

## Current Status

| Area | Status |
|------|--------|
| Project scaffold | Done |
| HTTP + logging bootstrap | Done |
| DB pool + models | Done |
| DB schema (migrations) | Done |
| DB seed | Done |
| Domain services / APIs | Done |
| Jobs | Not started |
| Tests | Passing |

## Known Issues

- `nginx.conf` still proxies to `media-services-test_media-api:3000`
- `package.json` `description` is empty
- `test.model.ts` targets table `test` with no migration
- Feature brief Redis / Zod / Helmet extras intentionally deferred

## Evolution

- **Phase 1** (done): Scaffold + memory bank + feature scope
- **Phase 2** (done): Migrations, models, services, APIs, tests
- **Phase 3** (optional): Ops polish and Redis idempotency if required
