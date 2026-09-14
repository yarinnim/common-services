# Product Context: Analytics Service

## Why this service exists

Distributed clients (web, mobile, internal tools) send analytics and related traffic
to a central hub. Each caller must be a **registered integrated application** with:

- Public **uuid** (sent as application id)
- **secret_key** for proving identity
- Stable **code** and display **name**
- Per-app **setting** JSON for configuration

Without this service, credentials fragment across codebases and analytics cannot be
trusted per tenant.

## How it should work

### Registration

1. Create application (`code`, `name`, optional `setting`)
2. Database assigns `id`, `uuid`, `secret_key` (defaults from migration)
3. Operator or seed distributes uuid + secret to the client

### Every request (from feature spec)

1. Client sends application id (uuid) and secret (header names aligned with platform)
2. Middleware loads `application` row (`deleted_at` null)
3. Secret is verified; `request.application` receives safe context (no secret on object)
4. Handler runs analytics or admin logic

### Default seed (local/test)

| Field | Value |
|-------|--------|
| `code` | `analytics` |
| `name` | `Analytics` |
| `uuid` | `a1111111-1111-4111-8111-111111111111` |
| `secret_key` | `e5162515b37ccf505990b3206e6c9d22` |

## User experience goals

### Developers

- Clear types (`Application`, `ApplicationContext`, `CreateApplication`, …)
- `npm run migrate:refresh` for clean DB
- `/test` excluded from auth for smoke checks
- Future: REST `/applications` for registry management

### Operations

- Standard `APP_*` / `DB_*` env vars
- Health via `@core/api`; errors to log exchange

## Success metrics

- 100% of protected routes reject unknown or invalid applications
- No duplicate active `code` / `name`
- Seed app always available after `seed:run`

## Relation to white-client

`packages/white-client` uses `integrated_app` and `app-id` + JWT elsewhere.
Analytics uses the same identity concept on table `application` with explicit
secret validation suitable for the analytics hub.
