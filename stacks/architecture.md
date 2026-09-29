# 🏗 ARCHITECTURE

> The spine in [clean-code.md](./clean-code.md) §3–4, plus the folder conventions.
> Read once. Applies to every language.

---

## 1. Feature-first, never layer-first

**Layer-first folders** (`controllers/`, `services/`, `models/`) force one change to touch
three folders and hide the business. Rejected.

```text
✅ features/billing/     one folder per domain, everything inside
❌ controllers/ services/ models/
```

Test: "where is invoice cancellation?" Layer-first: grep 3 dirs. Feature-first: open 1.

---

## 2. The slice

```text
src/features/<domain>/
├── domain/                  # pure. zero external imports
│   ├── <entity>.ts
│   ├── <value-object>.ts
│   ├── <domain-service>.ts  # logic that spans entities
│   └── <entity>-repository.ts   # INTERFACE
├── application/
│   └── <verb>-<noun>.ts     # ONE use case per file
├── adapters/
│   ├── inbound/  <verb>-<noun>.route.ts
│   └── outbound/ <entity>-repository.<tech>.ts
└── ui/                       # components (if any)
```

Naming: file named after the **verb + noun** of the use case. `create-invoice.ts`,
`cancel-subscription.ts`. A file named `invoice-service.ts` with 12 methods fails §1.

---

## 3. Dependency rule

```text
inbound adapters ──► application ──► domain ◄── outbound adapters
                                        ▲
                                  (interfaces live here)
```

**Arrows point inward. Always.**

| Layer | May import | Must NOT import |
| --- | --- | --- |
| `domain/` | nothing external | framework, ORM, HTTP, logger, config |
| `application/` | `domain/` | framework, ORM, HTTP client |
| `adapters/` | `application/`, `domain/` | each other directly |
| `composition/` | everything | — (it is the only place that knows concretes) |

Check it in CI. Anything that violates it is a bug, not a style choice.

---

## 4. Composition root

One file (or module) that constructs concrete adapters and injects them. Rules:

1. It is the **only** place that does `new` on an adapter.
2. No business logic, ever.
3. One per deployable (api, worker, cli, cron).
4. A use-case unit test constructs its fakes directly and never touches it.

---

## 5. Cross-module communication

```text
❌ features/billing imports features/invoice        → direct coupling, cycle risk
✅ billing declares the port it needs
✅ invoice implements it in adapters/outbound
```

Events for things that must not be synchronous. If module A must know module B exists,
they are one module. Splitting is a cost, not a default.

---

## 6. Naming

| Kind | Pattern | Example |
| --- | --- | --- |
| Use case file | `verb-noun` | `cancel-subscription.ts` |
| Entity | singular noun | `Invoice.cs` |
| Value object | noun | `Money.cs` |
| Repository interface | `I<Entity>Repository` or `<Entity>Repository` | `IInvoiceRepository.cs` |
| Repository impl | `<Entity>Repository.<tech>` | `InvoiceRepository.prisma.ts` |
| Route | `verb-noun.route` | `cancel-subscription.route.ts` |
| Never | `Utils`, `Helper`, `Manager`, `Base*`, `Common`, `Misc` | — |

**Rule: the filename answers "what is this?" on its own.** If it needs the folder path to
make sense, the name is wrong.

---

## 7. Error flow

```text
inbound  → maps transport errors to HTTP (once, centrally)
domain   → throws typed domain errors, no HTTP knowledge
application → may catch, translate, or wrap; never leaks transport errors outward
outbound → wraps infra errors with the operation name
```

One global error handler per service. `try/catch` in a handler is a smell.

---

## 8. When to add an abstraction

| Situation | Do |
| --- | --- |
| Second implementation needed | extract the interface |
| Second caller needed | extract the function |
| Logic duplicated a third time | extract now |
| Team disagrees on the name | you do not need the interface, you need a conversation |

**Premature abstraction costs indirection on every read.** Two implementations is the
trigger, not one.

---

## 9. Layer tests

| Layer | Needs infra? | Mocks? |
| --- | --- | --- |
| `domain/` | no | never |
| `application/` | no | never — hand-written fake |
| `adapters/outbound/` | yes (Testcontainers) | never |
| `adapters/inbound/` | no | test the real container |
| `composition/` | no | wiring assertions only |

**If an `application/` test needs a mocking library, the dependency rule is broken.**

---

## 10. Folder conventions per stack

| Stack | Root | Feature root |
| --- | --- | --- |
| Next.js | `src/` | `src/features/<f>/{domain,application,infrastructure,ui}` |
| Java / Quarkus | `com.app.<f>` | `domain/` `application/` `adapter/` `config/` |
| C# / .NET | `src/<Feature>/` | `Domain/` `Application/` `Adapters/` `DependencyInjection/` |
| Go | `cmd/` + `internal/` | `internal/<f>/` flat files |
| Python FastAPI | `src/<f>/` | `domain/` `application/` `adapters/` `schemas/` |
| Python Django | apps | `domain/` `services.py` `selectors.py` `api/` |
| Node frameworks | `src/` | `domain/` `application/` `adapters/` `composition/` |
| Angular | `src/app/` | `features/<f>/{domain,data-access,components}` |
| Vue | `src/` | `features/<f>/{components,composables,api}` |
| SvelteKit | `src/lib` + `src/routes` | `lib/features/<f>/` |

Per-stack detail in each file.
