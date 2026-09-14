# Project Brief: Analytics Service

## Overview

`@common-sevices/analytics` is a Vibe platform microservice that acts as an
**analytics hub** for **integrated applications**. Registered apps call the service
with credentials; middleware validates **application uuid** and **secret key** before
any business logic runs.

Feature intent: `memory-bank/feature/index.md` (user-maintained).

## Core purpose

1. **Application registry** — PostgreSQL `application` table (`uuid`, `secret_key`,
   `code`, `name`, `setting` JSONB)
2. **Per-request validation** — Global middleware on every route (except exclusions)
3. **Analytics APIs** — Accept and process analytics traffic from verified apps (future)
4. **Observability** — Log via `@core/log-client` / RabbitMQ

## Key requirements

### Functional

- Register and manage integrated applications (CRUD API planned)
- Unique `code` and `name`; soft delete
- Validate `app-id` (uuid) and secret on each client request
- Default seed app `analytics` for dev/test

### Technical

- TypeScript, `@core/api`, `@core/db`
- Types in `application.type.ts`; queries in `application.model.ts`
- Services under `src/services/<feature>/` (router, controller, service, middleware)
- Migrations/seeds under `database/`

### Non-functional

- Monorepo conventions, Docker-ready, env-based config
- Promise/then, ESLint, cursor rules

## Success criteria

- Only registered, non-deleted applications can call protected routes
- Operators can manage apps via `/applications` API
- Seed provides predictable credentials for integration tests
- Analytics pipeline documented under `memory-bank/feature/`

## Constraints

- PostgreSQL only; singular table names
- Controllers → services → models
- Do not overwrite user content in `memory-bank/feature/`
