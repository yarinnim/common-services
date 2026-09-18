# Feature

Act as an expert backend software architect and microservices developer. Design and write the core architecture, data models, and API specifications for a multi-tenant Product Catalog Microservice.

### Core Requirements

1. Multi-Tenancy & Client Isolation:
   - The microservice will serve multiple distinct clients (applications/tenants).
   - Each client must have strict, isolated control over their own catalog data (categories, products, attributes, variants, and pricing structures). Data leakage between clients is a critical security vulnerability to prevent.

2. Authentication & Authorization:
   - The microservice relies on an external authentication layer (e.g., API Gateway or upstream service). 
   - Incoming requests will supply an authenticated context (such as `X-Client-ID` headers or validated JWT claims) identifying the tenant.
   - All database queries and read/write operations must be automatically scoped to the authenticated client ID.

3. Key Features Needed:
   - Category Management: Hierarchical or flat category structures per client (e.g., parent/child categories).
   - Product & Variant Management: Support for core products, SKUs, rich attributes (dynamic key-value properties), and variant options (e.g., size, color).
   - Pricing & Media: Multi-currency or client-specific pricing rules, along with asset/image URL mappings.
   - Search & Filtering: Efficient pagination, sorting, and filtering options by category, attributes, or text search.
