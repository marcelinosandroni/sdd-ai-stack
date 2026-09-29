# 🚀 [NOME DO APP]

> Projeto gerado com **SDD AI Stack** — `npx create-sdd-ai-stack`.
> As regras de desenvolvimento moram em [`SDD/`](./SDD). **Leia [`SDD/AGENTS.md`](./SDD/AGENTS.md) antes de codar.**

## Stack

- **Next.js 16** (App Router, React 19.2, Turbopack, Cache Components)
- **TypeScript** strict + path alias `@/*`
- **Tailwind CSS v4** (tokens no `src/app/globals.css`)
- **Biome** (lint + format)
- **Vitest** (unit/integr) + **Playwright** (E2E)

## Comandos

```bash
npm run dev         # http://localhost:3000
npm run build       # build de produção
npm run typecheck   # tsc --noEmit
npm run lint        # biome check
npm run test:unit   # vitest (watch)
npm run test:coverage
npm run test:e2e    # playwright
```

## Regras do projeto

Todas as regras vivem em `SDD/`:

| Documento | Escopo |
| --- | --- |
| [`SDD/AGENTS.md`](./SDD/AGENTS.md) | Leis do agente + fluxo de entrega |
| [`SDD/NEXT.md`](./SDD/NEXT.md) | Next.js 16 (padrão) |
| [`SDD/DESIGN.md`](./SDD/DESIGN.md) | Design system |
| [`SDD/NODE.md`](./SDD/NODE.md) | Node.js (workers, cron) |
| [`SDD/REACT.md`](./SDD/REACT.md) | React |
| [`SDD/ARCHITECTURE.md`](./SDD/ARCHITECTURE.md) | Arquitetura global |
| [`SDD/stacks/`](./SDD/stacks) | TypeScript, Tailwind, shadcn, testes, DB, IA, Git, CI |
| [`SDD/specs/PLAN.md`](./SDD/specs/PLAN.md) | Tarefa atual |

## Fluxo obrigatório

1. Pegue a próxima task em `SDD/specs/PLAN.md`
2. Implemente **um passo** por vez
3. Rode `typecheck` + `test:unit` + `test:e2e`
4. Cole a evidência verde no terminal
5. Marque `[x]` no PLAN e commite
