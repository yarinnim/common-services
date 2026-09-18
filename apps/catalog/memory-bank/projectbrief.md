# Project Brief: Catalog Service

## Overview

`@common-services/catalog` is a Vibe platform microservice in the
`common-services` monorepo. It is the HTTP API and data layer for a
**multi-tenant product catalog**: categories, products, attributes, variants,
and pricing, isolated per client.

Feature intent: `memory-bank/feature/index.md` (user-maintained).

## Core purpose

1. **HTTP API** — Serve catalog routes through `xpref`
2. **Persistence** — PostgreSQL via `knexify` (`src/models/pool.ts`)
3. **Tenant isolation** — Scope every read and write to the authenticated
   client (external auth; no local login)
4. **Observability** — Publish logs with `@core/log-client` / RabbitMQ
5. **Domain APIs** — Catalog features defined under `memory-bank/feature/`

## Key requirements

### Functional

- Health and smoke checks (`/test` exists today)
- Client-isolated categories, products, attributes, variants, and pricing
- Search, filter, sort, and paginate catalog data
- Soft-delete records; singular table names
- Controllers call services only; services call models

### Technical

- TypeScript, `xpref`, `knexify`
- Services under `src/service/<feature>/` (router, controller, service,
  middleware)
- Models under `src/models/` using `initModel`
- Migrations and seeds under `database/` when domain tables are added

### Non-functional

- Monorepo conventions, Docker-ready, env-based config
- Promise/then, ESLint, cursor rules
- Line length 100; no `async/await` or `Promise.all`
- Data leakage between clients is a critical failure

## Success criteria

- Service boots with required environment variables
- Protected routes require tenant context; queries stay client-scoped
- Protected and public routes follow `xpref` route maps
- Errors return `{ message }` only; controllers log via `logger().error`
- User feature docs stay in `memory-bank/feature/` and are not overwritten

## Constraints

- PostgreSQL only; singular table names
- Controllers → services → models (never model from controller)
- Never import `knex` in models; use `knexify`
- Auth is upstream (API gateway / JWT / headers); this service does not log in
  users
- Do not overwrite user content in `memory-bank/feature/`
