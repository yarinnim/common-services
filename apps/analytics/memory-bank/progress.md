# Progress: Analytics Service

## What Works

### Infrastructure

- TypeScript build, ESLint, Docker/nginx scaffolding
- `@core/api` entry (`src/index.ts`), log-client, RabbitMQ config
- PostgreSQL via `@core/db` (`src/models/pool.ts`)
- `/test` route for smoke checks

### Data layer

- Migration: `20260529085250_create-application-table.ts`
- Seed: `database/seeds/application.ts`
  - `uuid`: `a1111111-1111-4111-8111-111111111111`
  - `secret_key`: MD5 of uuid (`e5162515b37ccf505990b3206e6c9d22`)
  - `code`: `analytics`, `name`: `Analytics`

### Memory bank

- Core docs under `memory-bank/` (except user-owned `feature/` content)

## What's Left to Build

### Application domain (priority)

- [ ] `src/models/application.type.ts` — types (see System Patterns)
- [ ] `src/models/application.model.ts` — find, CRUD, search
- [ ] `src/middleware/validate-application.middleware.ts` — uuid + secret per request
- [ ] `src/services/application/` — service, controller, detail middleware, routes
- [ ] Register routes in `src/routes/index.ts` and global `interceptor` in `src/index.ts`

### Product (user-defined in `feature/`)

- [ ] Analytics request ingestion and processing
- [ ] Full secret-key validation rules (header name, timing-safe compare)

### Quality

- [ ] Unit tests (`*.test.ts`) for model and middleware
- [ ] Integration tests with seeded application

## Current Status

| Area | Status |
|------|--------|
| Project scaffold | Done |
| DB schema + seed | Done |
| Application types + model | Pending in `src/` |
| Request validation middleware | Pending |
| Application REST API | Pending |
| Analytics events API | Not started (feature/) |
| Tests | None |

## Known Issues

- `src/` out of sync with older `build/` artifacts — clean rebuild after restore
- Package name typo: `@core-sevices/analytics`
- `constants.ts` lacks application header constants until middleware is restored

## Evolution

- **Phase 1** (now): Registry + per-request application validation + `/applications` CRUD
- **Phase 2**: Analytics event APIs (document in `memory-bank/feature/`)
