# Progress: Inventory Service

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
- `memory-bank/feature/` folder created for user-defined features

## What's Left to Build

### Domain (user-defined in `feature/`)

- [ ] Write inventory scope in `memory-bank/feature/index.md`
- [ ] Migrations and seeds under `database/`
- [ ] Domain models (no extra knexify helpers)
- [ ] `src/services/<feature>/` modules and route registration

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
| DB schema + seed | Not started |
| Domain services / APIs | Not started (feature/) |
| Jobs | Not started |
| Tests | None |

## Known Issues

- `nginx.conf` still proxies to `media-services-test_media-api:3000`
- `package.json` `description` is empty
- `test.model.ts` targets table `test` with no migration
- No `src/services/`, `src/jobs/`, or `src/utils/` yet

## Evolution

- **Phase 1** (now): Scaffold + memory bank
- **Phase 2**: Implement features documented in `memory-bank/feature/`
