# Product Context: Payment Service

## Why this service exists

The platform needs a dedicated payment microservice so payment intents,
transactions, and related operations stay isolated from cart, order, logger,
and other hubs.

Without this service, payment rules would scatter across apps and there would
be no single API or database for payment state.

Product scope is defined by the user in `memory-bank/feature/index.md`. This
file describes how the scaffold should behave once that scope is implemented.

## How it should work

### Service lifecycle

1. Load required env vars from `src/constants.ts`
2. Start `xpref` with routes and log client (`src/index.ts`)
3. Connect PostgreSQL through `knexify` when models run queries
4. Publish application logs to `LOG_EXCHANGE` on the common RabbitMQ

### Request flow (target)

1. Client calls a plural resource route (for example `/payments`)
2. Detail routes (`/:id`) run middleware that loads the resource or returns 404
3. Controller validates input, calls service, returns the service result
4. On failure, controller logs and responds with `{ message }`

### Current smoke path

`GET` or `POST` `/test` echoes request body and headers and writes a log event.
This path is for local checks only, not payment business logic.

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

- **Logger**: payment publishes to `LOG_EXCHANGE` (`logger-service`)
- **Order / Cart**: peer domain services; payment does not own their data
- **Monorepo packages**: `@core/log-client`, `@core/message-queue`, `@core/utils`
