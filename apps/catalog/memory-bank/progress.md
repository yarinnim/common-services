# Progress: Catalog Service

## What Works

### Infrastructure

- TypeScript build (`tsc --build`), ESLint, Jest config, nodemon
- Docker (`Dockerfile`) and `nginx.conf` scaffolding
- `xpref` entry (`src/index.ts`), log-client, RabbitMQ config
- PostgreSQL via `knexify` (`src/models/pool.ts`, `knexfile.ts`)
- `/test` route for smoke checks

### Data layer

- Connection pool with write host and read replica settings
- Scaffold model `src/models/test.model.ts` (`test` table)
- No migrations or seeds yet

### Memory bank

- Core docs under `memory-bank/` (except user-owned `feature/` content)
- User-defined catalog scope in `memory-bank/feature/index.md`

## What's Left to Build

### Domain (user-defined in `feature/`)

- [x] Write catalog scope in `memory-bank/feature/index.md`
- [ ] Tenant middleware (client id from `X-Client-ID` or JWT claims)
- [ ] Migrations and seeds under `database/`
- [ ] Domain models (no extra knexify helpers; always client-scoped)
- [ ] `src/service/<feature>/` modules and route registration
- [ ] Category management (hierarchical or flat, per client)
- [ ] Product and variant management (SKU, attributes, options)
- [ ] Pricing and media (client pricing, asset URLs)
- [ ] Search, filter, sort, and pagination

### Quality

- [ ] Unit tests (`*.test.ts`) next to modules
- [ ] Replace leftover `nginx.conf` upstream (`media-services-test_media-api`)
- [ ] Add `package.json` description

## Current Status

| Area | Status |
|------|--------|
| Project scaffold | Done |
| HTTP + logging bootstrap | Done |
| DB pool + test model | Done |
| Feature spec (`feature/index.md`) | Done (user-owned) |
| Tenant isolation | Not started |
| DB schema + seed | Not started |
| Domain services / APIs | Not started |
| Jobs | Not started |
| Tests | None |

## Known Issues

- `nginx.conf` still proxies to `media-services-test_media-api:3000`
- `package.json` `description` is empty
- `test.model.ts` targets table `test` with no migration
- No `src/service/`, `src/jobs/`, or `src/utils/` yet
- No tenant scoping yet; catalog APIs are not implemented

## Evolution

- **Phase 1** (done): Scaffold + memory bank + feature spec
- **Phase 2** (now): Tenant isolation + catalog domain APIs from
  `memory-bank/feature/`
