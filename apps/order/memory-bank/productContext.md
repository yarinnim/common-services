# Product Context: Order Service

## Why this service exists

The platform needs a dedicated order microservice so order lifecycle,
fulfillment handoff, and related operations stay isolated from cart,
inventory, catalog, and other hubs.

Without this service, order rules would scatter across apps and there would
be no single API or database for order state.

Product scope is defined by the user in `memory-bank/feature/index.md`. This
file describes how the scaffold should behave once that scope is implemented.

## How it should work

### Service lifecycle

1. Load required env vars from `src/constants.ts`
2. Start `xpref` with routes and log client (`src/index.ts`)
3. Connect PostgreSQL through `knexify` when models run queries
4. Publish application logs to `LOG_EXCHANGE` on the common RabbitMQ

### Request flow (target)

1. Client calls a plural resource route (for example `/orders`)
2. Detail routes (`/:id`) run middleware that loads the resource or returns 404
3. Controller validates input, calls service, returns the service result
4. On failure, controller logs and responds with `{ message }`

### Current smoke path

`GET` or `POST` `/test` echoes request body and headers and writes a log event.
This path is for local checks only, not order business logic.

## User experience goals

### Developers

- Clear feature modules under `src/<feature>/`
- `npm run migrate:refresh` when migrations and seeds exist
- `/test` available for smoke checks
- Feature intent lives in `memory-bank/feature/index.md`

### Operations

- Standard `APP_*` / `DB_*` / `MQ_*` env vars (`env.example`)
- Docker image from repo-root `Dockerfile`
- Health and errors visible through `@core/log-client`

## Success metrics

- Service starts only when required env vars are present
- Domain routes match cursor route rules (plural resources, nested `/:id`)
- Soft-deleted rows stay hidden (`whereActive` / knexify helpers)
- User-owned feature docs are never auto-edited

## Relation to other services

- **Logger**: order publishes to `LOG_EXCHANGE` (`logger-service`)
- **Cart / Catalog / Inventory**: peer commerce services; coordination is
  defined when features are written under `memory-bank/feature/`
- **Monorepo packages**: `@core/log-client`, `@core/message-queue`, `@core/utils`
