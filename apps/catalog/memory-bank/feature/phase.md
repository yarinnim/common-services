# Implementation Phases

Catalog is still a scaffold. Implementation follows `memory-bank/feature/index.md`
and the same pattern as inventory: tenant isolation first, then domain APIs.

## Already done

1. App scaffold (`xpref`, knexify pool, log-client, `/test`)
2. Memory bank + user feature spec

---

## Phase 1 — Tenant isolation

Auth is upstream. This service only identifies the client and scopes every query.

1. Add header constants in `src/config.ts` (`app-id`, `app-secret-key`,
   `x-user-id`) and exclude `/test`.
2. Migration `database/migrations/*_create-application-table.ts`
   Table `application`: `id`, `uuid`, `secret_key`, `code`, `name`,
   `setting` JSONB, `created_at` / `updated_at` / `deleted_at`.
3. Seed one tenant under `database/seeds/` (`pool.raw('current_timestamp')`).
4. Model `src/models/application.model.ts` (`initModel`, no extra knexify
   helpers).
5. Global middleware `src/middleware/validate-application.middleware.ts`
   Load tenant by uuid + secret, attach `request.application`, return
   `{ message }` on 401.
6. Register it as `interceptor` on `xpref` in `src/index.ts`.
7. Module `src/application/` (route, controller, service, middleware)
   Routes: `GET/POST /applications`, nested `/:id` with `validateResource`.
8. Register the route in `src/routes/index.ts`.

---

## Phase 2 — Schema (singular tables, soft delete, always `application_id`)

Add fields to the same migration if you change them later. PK is
`increments('id')`. Only `created_at` has a default.

9. `category` — `application_id`, `parent_id` (nullable, same-tenant parent),
   `name`, `description`, timestamps, unique `(application_id, name)`
   (or per parent).
10. `product` — `application_id`, `category_id`, `name`, `description`,
    `attributes` JSONB, timestamps, unique `(id, application_id)`.
11. `variant` — `application_id`, `product_id`, `sku`, `options` JSONB
    (size/color), timestamps, unique `(application_id, sku)`.
12. `price` — `application_id`, `variant_id` (or `product_id`), `currency`,
    `amount`, timestamps.
13. `media` — `application_id`, `product_id` (optional `variant_id`), `url`,
    `kind` (image/asset), timestamps.
14. Composite uniques/FKs on `(id, application_id)` so child rows cannot
    point at another tenant’s parent (same pattern as inventory `item` →
    `category`).
15. Run `npm run migrate:latest` (or `migrate:refresh` with seeds).

---

## Phase 3 — Models

Each model: `initModel`, `BaseEntity` fields, **one query per function**,
optional `Transaction` only on writes. Do not re-implement `find` / `search` /
`paginate` / `create` / `remove` / `patch`. Always
`whereActive({ applicationId })`.

16. `src/models/category.model.ts`
17. `src/models/product.model.ts`
18. `src/models/variant.model.ts`
19. `src/models/price.model.ts`
20. `src/models/media.model.ts`
21. Shared JSON type if needed (`src/models/common.type.ts`), not exported
    from model files as a public API dump.

---

## Phase 4 — Category management

Module under `src/category/`: `index.ts`, `category.controller.ts`,
`category.service.ts`, `category.middleware.ts`.

22. Service: `find`, `searchCategories` (`inFields` listed by hand), create /
    patch / remove; reject parent from another tenant.
23. Middleware: load by `id` + `applicationId`; 404 `{ message }` if missing.
24. Controller: `*Action`, validation beside each action, `page` + `pageSize`,
    errors `{ message }` + `logger().error`. No extra `data` / `status`
    wrappers.
25. Routes: `/categories` + nested `/:id` (`get`, `post`, `put`, `delete`).
26. Register in `src/routes/index.ts`.

---

## Phase 5 — Product and variant management

27. `src/product/` — CRUD on `/products`; category must belong to the same
    client; `attributes` as JSON object.
28. `src/variant/` — CRUD on `/variants` (or nested under product if you keep
    a single param and do not nest `/:id` twice); SKU unique per client;
    `options` JSON (size, color).
29. Detail middleware 404s if the row is missing **or** belongs to another
    client.
30. Writes that touch product + variants use `pool.transaction`; selects stay
    outside the transaction.

---

## Phase 6 — Pricing and media

31. `src/price/` — `/prices` CRUD; amount + currency; scoped to the tenant’s
    variant/product.
32. `src/media/` — `/media` CRUD; store URL mappings only (no file upload in
    this service).
33. Register both route modules.

---

## Phase 7 — Search, filter, sort, pagination

On list `GET`s (especially products):

34. `q` via knexify `search` with explicit `inFields` (name, sku, description).
35. Filters: `categoryId`, attribute keys/values, currency if listing prices.
36. Sort only through the query builder (no extra knex helpers).
37. Always `paginate` last with `page` and `pageSize` from `request.query`.
38. Return the paginate result as-is (no envelope).

---

## Phase 8 — Tests and quality

Jest files next to modules (`*.test.ts`). `npm run eslint` after each slice.

39. Middleware tests: missing headers, bad credentials, `/test` skipped,
    tenant attached.
40. Service tests: client scope, 404 across tenants, category parent rules,
    SKU uniqueness.
41. Controller tests: validation, `{ message }` errors, pagination query.
42. Fix `nginx.conf` upstream to this catalog service (it still points at
    media-api).
43. Set `package.json` `description`.

---

## Phase 9 — Close the loop

44. No cron job unless a later feature asks for one (`src/jobs/FEATURE.job.ts`).
45. Update core memory bank (`activeContext.md`, `progress.md`,
    `systemPatterns.md`). Do **not** edit `memory-bank/feature/`.

---

## Suggested order of work

Tenant → schema → models → categories → products → variants → prices →
media → search → tests → ops/docs.

Inventory in this monorepo is the template: same headers, `application`
table, interceptor, and `src/<feature>/` modules with nested `/:id`. Catalog
adds hierarchy (`parent_id`), variants, prices, and media on top of that.
