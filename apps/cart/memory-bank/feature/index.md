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
