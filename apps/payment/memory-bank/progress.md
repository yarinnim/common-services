# Progress: Payment Service

## What Works

### Infrastructure

- TypeScript build (`tsc --build`), ESLint, Jest config, nodemon
- Docker (`Dockerfile`) and `nginx.conf` scaffolding
- `xpref` entry with tenant interceptor (`src/index.ts`)
- PostgreSQL via `knexify` (`src/models/pool.ts`, `knexfile.ts`)
- `/test` route for smoke checks

### Data layer

- Migrations: `application`, `gateway_credential`, `payment`,
  `webhook_event`, `payment_audit`
- Application seed under `database/seeds/application.ts`
- Models for all domain tables

### Feature modules

- Tenant context middleware (`src/middleware/validate-application.middleware.ts`)
- Application CRUD (`src/application/`)
- Gateway vault with AES-256-GCM (`src/gateway-credential/`, `src/utils/encrypt.ts`)
- Payment engine + Stripe adapter (`src/payment/`)
- DB idempotency via `Idempotency-Key` (`src/utils/idempotency.ts`)
- Webhook ingestion (`src/webhook/`)
- Audit list/detail + write-on-mutate (`src/payment-audit/`,
  `src/utils/payment-audit.ts`)

### Memory bank

- Core docs under `memory-bank/` (except user-owned `feature/` content)

## What's Left to Build

### Domain

- [x] Write payment scope in `memory-bank/feature/index.md`
- [x] Migrations and seeds under `database/`
- [x] Domain models
- [x] Feature modules and route registration
- [ ] PayPal / Adyen adapters (Stripe only today)
- [ ] Redis-backed idempotency (DB used instead)

### Quality

- [ ] Unit tests (`*.test.ts`) next to modules
- [ ] Replace leftover `nginx.conf` upstream (`media-services-test_media-api`)
- [ ] Add `package.json` description
- [ ] Set a dedicated `DB_DATABASE` in `env.example` (currently `default`)

## Current Status

| Area | Status |
|------|--------|
| Project scaffold | Done |
| HTTP + logging bootstrap | Done |
| DB pool + models | Done |
| DB schema + seed | Done |
| Domain services / APIs | Done |
| Jobs | Not started |
| Tests | None |

## Known Issues

- `nginx.conf` still proxies to `media-services-test_media-api:3000`
- `package.json` `description` is empty
- `env.example` `DB_DATABASE` is still `default`
- `test.model.ts` targets table `test` with no migration
- Idempotency is PostgreSQL-based; feature brief mentioned Redis

## Evolution

- **Phase 1** (done): Scaffold + memory bank
- **Phase 2** (done): Schema + six feature modules
- **Phase 3** (next): Tests + hardening
