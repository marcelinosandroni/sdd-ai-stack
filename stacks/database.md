# 🗄️ DATABASE

> Default: **Prisma ORM + PostgreSQL**. Access **always** lives inside
> `features/*/infrastructure/` or `shared/server/db.ts`.

## 🚨 Non-negotiable rules

1. **A query outside `infrastructure/` is FORBIDDEN.** The domain only knows the
   `I*Repository` interface.
2. **Explicit `select` on every query.** Never `findMany()` without a column filter.
   It leaks data and bloats the payload.
3. **Every query filtered by user filters by `userId`/`tenantId`.** Authorisation in
   the data, not in the UI.
4. **N+1 is forbidden.** Use a nested `include` or an explicit `Promise.all` map.
5. **A write touching 2+ tables = `prisma.$transaction`.** No exceptions.
6. **Migrations run via `npx prisma migrate dev --name <description>`** and are
   committed. **`db push` in production is FORBIDDEN.**
7. **Index every field used in a hot `where` or `orderBy`.** Before complaining about
   database performance, index it.

## 🧱 Where things live

```text
features/billing/
├── domain/IBillingRepository.ts     # pure contract (interface)
└── infrastructure/
    ├── billing-repository.ts        # implements the interface with Prisma
    └── billing.mapper.ts            # <Prisma row> <-> <domain entity>
```

## 🧩 Example

```ts
// infrastructure/billing-repository.ts
import "server-only";
import { db } from "@/shared/server/db";
import type { IBillingRepository } from "../domain/IBillingRepository";

export class PrismaBillingRepository implements IBillingRepository {
  async findActiveByUser(userId: string) {
    return db.subscription.findFirst({
      where: { userId, status: "ACTIVE" },   // ALWAYS filter by userId
      select: { id: true, planId: true, status: true, renewsAt: true },
    });
  }
}
```

## 🚫 Forbidden

| Pattern | Why | Do instead |
| --- | --- | --- |
| `db.x.findMany()` with no `select` | leaks data, bloats payload | always `select` |
| A query with no owner filter | cross-tenant leak | `where: { userId }` |
| `db` imported in a Server Component | breaks the slice boundary | via the feature's `queries.ts` |
| `db push` / `db seed` in prod | data loss | `migrate deploy` |
| Deeply nested `$transaction` | lock contention | flatten or batch |

## 🧪 Tests

- **Integration:** use a **real, separate database** (or SQLite/Mongo in-memory via an
  adapter). Mock the Prisma client only in unit tests.
- **Migrations:** run `migrate deploy` in the CI setup before integration tests.
