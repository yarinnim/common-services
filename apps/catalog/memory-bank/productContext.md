# Product Context: Catalog Service

## Why this service exists

The platform needs a dedicated **product catalog** microservice so tenants can
own categories, products, variants, attributes, pricing, and media without
mixing that data into logger, analytics, or inventory.

Without this service, catalog rules would scatter across apps and there would
be no single API or database for tenant-scoped catalog state.

Product scope is defined by the user in `memory-bank/feature/index.md`. This
file describes how the scaffold should behave once that scope is implemented.

## How it should work

### Service lifecycle

1. Load required env vars from `src/constants.ts`
2. Start `xpref` with routes and log client (`src/index.ts`)
3. Connect PostgreSQL through `knexify` when models run queries
4. Publish application logs to `LOG_EXCHANGE` on the common RabbitMQ

### Request flow (target)

1. Upstream auth supplies tenant context (`X-Client-ID` or JWT claims)
2. Global middleware attaches the client id (skip paths such as `/test`)
3. Client calls a plural resource route (for example `/products`)
4. Detail routes (`/:id`) run middleware that loads the resource or returns 404
5. Controller validates input, calls service, returns the service result
6. Models and services always filter by the authenticated client id
7. On failure, controller logs and responds with `{ message }`

### Current smoke path

`GET` or `POST` `/test` echoes request body and headers and writes a log event.
This path is for local checks only, not catalog business logic.

## User experience goals

### Developers

- Clear feature modules under `src/service/<feature>/`
- `npm run migrate:refresh` when migrations and seeds exist
- `/test` available for smoke checks
- Feature intent lives in `memory-bank/feature/index.md`

### Operations

- Standard `APP_*` / `DB_*` / `MQ_*` env vars (`env.example`)
- Docker image from repo-root `Dockerfile`
- Health and errors visible through `@core/log-client`

### Tenant operators

- Isolated catalog per client (no cross-tenant reads or writes)
- Category trees, products with SKUs and variants, pricing, and media URLs
- Pagination, sorting, and filters by category, attributes, or text

## Success metrics

- Service starts only when required env vars are present
- Domain routes match cursor route rules (plural resources, nested `/:id`)
- Soft-deleted rows stay hidden (`whereActive` / knexify helpers)
- Every catalog query is scoped to the authenticated client
- User-owned feature docs are never auto-edited

## Relation to other services

- **Auth / gateway**: supplies tenant identity; catalog does not authenticate
- **Logger**: catalog publishes to `LOG_EXCHANGE` (`logger-service`)
- **Analytics**: separate hub; catalog does not store analytics events
- **Inventory**: separate hub; catalog does not own stock state
- **Monorepo packages**: `@core/log-client`, `@core/message-queue`, `@core/utils`
