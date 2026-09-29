# 🧩 SKILL: create-feature

> Cria um **vertical slice** novo em `src/features/<nome>/` já com domain, application,
> infrastructure, container, queries e actions seguindo [SDD/ARCHITECTURE.md](../../ARCHITECTURE.md).

## 🎯 Quando usar

Toda vez que começa uma feature nova. Antes de escrever arquivo na mão, rode isto.

## ▶️ Uso

```bash
node SDD/SKILLS/create-feature/create-feature.mjs billing
```

> Alternativa em bash: `bash SDD/SKILLS/create-feature.sh billing`

## 📦 O que é criado

```text
src/features/billing/
├── domain/
│   ├── IBillingRepository.ts      # contrato (interface, sem dep externa)
│   └── billing.schema.ts          # Zod na fronteira
├── application/
│   └── create-billing.usecase.ts  # regra de negócio pura
├── infrastructure/                # (vazio — você implementa o repositório)
├── container.ts                   # DI do slice
├── queries.ts                     # entrada de leitura
├── actions.ts                     # Server Action: auth → zod → authz → use case → cache
└── ui/                            # componentes do domínio
```

## ✅ Checklist depois de rodar

- [ ] Implementar `infrastructure/` (Prisma/API) satisfazendo a interface
- [ ] Escrever teste unit do use case em `tests/unit/`
- [ ] Registrar a task em `SDD/specs/PLAN.md` (`[-]`)
- [ ] Criar a rota em `src/app/` **só roteando** para o slice
- [ ] `npm run typecheck && npm run test:unit && npm run test:e2e`
