# Feature

ct as an expert backend software architect and microservices developer. Design and write the core architecture, data models, and API specifications for a multi-tenant Shopping Cart Microservice.

### Core Requirements

1. Multi-Tenancy & Client Isolation:
   - The microservice will serve multiple distinct client applications (tenants).
   - Each client must have strict, isolated control over their customers' carts, items, quantities, and pricing data. Data leakage between clients is a critical security vulnerability to prevent.

2. Authentication & Authorization:
   - The microservice relies on an external authentication layer (e.g., API Gateway or upstream app auth).
   - Incoming requests will supply an authenticated context (such as `X-Client-ID` headers and user/session identification claims) to isolate tenant data and tie carts to specific end-users or guest sessions.
   - All database queries and read/write operations must be strictly scoped to the authenticated client ID and user session.

3. Key Features Needed:
   - Cart Session Management: Support for both authenticated user carts and anonymous/guest cart sessions (with cart merging capabilities upon user login).
   - Item Operations: Add items, update quantities, remove items, and clear the entire cart.
   - Expiration & Cleanup: Automatic TTL (Time-To-Live) or cleanup routines for abandoned guest carts.
   - Price & Catalog Sync: Mechanisms to validate items, quantities, and prices against the catalog/inventory services (or accept snapshots passed during addition).

# Implementation Phases

Cart is still a scaffold. Implementation follows this feature spec and the
same pattern as inventory and catalog: tenant isolation first, then domain
APIs.

## Already done

1. App scaffold (`xpref`, knexify pool, log-client, `/test`)
2. Memory bank + user feature spec

---

## Phase 1 — Tenant isolation

Auth is upstream. This service only identifies the client and scopes every
query.

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

9. `cart` — `application_id`, `user_id` (nullable for guests), `session_id`
   (guest token), status, `expires_at`, timestamps. Unique per tenant for an
   active user cart and for an active guest session.
10. `cart_item` — `application_id`, `cart_id`, catalog refs (`product_id` /
    `variant_id` / sku), `quantity`, price snapshot (`currency`, `amount`),
    timestamps. Unique `(application_id, cart_id, variant_id)` (or sku).
11. Composite uniques/FKs on `(id, application_id)` so items cannot point at
    another tenant’s cart.
12. Run `npm run migrate:latest` (or `migrate:refresh` with seeds).

---

## Phase 3 — Models

Each model: `initModel`, `BaseEntity` fields, **one query per function**,
optional `Transaction` only on writes. Do not re-implement `find` / `search` /
`paginate` / `create` / `remove` / `patch`. Always
`whereActive({ applicationId })`.

13. `src/models/cart.model.ts`
14. `src/models/cart-item.model.ts`
15. Shared types in `src/models/common.type.ts` if needed, not exported from
    model files as a public API dump.

---

## Phase 4 — Cart session management

Module under `src/cart/`: `index.ts`, `cart.controller.ts`,
`cart.service.ts`, `cart.middleware.ts`.

16. Create or load an authenticated-user cart, scoped to `applicationId` +
    `userId`.
17. Create or load a guest cart from session identity, with TTL/`expires_at`.
18. Merge guest cart into the user cart on login (move or combine items, then
    close the guest cart).
19. Service: `find`, `searchCarts` (`inFields` listed by hand), create /
    patch / remove.
20. Middleware: load by `id` + `applicationId` (and user/session); 404
    `{ message }` if missing **or** belongs to another client/user/session.
21. Controller: `*Action`, validation beside each action, `page` + `pageSize`,
    errors `{ message }` + `logger().error`. No extra `data` / `status`
    wrappers.
22. Routes: `/carts` + nested `/:id` (`get`, `post`, `put`, `delete`).
23. Register in `src/routes/index.ts`.

---

## Phase 5 — Item operations

Module `src/cart-item/` (or nested under cart without using the same param
twice): `index.ts`, `cart-item.controller.ts`, `cart-item.service.ts`,
`cart-item.middleware.ts`.

24. Add item, update quantity, remove item, clear cart.
25. Reject items whose parent cart is another tenant’s.
26. Writes that touch cart + items use `pool.transaction`; selects stay
    outside the transaction.
27. Routes for `/cart-items` (or a single nested param under `/carts`).
28. Register in `src/routes/index.ts`.

---

## Phase 6 — Price and catalog sync

29. On add/update, validate item, quantity, and price against catalog /
    inventory **or** store the snapshot passed in the request.
30. Keep snapshots on `cart_item` so later catalog changes do not silently
    rewrite the line.
31. Fail with `{ message }` when the item is invalid or out of the tenant’s
    catalog.

---

## Phase 7 — Expiration and cleanup

Guest/abandoned carts need TTL.

32. Job `src/jobs/cleanup-guest-cart.job.ts` — default export, interval as
    first argument, process function separate from the runner.
33. Soft-delete expired guest carts (`expires_at` / abandoned) and their
    items.
34. Wire the job from the service entry so it runs on the configured interval.

---

## Phase 8 — Tests and quality

Jest files next to modules (`*.test.ts`). `npm run eslint` after each slice.

35. Middleware tests: missing headers, bad credentials, `/test` skipped,
    tenant attached.
36. Service tests: client/user/session scope, merge, 404 across tenants,
    quantity rules.
37. Job tests: expired guest carts are cleaned; active/user carts are left
    alone.
38. Controller tests: validation, `{ message }` errors, pagination query.
39. Fix `nginx.conf` upstream to this cart service (it still points at
    media-api).
40. Set `package.json` `description`.

---

## Phase 9 — Close the loop

41. Update core memory bank (`activeContext.md`, `progress.md`,
    `systemPatterns.md`). Do **not** overwrite the Core Requirements in this
    file.

---

## Suggested order of work

Tenant → schema → models → cart sessions → items → catalog/price sync →
guest cleanup job → tests → ops/docs.

Inventory and catalog in this monorepo are the template: same headers,
`application` table, interceptor, and `src/<feature>/` modules with nested
`/:id`. Cart adds guest sessions, merge-on-login, line-item snapshots, and a
cleanup job on top of that.
