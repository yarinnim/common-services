# System Patterns: Analytics Service

## Architecture Overview

### Microservice

- Package: `apps/analytics` (`@core-sevices/analytics`)
- HTTP: `@core/api` (Express)
- Data: PostgreSQL + Knex (`knexfile.ts`, `src/models/pool.ts`)

### Request flow (target)

```
Client (integrated app)
  → Headers: app-id (uuid), app secret
  → Global middleware: validate application
  → Route handler (analytics or /applications CRUD)
```

User-facing goals: `memory-bank/feature/index.md`.

### Layering

```
src/index.ts                    — interceptor registers global middleware
src/middleware/                 — validate-application.middleware.ts
src/routes/index.ts             — merges route modules
src/services/<feature>/
  index.ts                      — Route map
  *.controller.ts               — HTTP + validation; calls service only
  *.service.ts                    — calls model
  *.middleware.ts                 — validateResource for /:id detail routes
src/models/
  application.type.ts           — Application, CreateApplication, etc.
  application.model.ts            — queries; re-exports types
```

## Application types (`application.type.ts`)

| Type | Purpose |
|------|---------|
| `ApplicationSetting` | JSONB `setting` shape |
| `Application` | Full DB row (includes `secretKey`) |
| `ApplicationContext` | Attached to request after auth (no secret) |
| `CreateApplication` | Insert payload |
| `UpdateApplication` | Partial update |
| `ApplicationPaging` | Search pagination |

Import types from `application.model.ts` in services/controllers.

## Database: `application`

| Column (DB) | TS (camelCase) | Notes |
|-------------|----------------|-------|
| `id` | `id` | Serial PK |
| `uuid` | `uuid` | Public app id; `app-id` header |
| `secret_key` | `secretKey` | Validated on each request |
| `code` | `code` | Unique |
| `name` | `name` | Unique |
| `setting` | `setting` | JSONB, default `{}` |
| `created_at` | `createdAt` | DB default |
| `updated_at` | `updatedAt` | `current_timestamp` on update |
| `deleted_at` | `deletedAt` | Soft delete |

Conventions: `whereNull('deleted_at')`; optional `Transaction` last on writes.

## Middleware patterns

### Global (every request)

- Resolve application by `app-id` header (uuid)
- Validate secret key (per feature spec — header TBD)
- Set `request.application` as `ApplicationContext`
- Skip paths in `APPLICATION_EXCLUDED_PATHS` (e.g. `/test`)

### Detail routes (`/applications/:id`)

- `validateResource`: load by numeric `id`, attach `request.application`

## REST pattern (planned)

```typescript
'/applications': ['application', [], {
  get: getAction,
  post: postAction,
}, {
  '/:id': ['application-detail', [validateResource], {
    get: detailAction,
    put: updateAction,
    delete: deleteAction,
  }],
}],
```

- Errors: `{ message }` only; `logger().error` in controller `catch`
- List search: omit `secretKey` from selected columns

## Code style

- `type` not `interface`; `import { type X }`
- Promise/then; no `async/await` or `Promise.all`
- Kebab-case file names; camelCase functions

## Component map (repository)

| Path | Status |
|------|--------|
| `database/migrations/*application*` | Present |
| `database/seeds/application.ts` | Present |
| `src/models/application.type.ts` | Pending |
| `src/models/application.model.ts` | Pending |
| `src/middleware/validate-application.middleware.ts` | Pending |
| `src/services/application/` | Pending |
| `src/routes/test.route.ts` | Present |
