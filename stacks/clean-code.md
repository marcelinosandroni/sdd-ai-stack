# 🧹 CLEAN CODE & ARCHITECTURE

> **Spine of every stack rule.** Read once, applies to all languages.
> Compressed on purpose. Same meaning, fewer tokens.

---

## 🎯 Goal

Change one thing without reading the whole repo. Each file one reason to change.
Test without infra. Swap infra without touching business.

---

## 1. SRP — one reason to change

**One file = one resource/feature/use case/component. Never two.**

| Wrong | Right |
| --- | --- |
| `UserService.ts` has login + register + delete | `CreateUser.ts`, `LoginUser.ts`, `DeleteUser.ts` |
| `OrderController` has 40 endpoints | one controller per resource, one action per use case |
| `helpers.ts` with 200 functions | `FormatCurrency.ts`, `ParseDate.ts`, one each |
| `utils.ts`, `common.ts`, `misc.ts` | named by what it does |

Test: ask "what is the one reason this file changes?" If >1 answer, split.

---

## 2. SOLID

| Principle | Rule | Smell when broken |
| --- | --- | --- |
| **S**ingle Responsibility | One reason to change per file | Name needs "and" ("UserAndOrderService") |
| **O**pen/Closed | Extend by adding, never by editing switch/map | New type = edit existing `switch` |
| **L**iskov Substitution | Subtype usable anywhere base is | Subtype throws "not supported" |
| **I**nterface Segregation | Small contracts. Split fat ones | Caller implements 12 methods, uses 1 |
| **D**ependency Inversion | Business depends on abstractions, not frameworks | `domain/` imports Spring, Prisma, Express |

**Hardest, most valuable: DIP.** Business code must run with no framework installed.

---

## 3. Separation of concerns

Each layer does one job. Layer knows only the one below it.

```text
adapters/inbound   controllers, CLI, queue consumers, HTTP routes
        ↓
application/       use cases, orchestration, transactions
        ↓
domain/            entities, value objects, domain rules, repository INTERFACES
        ↑
adapters/outbound  DB, HTTP clients, brokers, storage, clock
```

**Rules**
1. `domain/` imports nothing external. Zero. Not even a logger.
2. `application/` imports only `domain/`. No framework.
3. Adapters implement interfaces declared inside.
4. Wiring (DI) lives in one composition root. Nowhere else instantiates adapters.
5. Cross-module call: interface in the consumer, adapter in the provider. Never the reverse.

---

## 4. Hexagonal (ports & adapters)

**Default architecture. Use when it scales — which is always.**

```text
src/
├── domain/                  # pure. no framework, no IO
│   ├── entities/
│   ├── value-objects/
│   ├── services/           # domain services (logic not belonging to one entity)
│   ├── events/
│   └── repositories/       # INTERFACES only
├── application/
│   ├── use-cases/          # one file per use case
│   ├── ports/              # interfaces for outbound needs (Clock, Mailer, Queue)
│   └── dto/
├── adapters/
│   ├── inbound/            # http/, cli/, consumers/
│   └── outbound/           # persistence/, http/, brokers/, clock/
└── composition/            # the only place that knows concrete classes
```

**Dependency rule:** arrows point inward only. `domain` never imports `adapters`.

**When hexagonal is too much:** prototype, script, tiny CRUD. Then use
`src/features/<x>/{domain,application,infrastructure,ui}` — same inward arrow, fewer
files. Do NOT abandon the arrow.

---

## 5. Design patterns — use when the pain is real

Pattern costs indirection. Add on second occurrence, never on first.

| Pain | Pattern | Where |
| --- | --- | --- |
| Repeating `if type ===` | **Strategy** | one file per algorithm, same interface |
| Wrapper adding cross-cutting | **Decorator** | auth, cache, retry, logging |
| Complex object construction | **Factory** / **Builder** | when ctor has >5 params or optional steps |
| External system with a bad API | **Adapter** | `adapters/outbound/` |
| Global mutable state | **Unit of Work** | one transaction per use case |
| Events across modules | **Domain Event** | publish in domain, subscribe in adapters |
| Optional feature variants | **Strategy + DI** | not `if (mode === ...)` chains |

**Anti-pattern use:** "enterprise" layers that only forward calls. A `Service` that
calls a `Repository` that calls a `Dao` that calls SQL = 3 files, 0 value.

---

## 6. Code smells — refuse them in review

| Smell | Fix |
| --- | --- |
| Feature envy | move method to the class that owns the data |
| Long parameter list | group into an input object / options struct |
| Primitive obsession | value object: `Email`, `Money`, `UserId` |
| Shotgun surgery | one change touching 8 files = missing abstraction |
| Divergent change | class edited for unrelated reasons → split |
| Data clumps | same 4 fields travelling together → one type |
| Null everywhere | `Optional` / `Result` / explicit error type |
| Boolean blindness | two booleans means a missing state enum |
| Commented-out code | git has it. delete it. |
| Dead code | delete it. CI with coverage finds it. |
| `Manager` / `Helper` / `Util` name | name by what it does |
| Base class "for reuse" | prefer composition |

---

## 7. Naming

- Name says **what**, not **how**. `OrderPrice`, not `OrderUtilsv2`.
- No abbreviations. Tokenizer splits them anyway, reader still decodes. `configuration` beats `cfg`.
- No type suffix: `User`, not `UserDTO` (unless it crosses a wire).
- Domain words from the business, not the DB: `customer`, not `tbl_user`.
- One term per concept. Never rotate synonyms.

---

## 8. Errors

- Never `throw new Error("...")` for expected failure. Use a typed error / Result.
- Error message states **what failed and why**, not what to do about it.
- Validate at the boundary, once, with a schema. Inside the code, trust types.
- No `catch (e) {}`. No bare `catch`. Log with context, rethrow or map to a result.

---

## 9. Comments

- Comment the **why**, never the what. Code says what.
- Delete commented-out code.
- `TODO` needs an owner + an issue link, or it does not get committed.

---

## 10. Testing shape (from the dependency rule)

```text
domain/       pure value objects     → unit test, no mocks
application/  use case + fake port   → unit test, no mocks
adapters/     integration with real  → integration test
inbound/      HTTP/route contract    → E2E
```

If a use-case unit test needs a mock framework, the dependency rule is broken.

---

## 11. The review checklist

Before `[x]`, all must be true:

- [ ] Every file has exactly one reason to change
- [ ] `domain/` has zero external imports
- [ ] No new `if type ===` chain (Strategy instead)
- [ ] No `Util`/`Helper`/`Manager` class
- [ ] No `any`, no non-null assertion, no ignored error
- [ ] No public field mutated from outside
- [ ] New code covered by a test that runs without infrastructure
- [ ] 100 lines/file and 4 params/function as warning thresholds

---

## 📎 Per-stack rules

| Stack | File |
| --- | --- |
| Java (Spring Boot, Quarkus) | [java.md](./java.md) |
| C# / .NET | [dotnet.md](./dotnet.md) |
| Go | [go.md](./go.md) |
| Python (Django, FastAPI) | [python.md](./python.md) |
| JavaScript / TypeScript | [javascript.md](./javascript.md) |
| Node frameworks (Express, Fastify, Nest) | [node-frameworks.md](./node-frameworks.md) |
| Angular | [angular.md](./angular.md) |
| Vue | [vue.md](./vue.md) |
| Svelte | [svelte.md](./svelte.md) |
| Next.js 16 | [next.md](./next.md) |
