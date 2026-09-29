# 🟨 JAVASCRIPT / TYPESCRIPT

> **Hexagonal spine:** [clean-code.md](./clean-code.md). This file maps it.
> Node frameworks: [node-frameworks.md](./node-frameworks.md). Next.js: [next.md](./next.md).

---

## 🎯 Versions

| Piece | Version |
| --- | --- |
| TypeScript | 5.9+ (`satisfies`, `const` type params) |
| Runtime | Node 22 LTS |
| Module | ESM (`"type": "module"`). CJS only for legacy |
| Build | `tsc` (types) + esbuild/tsdown (bundle) |
| Test | Vitest |
| Lint | Biome or ESLint flat config. Pick one |

> **`tsconfig` non-negotiables:** `strict`, `noUncheckedIndexedAccess`,
> `verbatimModuleSyntax`, `exactOptionalPropertyTypes`. See [typescript.md](./typescript.md).

---

## 📂 Layout

```text
src/
├── billing/
│   ├── domain/            # entity.ts, money.ts, invoice-repository.ts (interface)
│   ├── application/       # create-invoice.ts
│   ├── adapters/
│   │   ├── inbound/       # routes, consumers
│   │   └── outbound/      # prisma-invoice-repository.ts, http-client.ts
│   └── ui/                # components (framework-dependent)
├── shared/
│   ├── result.ts          # Result<T, E> type
│   ├── money.ts
│   └── server/            # server-only
└── composition/           # the only place that constructs adapters
```

**One resource per file.** `kebab-case.ts` for multi-word. No `index.ts` barrels that
hide imports and slow builds.

---

## 🚨 Rules

1. **`unknown` over `any`.** `any` is banned. Narrow with a guard.
2. **No non-null assertion `!`.** It is a runtime crash in disguise.
3. **Discriminated unions over optional fields.** `type Result<T, E>` beats
   `{ data?: T; error?: E }`.
4. **`satisfies` for config objects** — checks shape without widening to `string`.
5. **Schema at the boundary.** Zod in, typed object out. Never pass `unknown` inward.
6. **Prefer `Map`/`Set`** over object-as-dictionary. And `Object.create(null)` or `Map`
   over `{}` for arbitrary keys.
7. **No class hierarchy for DTOs.** Plain objects + types.
8. **Immutability by default.** `readonly`, `Object.freeze` at the boundary, spread
   instead of `Object.assign` mutation.
9. **`type` for unions, `interface` for object contracts.** Consistent.
10. **No barrel files in hot paths.** Import the module directly.
11. **`export default` only for a single public entry.** Named exports everywhere else.
12. **Never mutate a prop.** Copy and derive.
13. **No `for...in`.** `Object.keys` / `Object.entries` / `for...of`.
14. **Async: `Promise.all` for parallel, `for...of` + `await` when order matters.** Never
    `await` inside `forEach`.

---

## 💰 Money, dates, ids — never primitives

Three bugs that will happen with raw primitives:

```ts
// WRONG: cents and dollars mix. floats lose precision.
const total = price * quantity;

// RIGHT: integer minor units, or a value object
interface Money {
  readonly amountMinor: number;   // integer. never float
  readonly currency: Currency;
}
function addMoney(a: Money, b: Money): Money {
  assert(a.currency === b.currency, "currency mismatch");
  return { amountMinor: a.amountMinor + b.amountMinor, currency: a.currency };
}
```

```ts
// WRONG: implicit local time. Off-by-one-day bugs forever.
const today = new Date();

// RIGHT: UTC by default, clock injected in domain code
const clock = { now: () => new Date() };
const iso = new Date(clock.now()).toISOString().slice(0, 10);
```

**Rule:** ids are branded types, not `string`.

```ts
type Brand<T, B extends string> = T & { readonly __brand: B };
type InvoiceId = Brand<string, "InvoiceId">;
```

A plain `string` cannot be passed where an `InvoiceId` is expected. The compiler finds
the mix-up before production does.

---

## 🧪 Testing

| Layer | Tool | Mocks |
| --- | --- | --- |
| Domain | Vitest, plain | none |
| Use case | Vitest + hand-written fake | none |
| Adapter | Testcontainers (real Postgres) | real |
| Contract | Vitest + Supertest / fetch | — |

```ts
import { describe, it, expect } from "vitest";
import { CreateInvoice } from "@/billing/application/create-invoice";
import { InMemoryInvoiceRepository } from "@/billing/adapters/outbound/in-memory-invoice-repository";

describe("CreateInvoice", () => {
  it("rejects an invoice with no lines", async () => {
    const repository = new InMemoryInvoiceRepository();
    const useCase = new CreateInvoice(repository, fixedClock);

    const result = await useCase.execute({ invoiceId: "id-1", lines: [] });

    expect(result.ok).toBe(false);
    expect(repository.saved).toHaveLength(0);
  });
});
```

**No `vi.mock` of your own code.** If a unit test needs it, the dependency is inverted
wrong. Mock third-party boundaries only, and prefer MSW over mocking `fetch`.

---

## 🚫 Smells specific to JS/TS

| Smell | Fix |
| --- | --- |
| `any` | `unknown` + a type guard |
| `!` assertion | optional chaining + early return |
| `interface X extends Y, Z` | composition over deep inheritance |
| `Object.assign` mutation | spread |
| `utils.ts` | one file per function, named by action |
| Callback in a `forEach` | `for...of` + await |
| Deeply nested `if` | guard clauses |
| Two booleans as parameters | a state enum / discriminated union |
| Barrel `index.ts` everywhere | direct imports |
| `JSON.parse` without validation | schema parse |
| Global mutable config | injected |

---

## 📎 Commands

```bash
tsc --noEmit
vitest run
vitest --coverage
biome check .
npx madge --circular src/     # dependency cycles
```
