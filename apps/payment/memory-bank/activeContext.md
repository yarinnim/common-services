# Active Context: Payment Service

## Current Work Focus

All six feature modules from `memory-bank/feature/` are implemented on top of
the schema. Next work is tests, nginx upstream fix, and optional Redis if
idempotency must leave PostgreSQL.

See user-defined scope in `memory-bank/feature/index.md`.

### In repository today

| Area | Status |
|------|--------|
| `xpref` bootstrap (`src/index.ts`) | Done |
| Tenant interceptor (`validateApplication`) | Done |
| Application CRUD (`/applications`) | Done |
| Gateway vault (`/gateway-credentials`) | Done |
| Payment engine (`/payments/*`) | Done |
| Idempotency (`Idempotency-Key` + DB) | Done |
| Webhooks (`/webhooks/:applicationId/:provider`) | Done |
| Payment audits (`/payment-audits`) | Done |
| Stripe adapter (tenant-key strategy) | Done |
| Unit tests (`*.test.ts`) | **Missing** |
| Jobs under `src/jobs/` | **Missing** |

## Recent Changes

- Feature 1: tenant middleware + application module
- Feature 2: AES-256-GCM vault + gateway-credential APIs
- Feature 3–4: payment charge/authorize/capture/refund + idempotency
- Feature 5: webhook ingestion with signature verify + DLQ status
- Feature 6: payment audit writes + list/detail APIs

## Next Steps

1. Add Jest tests (tenant isolation, vault encryption, payment flows)
2. Run `npm run migrate:latest` / `npm run seed:run` against a real DB
3. Point `nginx.conf` at this service
4. Optionally add Redis if idempotency must leave PostgreSQL

## Active Decisions

- Tenant headers: `app-id` + `app-secret-key` (same as cart/order)
- Webhooks skip tenant headers; path carries `applicationId` + provider
- Secrets encrypted at rest with `ENCRYPTION_MASTER_KEY` (AES-256-GCM)
- Idempotency uses DB unique `(application_id, idempotency_key)`, not Redis
- Stripe adapter is the first provider; PayPal/Adyen resolve throws until added
- Do not generate or overwrite `memory-bank/feature/` content

## Development Environment

- Path: `apps/payment`
- Lint: `npm run eslint`
- DB: `npm run migrate:latest` / `npm run seed:run`
- Node: `.node-version` `v24.19.0`
- Required env: `ENCRYPTION_MASTER_KEY` (64 hex chars)
