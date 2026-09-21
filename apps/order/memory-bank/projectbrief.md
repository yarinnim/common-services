# Project Brief: Order Service

## Overview

`@core-services/order` is a Vibe platform microservice in the
`common-services` monorepo. It is the HTTP API and data layer for order
operations. Domain scope is user-maintained in `memory-bank/feature/index.md`.

Feature intent: `memory-bank/feature/index.md` (user-maintained).

## Core purpose

1. **HTTP API** — Serve order routes through `xpref`
2. **Persistence** — PostgreSQL via `knexify` (`src/models/pool.ts`)
3. **Observability** — Publish logs with `@core/log-client` / RabbitMQ
4. **Domain APIs** — Order features defined under `memory-bank/feature/`

## Key requirements

### Functional

- Health and smoke checks (`/test` exists today)
- Order domain APIs documented in `memory-bank/feature/`
- Soft-delete records; singular table names
- Controllers call services only; services call models

### Technical

- TypeScript, `xpref`, `knexify`
- Services under `src/<feature>/` (router, controller, service, middleware)
- Models under `src/models/` using `initModel`
- Migrations and seeds under `database/` when domain tables are added

### Non-functional

- Monorepo conventions, Docker-ready, env-based config
- Promise/then, ESLint, cursor rules
- Line length 100; no `async/await` or `Promise.all`

## Success criteria

- Service boots with required environment variables
- Protected and public routes follow `xpref` route maps
- Errors return `{ message }` only; controllers log via `logger().error`
- User feature docs stay in `memory-bank/feature/` and are not overwritten

## Constraints

- PostgreSQL only; singular table names
- Controllers → services → models (never model from controller)
- Never import `knex` in models; use `knexify`
- Do not overwrite user content in `memory-bank/feature/`
