# Progress: Payment Service

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
- Migrations for `application`, `gateway_credential`, `payment`,
  `webhook_event`, `payment_audit`
- Application seed under `database/seeds/application.ts`

### Memory bank

- Core docs under `memory-bank/` (except user-owned `feature/` content)
- `memory-bank/feature/` folder created for user-defined features

## What's Left to Build

### Domain (user-defined in `feature/`)

- [x] Write payment scope in `memory-bank/feature/index.md`
- [x] Migrations and seeds under `database/`
- [ ] Domain models (no extra knexify helpers)
- [ ] `src/<feature>/` modules and route registration

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
| DB pool + test model | Done |
| DB schema + seed | Done (migrations + application seed) |
| Domain services / APIs | Not started (feature/) |
| Jobs | Not started |
| Tests | None |

## Known Issues

- `nginx.conf` still proxies to `media-services-test_media-api:3000`
- `package.json` `description` is empty
- `env.example` `DB_DATABASE` is still `default`
- `test.model.ts` targets table `test` with no migration
- No `src/<feature>/`, `src/jobs/`, or `src/utils/` yet
- Migrations not applied until `npm run migrate:latest`

## Evolution

- **Phase 1** (done): Scaffold + memory bank
- **Phase 2** (now): Schema ready; implement features from `memory-bank/feature/`
