# Technical Context: Analytics Service

## Technology Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js |
| Language | TypeScript |
| HTTP | `@core/api` |
| Database | PostgreSQL, `@core/db`, Knex |
| Messaging | `@core/message-queue` |
| Logging | `@core/log-client` |

## Project layout

```
apps/analytics/
├── database/
│   ├── migrations/
│   └── seeds/application.ts
├── memory-bank/
├── src/
│   ├── models/
│   │   ├── pool.ts
│   │   ├── application.type.ts    (planned)
│   │   └── application.model.ts   (planned)
│   ├── middleware/                (planned)
│   ├── routes/
│   ├── services/                    (planned)
│   ├── constants.ts
│   ├── index.ts
│   └── log-client.ts
├── knexfile.ts
└── env.example
```

## Environment variables

From `env.example`:

- **App**: `APP_ENV`, `APP_NAME`, `APP_PORT`, `APP_VERSION`, `APP_BUILD_NUMBER`, `DEBUG_MODE`
- **DB**: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE` (`core_analytics_latest`)
- **MQ**: `MQ_*`, `COMMON_MQ_*`
- **Logging**: `LOG_EXCHANGE`

Application middleware constants (when added): `APPLICATION_ID_HEADER`, excluded paths, secret header.

## Commands

```bash
npm run dev
npm run start:dev
npm run build
npm start
npm run eslint
npm run migrate:latest
npm run seed:run
npm run migrate:refresh
```

## Dependencies

- `@core/api`, `@core/db`, `@core/log-client`, `@core/message-queue`, `@core/utils`
- `dotenv`

## Integration

- **white-client**: similar `integrated_app` + `app-id` / JWT pattern elsewhere in monorepo
- **Logger**: RabbitMQ exchange from `LOG_EXCHANGE`
- **Seed client**: use seeded `uuid` + `secret_key` for local API calls

## Constraints

- Singular table names; soft delete via `deleted_at`
- No Knex imports in models
- ESLint max line length 100
- Do not auto-edit `memory-bank/feature/`
