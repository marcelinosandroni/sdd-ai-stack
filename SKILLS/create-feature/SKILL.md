# 🧩 SKILL: create-feature

> Creates a new **vertical slice** in `src/features/<name>/` with domain, application,
> infrastructure, container, queries and actions — following
> [SDD/ARCHITECTURE.md](../../ARCHITECTURE.md).

## 🎯 When to use it

Every time you start a new feature. Before writing a file by hand, run this.

## ▶️ Usage

```bash
node SDD/SKILLS/create-feature/create-feature.mjs billing
# or (bash)
bash SDD/SKILLS/create-feature.sh billing
```

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
└── ui/                            # domain components
```

## ✅ Checklist after running it

- [ ] Implement `infrastructure/` (Prisma/API) satisfying the interface
- [ ] Write a unit test for the use case in `tests/unit/`
- [ ] Register the task in `SDD/specs/PLAN.md` (`[-]`)
- [ ] Create the route in `src/app/` **routing only**
- [ ] `npm run typecheck && npm run test:unit && npm run test:e2e`
