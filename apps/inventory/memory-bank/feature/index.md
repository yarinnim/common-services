# Inventory

Act as an expert backend software architect and microservices developer. Design and write the core architecture, data models, and API specifications for a multi-tenant Inventory Management Microservice.

### Core Requirements

1. Multi-Tenancy & Isolation:
   - The service will be consumed by multiple distinct clients (tenants).
   - Each client must have strict, isolated control over their own inventory items, stock levels, warehouses, and categories. Data leakage between clients is a critical security flaw to prevent.

2. Authentication & Authorization:
   - The microservice does not handle user login directly. Instead, it relies on an external App Authentication service (via API Gateway, JWT, or internal service-to-service tokens).
   - Incoming requests will include authenticated headers (e.g., `X-Client-ID`, `X-User-ID`, or claims extracted from a validated JWT) indicating which client the request belongs to.
   - Ensure all database queries are automatically scoped to the authenticated client ID.

3. Key Features Needed:
   - Item Management: Create, update, delete, and view product SKU, name, description, and attributes per client.
   - Stock/Warehouse Tracking: Track inventory levels across multiple locations/warehouses for a given client.
   - Stock Movements: Record adjustments (restock, sale, damage, transfer) with an audit trail.
   - Concurrency Control: Implement optimistic or pessimistic locking to prevent race conditions during high-volume stock deductions (e.g., flash sales).
