# Technical Context: Cart Service

## Technology Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js `v24.19.0` (`.node-version`); Docker `node:24.11.0-alpine` |
| Language | TypeScript |
| HTTP | `xpref` |
| Database | PostgreSQL, `knexify` |
| Messaging | `@core/message-queue` |
| Logging | `@core/log-client` |
| Tests | Jest |
| Lint | ESLint (`eslint.config.mjs`) |

## Project layout

```
apps/cart/
├── database/
│   ├── migrations/             (application, cart, cart_item)
│   └── seeds/                  (one cart tenant)
├── memory-bank/
│   ├── feature/                (user-owned; do not auto-edit)
│   ├── projectbrief.md
│   ├── productContext.md
│   ├── systemPatterns.md
│   ├── techContext.md
│   ├── activeContext.md
│   └── progress.md
├── src/
│   ├── application/            — tenant CRUD
│   ├── middleware/             — validateApplication interceptor
│   ├── models/
│   │   ├── pool.ts
│   │   ├── application.model.ts
│   │   ├── cart.model.ts
│   │   ├── cart-item.model.ts
│   │   ├── common.type.ts
│   │   └── test.model.ts
│   ├── routes/
│   │   ├── index.ts
│   │   └── test.route.ts
│   ├── cart/                   — session CRUD, merge on login
│   ├── cart-item/              (planned)
│   ├── jobs/                   (planned)
│   ├── utils/                  (planned)
│   ├── constants.ts
│   ├── config.ts
│   ├── index.ts
│   └── log-client.ts
├── knexfile.ts
├── env.example
├── Dockerfile
└── package.json
```

## Environment variables

From `env.example`:

- **App**: `APP_ENV`, `APP_NAME`, `APP_PORT`, `APP_VERSION`,
  `APP_BUILD_NUMBER`, `DEBUG_MODE`
- **DB write**: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`
  (`common_cart`)
- **DB read**: `DB_READ_HOST`, `DB_READ_PORT`
- **MQ (internal)**: `MQ_HOST`, `MQ_PORT`, `MQ_USER`, `MQ_PASSWORD`
- **MQ (common)**: `COMMON_MQ_HOST`, `COMMON_MQ_PORT`, `COMMON_MQ_USER`,
  `COMMON_MQ_PASSWORD`
- **Logging**: `LOG_EXCHANGE` (`logger-service`)

Required vars used in `src/constants.ts` throw from `getEnv` when missing.
`APP_VERSION` and `APP_BUILD_NUMBER` are in `env.example` only.

## Commands

```bash
npm run dev
npm run start:dev
npm run build
npm start
npm test
npm run test:dev
npm run eslint
npm run migrate:latest
npm run migrate:fresh
npm run migrate:refresh
npm run seed:run
```

Monorepo root scripts proxy the same commands to
`@common_services/cart`.

## Dependencies

- `xpref`, `knexify`
- `@core/log-client`, `@core/message-queue`, `@core/utils`
- `dotenv`

`tsconfig.json` project references: `message-queue`, `log-client`, `utils`.

## Integration

- **Logger**: RabbitMQ exchange from `LOG_EXCHANGE`
- **PostgreSQL**: write and read hosts; knexify pool in `src/models/pool.ts`
- **Docker**: build from monorepo root; `./bin/init apps/cart`

## Constraints

- Singular table names; soft delete via `deleted_at`
- No Knex imports in models
- ESLint max line length 100
- Promise/then only; no `Promise.all`
- Do not auto-edit `memory-bank/feature/`
