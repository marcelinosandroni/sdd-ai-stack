# 🧩 SKILL: create-feature

> Creates a new **vertical slice** in `src/features/<name>/` with domain, application,
> infrastructure, container, queries and actions — following
> [SDD/ARCHITECTURE.md](../../ARCHITECTURE.md).

## 🎯 When to use it

Every time you start a new feature. Before writing a file by hand, run this.

## ▶️ Usage

```bash
node SDD/SKILLS/create-feature/create-feature.mjs billing
```

One entry point, and it is `node`: the skill runs identically on Windows, macOS and
Linux, and it is the only implementation CI exercises. There was once a
`create-feature.sh` mirror beside this folder — it generated no test, and the
check that proves this skill ships one only ever ran the `.mjs`. A mirror is a
second implementation that nothing validates, so there is no mirror.

## 📦 What gets created

```text
src/features/billing/
├── domain/
│   ├── IBillingRepository.ts      # contract (interface, no external dependency)
│   └── billing.schema.ts          # Zod at the boundary
├── application/
│   └── create-billing.usecase.ts  # pure business rules
├── infrastructure/                # (empty — you implement the repository)
├── container.ts                   # the slice's DI
├── queries.ts                     # read entrypoint
├── actions.ts                     # Server Action: auth → zod → authz → use case → cache
├── ui/                            # domain components
└── ../../tests/unit/billing.test.ts   # generated with one TODO: the invariant
```

## ✅ Checklist after running it

- [ ] Implement `infrastructure/` (Prisma/API) satisfying the interface
- [ ] Fill the `TODO` in the generated `tests/unit/billing.test.ts` with the real
      invariant — the file is created for you, empty assertions are not
- [ ] Register the task in `SDD/specs/PLAN.md` (`[-]`)
- [ ] Create the route in `src/app/` **routing only**
- [ ] `npm run typecheck && npm run test:unit && npm run test:e2e`
