# 🟢 NODE.JS (complemento)

> **Stack padrão é Next.js** ([NEXT.md](./NEXT.md)). Node.js puro entra **só** quando o App Router não dá conta.
> Vertical Slices, igual. Sem MVC. Foco no domínio.

## 🤔 Quando usar Node.js puro (e quando NÃO)

| ✅ USE Node.js | ❌ NÃO USE — use Next.js |
| --- | --- |
| Worker de fila (processa job em background) | API/rota/mutação de UI |
| Cron / scheduler | Server Action |
| Consumer de webhook pesado / alto volume | Route Handler em `app/api` |
| CLI de batch / script de importação | Script pontual |
| Processamento longo que não pode segurar request | Qualquer coisa que responde a request |
| Processo de streaming de IA de longa duração | AI SDK dentro de Server Action |

> **Heurística:** "isso roda porque alguém clicou num botão?" → Next.js. "isso roda porque o relógio tocou / a fila encheu?" → Node.js.

## 📂 ESTRUTURA

```text
server/                 (ou worker/, jobs/)
├── main.ts              # Entry point: boot, graceful shutdown
├── api/                 # Só se precisar HTTP (Fastify/Hono). Vazamento controlado.
├── core/                # Config, logger, erros, DI, conexão de DB
└── features/            # 🌟 MESMA estrutura do Next (vertical slices)
    └── billing/
        ├── domain/
        ├── application/
        └── infrastructure/
```

## 🧠 REGRAS

1. **Desacoplamento:** o use case NUNCA recebe `req`/`res`. Recebe dados puros, retorna dados puros.
2. **Isolamento:** uma `feature` não importa a outra. Compartilhe via `core/` ou extraia para um novo slice.
3. **Contrato na entrada:** worker/cron entra por uma **porta de entrada** com payload validado por Zod. Mesma lei das Server Actions ([NEXT.md](./NEXT.md) §5).
4. **Ordem fixa:** `auth/escopo → validação → autorização → lógica → I/O`.
5. **Idempotência:** job de fila pode rodar duas vezes. Use chave de idempotência.
6. **Retry com backoff exponencial** em falha transitória. **Dead-letter queue** em falha permanente.
7. **Graceful shutdown:** pegue `SIGTERM`, feche servidor e conexões antes de sair.
8. **Uma responsabilidade por processo.** Worker e API no mesmo processo = dívida.

## 💻 EXEMPLO: use case puro

```typescript
// features/billing/application/ProcessInvoice.ts
import type { IInvoiceRepository } from "../domain/IInvoiceRepository";
import { z } from "zod";

export const ProcessInvoiceInput = z.object({
  invoiceId: z.string().min(1),
  idempotencyKey: z.string().min(8),
});

export class ProcessInvoice {
  constructor(private readonly repo: IInvoiceRepository) {}

  async execute(raw: unknown) {
    const input = ProcessInvoiceInput.parse(raw);   // 1. valida na fronteira
    const invoice = await this.repo.findById(input.invoiceId);
    if (!invoice) throw new Error("INVOICE_NOT_FOUND");

    if (await this.repo.wasProcessed(input.idempotencyKey)) {
      return { status: "skipped" as const };        // 2. idempotência
    }

    const total = invoice.lines.reduce((sum, l) => sum + l.amount, 0);
    await this.repo.markProcessed(input.idempotencyKey, total);
    return { status: "processed" as const, total };  // 3. efeito
  }
}
```

## ▶️ Boot de worker

```typescript
// main.ts
import { logger } from "./core/logger";
import { createBillingUseCases } from "./features/billing/container";

process.on("SIGTERM", async () => {
  logger.info("shutdown signal");
  await closeDb();
  process.exit(0);
});

const billing = createBillingUseCases();
logger.info("worker online", { version: process.env.npm_package_version });
```

## 🧪 Testes

- Use case = unit test com repositório falso. Zero mock de infra.
- Integração: teste contra o broker real em container de teste.
- **Obrigatório:** cenário de "processa 2×" (idempotência) e "falha no meio do job".

## 🚫 Proibido

| Padrão | Por quê |
| --- | --- |
| Express/Fastify como default | App Router já é a API |
| `setInterval` para job crítico | Use cron/queue real |
| `process.exit()` no meio de job | Graceful shutdown |
| `any` no payload | Zod na fronteira |
| Segredo em log | Redact obrigatório |
| lógica de negócio no handler HTTP | Vai pro `application/` |
