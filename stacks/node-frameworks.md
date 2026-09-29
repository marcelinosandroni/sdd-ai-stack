# 🟩 NODE FRAMEWORKS — Express / Fastify / Nest

> **Hexagonal spine:** [clean-code.md](./clean-code.md). Language: [javascript.md](./javascript.md).
> Pick ONE framework per service. Nest is a different paradigm from the other two —
> never mix them in one app.

---

## 🎯 Choosing

| | Express | Fastify | Nest |
| --- | --- | --- | --- |
| Philosophy | minimal, you wire it | performance-first, schema-first | opinionated DI + decorators |
| Validation | manual / zod | **native JSON Schema** | class-validator / zod |
| DI | manual container | `fastify-plugin` | built-in, the whole point |
| Best for | small, glue, edge | high throughput, typed | large teams, uniformity |
| Overhead | lowest | lowest | highest |

**Rule: the framework never reaches the domain.** Same rule in all three.

---

## 📂 Shared layout (works for all three)

```text
src/
├── domain/                 # pure. no express, no fastify, no nest
├── application/            # use cases
├── adapters/
│   ├── inbound/
│   │   ├── http/           # routes
│   │   └── consumers/      # queue
│   └── outbound/
│       ├── persistence/    # prisma, sql
│       └── brokers/
├── composition/            # builds the framework instance + container
└── main.ts
```

---

## 🚨 Rules common to all three

1. **`req`/`res`/`RequestContext` never reaches `application/`.** The route maps it to a
   plain input object.
2. **No business logic in a handler.** Handler = validate, map, call one use case, map
   the result to a response.
3. **One route file per resource.**
4. **Auth as middleware, authorisation in the use case.** Middleware cannot know the
   object being touched.
5. **Error mapping in ONE place.** Never try/catch in every handler. Register a global
   handler and throw typed domain errors.
6. **Validate at the edge, once, with a schema.** Inside, trust types.
7. **No `next()` in async handlers** unless the function is exactly 4 lines.
8. **Config from env, validated at boot** with Zod. Fail fast.
9. **Graceful shutdown**: `SIGTERM` closes the server, drains, then exits.
10. **`helmet` + CORS allowlist + rate limit** on every public service.

---

## ⚡ Fastify

**Use it when throughput or schema-first typing matters.** It is the best of the two
light options.

```ts
// schema IS the contract. Types are inferred. No duplication.
app.post("/invoices", {
  schema: {
    body: invoiceRequestSchema,          // zod or JSON Schema
    response: { 201: invoiceResponseSchema, 422: errorSchema },
  },
  handler: async (request, reply) => {
    const result = await createInvoice.execute(request.body);
    return reply.code(201).send(result);
  },
});
```

| Concern | Do |
| --- | --- |
| Plugins | `fastify-plugin` to break encapsulation deliberately |
| Serialization | JSON Schema drives it. Never `JSON.stringify` a domain object |
| Hooks | `onRequest` for auth, `preHandler` for validation, `onSend` for headers |
| Errors | `app.setErrorHandler` once. Throw typed errors |
| Schema reuse | `$ref` shared schemas, not copy-paste |
| `request.jwtVerify()` | Verify in `onRequest`, authorise in the use case |

---

## 🟠 Express

**Use it for small services and glue.** Express 5, always.

```ts
import express from "express";
import { z } from "zod";
import { errorHandler } from "./adapters/inbound/http/error-handler";

const app = express();
app.use(express.json({ limit: "1mb" }));

app.post(
  "/invoices",
  asyncHandler(async (req, res) => {
    const input = invoiceRequestSchema.parse(req.body);   // throws -> errorHandler
    const result = await createInvoice.execute(input);
    res.status(201).json(result);
  }),
);
```

**Express 5 forwards rejected promises.** No `asyncHandler` wrapper needed on 5+ — the
wrapper exists in most tutorials for Express 4. Check your major version before copying
a pattern.

| Concern | Do |
| --- | --- |
| Router | one `express.Router()` per resource, mounted once |
| Async errors | Express 5 auto-forwards. On 4, `asyncHandler` everywhere |
| Validation | Zod in the handler, or `zod` middleware. Not ad-hoc checks |
| Errors | one `errorHandler` last in the stack. `(err, req, res, next)` signature |
| `req` mutation | never attach a user to `req` in middleware, use `res.locals` or pass explicitly |

---

## 🏛 Nest — the odd one out

Nest's DI + decorators are the entire value proposition. Using it *without* them is
worse than Express.

**Structure that keeps the domain clean:**

```ts
// domain — no Nest import, ever
export class Invoice {
  constructor(readonly id: string, readonly lines: Line[]) {
    if (lines.length === 0) throw new InvalidInvoice();
  }
}
```

```ts
// application — no Nest import
@Injectable()            // decorator, no framework types needed
export class CreateInvoice {
  constructor(private readonly repository: InvoiceRepository) {}

  async execute(input: CreateInvoiceInput): Promise<Result<Invoice>> {
    const invoice = new Invoice(input.id, input.lines);
    await this.repository.save(invoice);
    return { ok: true, value: invoice };
  }
}
```

| Concern | Do | Never |
| --- | --- | --- |
| Modules | one per feature. `imports` explicit, never `exports: [barrel]` | a `SharedModule` everyone imports |
| Injection | constructor only, by class token | `@Inject('TOKEN')` stringly-typed everywhere |
| DTOs | classes with validation decorators, in `dto/` | reusing domain entities as DTOs |
| Providers | `useFactory` in the composition module for external clients | `new` inside a service |
| Entities | TypeORM entities must not be in `domain/` | `@Entity` on a domain class |
| Guards | role checks coarse-grained at the edge | guard as the only authorisation |
| Circular deps | `forwardRef()` is a design smell, not a fix | a `CommonModule` import graph |
| Microservices | only if you need them; prefer a plain worker | a second HTTP API inside |

**Nest rule:** every module must be importable in a test **without** `Test.createTestingModule`
for the domain and application layers. If you need it there, the layer is coupled.

---

## 🧪 Testing

| Layer | Express/Fastify | Nest |
| --- | --- | --- |
| Domain + use case | Vitest, plain | Vitest, plain, **no `Test` module** |
| Route contract | Supertest against a real app instance | Supertest, or `TestingModule` for the HTTP layer only |
| Container | build the real container | `Test.createTestingModule` with fakes |
| Repositories | Testcontainers | Testcontainers |

**Both:** test the real wiring for the inbound layer. Wiring bugs are wiring bugs and a
unit test with a fake container will never see them.

---

## 🚫 Smells specific to Node frameworks

| Smell | Fix |
| --- | --- |
| Business logic in the handler | call a use case |
| `req` passed into the use case | map to a plain input |
| `try/catch` in every route | one error handler |
| `SharedModule` (Nest) | one module per feature |
| `forwardRef` everywhere | extract the shared piece |
| Mongoose model as the domain entity | separate persistence model |
| Service locator / `req.container` | constructor injection |
| Middleware doing authorisation | authorisation in the use case, with the object |
| Missing graceful shutdown | handle `SIGTERM` |

---

## 📎 Commands

```bash
node --run typecheck
node --run test
node --run build
node --run start
```
