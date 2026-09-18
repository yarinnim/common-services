# Product Context: Cart Service

## Why this service exists

The platform needs a dedicated cart microservice so cart state stays isolated
from catalog, inventory, logger, and other hubs.

Without this service, cart rules would scatter across apps and there would be
no single API or database for cart state.

Product scope is defined by the user in `memory-bank/feature/index.md`. This
file describes how the scaffold should behave once that scope is implemented.

## How it should work

### Service lifecycle

1. Load required env vars from `src/constants.ts`
2. Start `xpref` with routes and log client (`src/index.ts`)
3. Connect PostgreSQL through `knexify` when models run queries
4. Publish application logs to `LOG_EXCHANGE` on the common RabbitMQ

### Request flow (target)

1. Client sends `app-id` and `app-secret-key` (and optional `x-user-id`)
2. Interceptor loads the tenant and attaches it to the request (`/test` skipped)
3. Client calls a plural resource route (for example `/applications`)
4. Detail routes (`/:id`) run middleware that loads the resource or returns 404
5. Controller validates input, calls service, returns the service result
6. On failure, controller logs and responds with `{ message }`

### Current smoke path

`GET` or `POST` `/test` echoes request body and headers and writes a log event.
This path is for local checks only, not cart business logic.

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

- **Logger**: cart publishes to `LOG_EXCHANGE` (`logger-service`)
- **Catalog / Inventory**: sibling commerce services; cart does not own them
- **Analytics**: separate hub; cart does not store analytics events
- **Monorepo packages**: `@core/log-client`, `@core/message-queue`, `@core/utils`
