# Wallet Movement API

NestJS API that processes movement webhooks with clean architecture, clear error handling, and PostgreSQL persistence.

## Architecture

```
src/
├── shared/                          # Global modules (Prisma)
│   ├── prisma.service.ts
│   └── shared.module.ts
├── wallet/
│   ├── domain/                      # Business entities, enums, repository interfaces
│   │   ├── entities/
│   │   │   ├── movement.entity.ts
│   │   │   ├── wallet-balance.entity.ts
│   │   │   ├── company-balance.entity.ts
│   │   │   └── webhook-event.entity.ts
│   │   ├── enums/
│   │   │   ├── movement-status.enum.ts
│   │   │   └── movement-type.enum.ts
│   │   └── repositories/           # Abstract repository contracts
│   ├── application/                 # Use cases and DTOs
│   │   ├── dto/
│   │   │   ├── create-movement.dto.ts
│   │   │   └── webhook-event.dto.ts
│   │   └── use-cases/
│   │       ├── create-movement.use-case.ts
│   │       ├── process-webhook.use-case.ts
│   │       ├── get-movement.use-case.ts
│   │       ├── get-wallet-balance.use-case.ts
│   │       └── get-company-balance.use-case.ts
│   ├── infrastructure/             # Prisma repository implementations
│   │   └── repositories/
│   │       ├── prisma-movement.repository.ts
│   │       ├── prisma-wallet-balance.repository.ts
│   │       ├── prisma-company-balance.repository.ts
│   │       └── prisma-webhook-event.repository.ts
│   └── interfaces/                 # HTTP controllers
│       └── wallet.controller.ts
└── main.ts
```

**Clean Architecture layers:**
- **Domain**: Pure entities with business logic (status transitions, balance ops), enums, and abstract repository contracts.
- **Application**: Use cases orchestrate domain logic. DTOs with `class-validator` handle input validation.
- **Infrastructure**: Prisma implementations of repository interfaces (easily swappable).
- **Interfaces**: NestJS controllers expose HTTP endpoints.

## Setup

### Prerequisites

- Node.js 18+
- pnpm
- Docker (para la base de datos)

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Configurar entorno

Renombra `.env.example` a `.env`. El archivo ya contiene la cadena de conexión que apunta al contenedor Docker:

```bash
mv .env.example .env
```

> No necesitas modificar nada, los valores por defecto coinciden con el `docker-compose`.

### 3. Levantar la base de datos

```bash
docker compose -f docker/docker-compose.yml up -d
```

### 4. Ejecutar migraciones

```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Iniciar la aplicación

```bash
# Desarrollo
pnpm start:dev

# Producción
pnpm build
pnpm start:prod
```

### Tests

```bash
pnpm test
```

## Endpoints

### POST /wallet-movements
Create a new movement. Validates:
- Status must be `CREATED`
- First movement for a wallet must be `DEPOSIT`
- `DEBIT`/`FORCE_DEBIT` require sufficient balance

```json
{
  "id": "mov-dep-complete-001",
  "userId": "usr-001",
  "walletId": "wal-001",
  "type": "DEPOSIT",
  "amount": 120,
  "cost": 1,
  "status": "CREATED"
}
```

### POST /wallet-movements/webhook
Process movement update events (idempotent by `eventId`). Validates status transitions. Applies balance effects only on `COMPLETED`.

```json
{
  "eventId": "evt-dep-complete-001",
  "movementId": "mov-dep-complete-001",
  "type": "DEPOSIT",
  "amount": 120,
  "cost": 1,
  "status": "COMPLETED",
  "processedAt": "2026-02-26T12:02:00Z",
  "reason": null
}
```

### GET /wallet-movements/:id
Retrieve a movement by ID.

### GET /wallet-balances/:walletId
Retrieve wallet balance.

### GET /company-balance
Retrieve total company income from fees.

## Business Rules

| Rule | Detail |
|------|--------|
| **Idempotency** | Webhook processing is idempotent by `eventId` |
| **Status transitions** | `CREATED → COMPLETED` or `CREATED → FAILED` only |
| **Balance effects** | Applied only when movement reaches `COMPLETED` |
| **DEPOSIT fee** | Fixed $1 USD |
| **DEBIT fee** | 1% of amount |
| **FORCE_DEBIT fee** | 1% of amount |
| **First movement** | Must be `DEPOSIT` for each wallet |
| **Insufficient balance** | `DEBIT`/`FORCE_DEBIT` blocked at creation time |

## Design Decisions

- **Abstract repository classes** instead of interfaces for DI compatibility with NestJS — allows `useClass` provider binding.
- **In-memory repositories** in `test/helpers/` for unit testing without database dependency.
- **Company balance** uses a singleton row pattern (`id = "singleton"`) — simple and effective for single-company scope.
- **Webhook events** stored separately for traceability and idempotency check, with flexible `movementId` reference (not rigid FK) to allow future N:1 mapping.
- **Movement effects** (balance updates) only applied at `COMPLETED` status — `CREATED` is a reservation only.
- **`class-validator`** used for DTO validation with `ValidationPipe` globally configured.
- **Prisma v7 with driver adapter** (`@prisma/adapter-pg` + `pg`) for PostgreSQL — required by Prisma v7 instead of the legacy `datasourceUrl` pattern.
- **CommonJS module system** (`module: "commonjs"` in tsconfig) for full NestJS + Prisma v7 compatibility.
