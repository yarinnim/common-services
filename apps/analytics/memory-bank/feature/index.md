# Analytics Service

Analytics is the Analytics hub which allow the analytics request from each integrated application.
The application need to be registered with the analytics service. Each request from application,
need to be verified and validated my the middleware against Application ID (uuid) and its
Secret key.

Analytics get the request log information sent from Logger Service and store into analytics
database table. It uses two seperated two kind of databases (PostgreSQL and ClickHouse).
All the analytics is located in the Clickhouse database.

## Application

The integrated application that has its data in the analytics services. The application
must be available in the Logger Service or reflects to a specific service in the
Logger Service.