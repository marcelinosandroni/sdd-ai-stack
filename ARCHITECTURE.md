# 🏗️ GLOBAL ARCHITECTURE

> **Next.js 16, App Router, Vertical Slices.** No separate `client/` vs `server/` — the
> framework *is* the boundary.

## 🧠 The principle

A **feature** (vertical slice) is the unit of change. It carries **everything** that
domain needs:

```text
src/features/chat/
├── domain/          # Entities, contracts (I*.ts) — ZERO external dependencies
├── application/     # Use cases (pure business logic)
├── infrastructure/  # Prisma, HTTP client, queues, storage
├── container.ts     # Dependency wiring (the slice's DI)
├── queries.ts       # READ entrypoint
├── actions.ts       # WRITE entrypoint (Server Actions)
└── ui/              # Domain components
```

**Practical consequence:** to understand a requirement, you open **one** folder.
Nothing is scattered.

## 📂 Root structure

```text
my-project/
├── src/
│   ├── app/          # ROUTING (routes only, zero business logic)
│   ├── features/     # 🌟 DOMAIN SLICES
│   ├── shared/       # Generic, shared
│   │   ├── ui/       # Design system (shadcn)
│   │   ├── lib/      # Pure helpers
│   │   ├── server/   # server-only: db, auth, env, logger
│   │   └── hooks/    # Cross-cutting hooks
│   └── proxy.ts      # Network boundary (optional)
├── SDD/              # The rules (submodule) ← what the agent reads
├── tests/            # unit/ integration/ e2e/
└── public/
```

## 🔀 The path of a request

```text
Browser
  ↓
proxy.ts (network: redirect, rewrite)  ← NOT security
  ↓
app/…/page.tsx  (Server Component)
  ↓
features/x/queries.ts   (read, with 'use cache' where applicable)
  ↓
features/x/application/ (use case)
  ↓
features/x/infrastructure/ (Prisma / external API)
  ↓
render (PPR: static shell + dynamic content)
```

```text
Browser <form action={…}>
  ↓
app/…/page.tsx  (Server Action) — auth → zod → authorisation → use case → cache
  ↓
revalidate / updateTag
  ↓
re-render of the shell
```

## 🧩 Shared vs Feature — the decision rule

| Question                                      | Answer                        |
| --------------------------------------------- | ----------------------------- |
| "Is this generic and not domain-specific?"    | `shared/`                     |
| "Only this domain uses it?"                   | `features/<domain>/`          |
| "Does it need DB/network/secrets?"            | `infrastructure/` (or `shared/server`) |
| "Is it a UI primitive (Button, Dialog)?"      | `shared/ui/`                  |
| "Is it UI with business rules?"               | `features/<domain>/ui/`       |

**Forbidden:** `features/a` importing `features/b`. If you need it, promote it to
`shared/`, or raise a domain event.

## 📏 Where each kind of code lives

| Kind | Location | Why |
| --- | --- | --- |
| Business rule | `features/x/application/` | testable, isolated, no Next |
| Domain contract | `features/x/domain/` | zero dependencies (inverts the direction) |
| SQL / Prisma query | `features/x/infrastructure/` | swappable without touching the domain |
| Server Action | `features/x/actions.ts` | write entrypoint, with auth + validation |
| Query (read) | `features/x/queries.ts` | read entrypoint, with cache |
| Route component | `app/…/page.tsx` | layout + composition only |
| Global config (env, db, auth) | `shared/server/` | single boot point |
| Design token | `app/globals.css` | the single source of the theme |

## 🧪 Testability

The architecture exists for this: **`application/` and `domain/` import neither Next
nor Prisma.** You instantiate the use case with a fake repository and test in 5ms.

```ts
const useCase = new CreateExampleUseCase(fakeRepo);
```

## 🚫 STRUCTURAL ANTI-PATTERNS

| ❌ | ✅ |
| --- | --- |
| `src/utils/`, `src/services/`, `src/models/` (generic folders) | `features/<domain>/` |
| Business logic in `page.tsx` | `page.tsx` delegates to a use case |
| `features/a` importing `features/b` | `shared/` or a domain event |
| A global `types/` holding domain types | `I*.ts` inside the slice |
| Prisma imported in a Server Component | via the feature's `queries.ts` |
| Inline CSS / hex literals | [DESIGN.md](./DESIGN.md) tokens |
| An API route for everything | Server Actions for UI mutations |

## 🧭 Complementary: Node.js

The App Router covers the web. **Plain Node.js** enters **only** for what the App Router
does not do: a queue worker, cron, a heavy webhook consumer, a batch CLI. See
[node.md](./stacks/node.md).
