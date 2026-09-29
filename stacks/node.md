# 🟢 NODE.JS (complement)

> **The default stack is Next.js** ([next.md](./next.md)). Plain Node.js enters **only**
> when the App Router is not enough.
> Spine: [clean-code.md](./clean-code.md) + [architecture.md](./architecture.md).
> Vertical slices, as everywhere. No MVC. Total focus on the domain.

## 🤔 When to use plain Node.js (and when NOT to)

| ✅ USE Node.js | ❌ DON'T USE — use Next.js |
| --- | --- |
| Queue worker (processes a job in the background) | API / route / UI mutation |
| Cron / scheduler | Server Action |
| Heavy or high-volume webhook consumer | Route Handler in `app/api` |
| Batch CLI / import script | One-off script |
| Long processing that must not hold a request | Anything that answers a request |
| Long-running AI streaming process | AI SDK inside a Server Action |

> **Heuristic:** "does this run because someone clicked a button?" → Next.js.
> "Does this run because the clock ticked / the queue filled?" → Node.js.

## 📂 STRUCTURE

```text
server/                 (or worker/, jobs/)
├── main.ts              # Entry point: boot, graceful shutdown
├── api/                 # Only if you need HTTP (Fastify/Hono). Controlled leak.
├── core/                # Config, logger, errors, DI, DB connection
└── features/            # 🌟 SAME structure as Next (vertical slices)
    └── billing/
        ├── domain/
        ├── application/
        └── infrastructure/
```

## 🧠 RULES

1. **Decoupling:** a use case NEVER receives `req` or `res`. It takes plain data and
   returns plain data.
2. **Isolation:** a feature never imports another feature. Share via `core/`, or
   extract a new slice.
3. **Contract at the entrance:** a worker/cron enters through an **entry port** with a
   Zod-validated payload. Same law as Server Actions ([next.md](./next.md) §5).
4. **Fixed order:** `auth/scope → validation → authorization → logic → I/O`.
5. **Idempotency:** a queued job may run twice. Use an idempotency key.
6. **Retry with exponential backoff** on transient failure. **Dead-letter queue** on
   permanent failure.
7. **Graceful shutdown:** catch `SIGTERM`, close the server and the connections before
   exiting.
8. **One responsibility per process.** Worker and API in the same process is debt.

## 💻 EXAMPLE: a pure use case

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
    const input = ProcessInvoiceInput.parse(raw);   // 1. validate at the boundary
    const invoice = await this.repo.findById(input.invoiceId);
    if (!invoice) throw new Error("INVOICE_NOT_FOUND");

    if (await this.repo.wasProcessed(input.idempotencyKey)) {
      return { status: "skipped" as const };        // 2. idempotency
    }

    const total = invoice.lines.reduce((sum, l) => sum + l.amount, 0);
    await this.repo.markProcessed(input.idempotencyKey, total);
    return { status: "processed" as const, total };  // 3. effect
  }
}
```

## ▶️ WORKER BOOT

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

## 🧪 TESTS

- Use case = unit test with a fake repository. Zero infra mocks.
- Integration: run against a real broker in a test container.
- **Mandatory:** the "processes twice" (idempotency) scenario and "fails mid-job".

## 🚫 FORBIDDEN

| Pattern | Why |
| --- | --- |
| Express/Fastify as the default | The App Router already is the API |
| `setInterval` for critical jobs | Use a real cron/queue |
| `process.exit()` in the middle of a job | Graceful shutdown |
| `any` in the payload | Zod at the boundary |
| Secrets in logs | Redaction is mandatory |
| Business logic in the HTTP handler | It goes in `application/` |
