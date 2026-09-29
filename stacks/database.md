# 🗄️ DATABASE

> Padrão: **Prisma ORM + PostgreSQL**. Acesso **sempre** dentro de `features/*/infrastructure/` ou `shared/server/db.ts`.

## 🚨 Regras não-negociáveis

1. **Query fora de `infrastructure/` é PROIBIDA.** O domínio só conhece a interface `I*Repository`.
2. **`select` explícito em toda query.** Nunca `findMany()` sem filtro de colunas. Vaza dado e pesa payload.
3. **Toda query que filtra por usuário filtra por `userId`/`tenantId`.** Autorização no dado, não na UI.
4. **N+1 é proibido.** Use `include` aninhado ou `Promise.all` com mapa explícito.
5. **Escrita que precisa de 2+ tabelas = `prisma.$transaction`.** Sem exceções.
6. **Migration é feita via `npx prisma migrate dev --name <descricao>`** e vai pro repo. **Proibido `db push` em produção.**
7. **Índice todo campo usado em `where` ou `orderBy` quente.** Antes de reclamar de performance no banco, indexa.

## 🧱 Onde fica o quê

```text
features/billing/
├── domain/IBillingRepository.ts     # contrato puro (interface)
└── infrastructure/
    ├── billing-repository.ts        # implementa a interface com Prisma
    └── billing.mapper.ts            # <row do Prisma> <-> <entidade de domínio>
```

## 🧩 Exemplo

```ts
// infrastructure/billing-repository.ts
import "server-only";
import { db } from "@/shared/server/db";
import type { IBillingRepository } from "../domain/IBillingRepository";

export class PrismaBillingRepository implements IBillingRepository {
  async findActiveByUser(userId: string) {
    return db.subscription.findFirst({
      where: { userId, status: "ACTIVE" },   // SEMPRE filtra por userId
      select: { id: true, planId: true, status: true, renewsAt: true },
    });
  }
}
```

## 🚫 Proibido

| Padrão | Por quê | Faça |
| --- | --- | --- |
| `db.x.findMany()` sem `select` | Vaza dado, pesa payload | Sempre `select` |
| Query sem filtro de dono | Vazamento entre tenants | `where: { userId }` |
| `db` importado em Server Component direto | Quebra o slice | via `queries.ts` do feature |
| `db push` / `db seed` em prod | perde dado | `migrate deploy` |
| `$transaction` aninhado profundo | lock demais | achatar /Batch |

## 🧪 Testes

- **Integração:** use **banco de verdade separado** (ou SQLite/Mongo in-memory via adapter). Mock do client Prisma só em unit.
- **Migrations:** rode `migrate deploy` no setup do CI antes dos testes de integração.
