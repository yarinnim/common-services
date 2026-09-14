# Active Context: Analytics Service

## Current Work Focus

Analytics hub for **integrated applications**: register apps, validate every
incoming request by application `uuid` and `secret_key`, then serve analytics APIs.

See user-defined scope in `memory-bank/feature/index.md`.

### In repository today

| Area | Status |
|------|--------|
| Migration `application` table | Done |
| Seed (`code: analytics`) | Done |
| `src/models/application.type.ts` | **Not in `src/`** — restore or re-add |
| `src/models/application.model.ts` | **Not in `src/`** — restore or re-add |
| Global validate middleware | **Not in `src/`** — planned (`app-id` + secret) |
| `src/services/application/*` | **Not in `src/`** |
| `/applications` REST routes | **Not wired** |
| `/test` smoke route | Done |
| API bootstrap + log-client | Done |

Stale compiled files under `build/` may exist without matching `src/`; run
`npm run build` after restoring sources.

## Recent Changes

- User updated `memory-bank/feature/index.md` (analytics hub, middleware validation)
- `application` migration and seed stable
- Types/model/middleware were implemented in development but are absent from `src/` now

## Next Steps

1. Restore `application.type.ts` and `application.model.ts` (CRUD + search)
2. Implement global middleware: validate `app-id` (uuid) and secret key per feature spec
3. Add `src/services/application/` and register `/applications` routes
4. Wire `interceptor` in `src/index.ts` for global application middleware
5. Add constants: `APPLICATION_ID_HEADER`, excluded paths, secret header name
6. Tests beside model and middleware

## Active Decisions

- Table `application` (singular); column `setting` (JSONB), not `config`
- Types live in `src/models/application.type.ts`; model re-exports them
- `ApplicationContext` on request excludes `secretKey` after validation
- Align header names with `white-client` (`app-id`) where possible
- Exclude `/test` (and similar) from global application validation

## Development Environment

- Path: `apps/analytics`
- Lint: `npm run eslint`
- DB: `npm run migrate:latest` / `npm run seed:run`
