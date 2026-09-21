You are an expert backend and system architect. Design and implement a production-ready, multi-tenant **Order Service** microservice that serves multiple client applications (referred to as `applications` or tenants) across E-commerce, Mini Shop, and POS channels.

### 1. Core Architecture & Multi-Tenancy Strategy
* **Tenant Isolation:** Every incoming request must resolve the tenant/application context (via an `X-App-ID` header). Ensure database queries, indexes, and Redis keys are strictly scoped by the `app_id`.
* **Tech Stack:** Node.js, TypeScript, Express/NestJS, PostgreSQL, and Redis.
* **Architecture Pattern:** Clean Architecture (Controllers -> Services -> Repositories -> Database).

### 2. Core Domain Models & Database Schema (PostgreSQL)
Design the database schema with proper indexes, foreign keys, and audit fields:
* **Orders:** Primary order entity (ID, app_id, merchant_id, customer_id, channel_type [`ECOMMERCE` | `MINI_SHOP` | `POS`], store_id, status, subtotal, tax_total, discount_total, grand_total, currency, metadata, created_at, updated_at).
* **Order Items:** Line items snapshotted at purchase time (ID, order_id, product_id, sku, name, unit_price, quantity, total_price, metadata).
* **Order Status History:** Audit trail for tracking state transitions (ID, order_id, previous_status, new_status, reason, changed_by, created_at).

### 3. API Design & Requirements
Implement RESTful APIs with the following standards:
* **Middleware:** 
  * Tenant resolution and validation middleware checking against the app context.
  * API Key / Bearer token authentication.
  * Rate limiting per tenant using Redis.
  * Request validation using Zod.
* **Endpoints:**
  * `POST /v1/orders` - Create a new order (supports channel-specific fields and line-item snapshots).
  * `GET /v1/orders` - List orders with filtering (by status, channel, date range, merchant), pagination, and sorting (strictly scoped to calling `app_id`).
  * `GET /v1/orders/:id` - Retrieve full order details including line items and status history.
  * `PATCH /v1/orders/:id/status` - Transition order state (with validation rules for allowed status transitions).
  * `POST /v1/orders/:id/cancel` - Cancel an active order.
* **Idempotency:** Ensure mutating endpoints (especially `POST /v1/orders`) support an `Idempotency-Key` header stored in Redis with a 24-hour TTL to prevent double-charging or duplicate creation.

### 4. Non-Functional Requirements
* **Observability:** Structured JSON logging with correlation IDs (`X-Request-ID`) and tenant context injected into every log entry.
* **Error Handling:** Standardized error response format (`{ success: false, error: { code, message, details } }`).
* **Security:** Helmet headers, CORS configuration, SQL injection prevention via parameterized queries, and strict payload sanitization.

### 5. Deliverables Expected
1. **Directory Structure:** A scalable folder layout optimized for a TypeScript microservice.
2. **Database Migrations:** SQL migration scripts or query builder setups (e.g., Knex) for the core order tables.
3. **Core Modules:** Boilerplate code for tenant middleware, state machine transition validation, Zod schemas, and a complete CRUD/creation module for Orders.
4. **Environment Configuration:** A `.env.example` file detailing required database URLs, Redis connections, and security secrets.