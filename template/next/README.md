# 🚀 [APP NAME]

> Generated with **SDD AI Stack** — `npx create-sdd-ai-stack`.
> The development rules live in [`SDD/`](./SDD). **Read
> [`SDD/AGENTS.md`](./SDD/AGENTS.md) before you code.**

## Stack

- **Next.js 16** (App Router, React 19.2, Turbopack, Cache Components)
- **TypeScript** strict + the `@/*` path alias
- **Tailwind CSS v4** (tokens in `src/app/globals.css`)
- **Biome** (lint + format)
- **Vitest** (unit/integration) + **Playwright** (E2E)

## Commands

```bash
npm run dev         # http://localhost:3000
npm run build       # production build
npm run typecheck   # tsc --noEmit
npm run lint        # biome check
npm run test:unit   # vitest (watch)
npm run test:coverage
npm run test:e2e    # playwright
```

## Project rules

All the rules live in `SDD/`:

| Document | Scope |
| --- | --- |
| [`SDD/AGENTS.md`](./SDD/AGENTS.md) | Agent laws + delivery flow |
| [`SDD/stacks/next.md`](./SDD/stacks/next.md) | Next.js 16 (the default) |
| [`SDD/DESIGN.md`](./SDD/DESIGN.md) | Design system |
| [`SDD/stacks/node.md`](./SDD/stacks/node.md) | Node.js (workers, cron) |
| [`SDD/stacks/react.md`](./SDD/stacks/react.md) | React |
| [`SDD/stacks/language.md`](./SDD/stacks/language.md) | English by default |
| [`SDD/ARCHITECTURE.md`](./SDD/ARCHITECTURE.md) | Global architecture |
| [`SDD/stacks/`](./SDD/stacks) | TypeScript, Tailwind, shadcn, tests, DB, AI, Git, CI |
| [`SDD/specs/PLAN.md`](./SDD/specs/PLAN.md) | The current task |

## Mandatory flow

1. Take the next task from `SDD/specs/PLAN.md`
2. Implement **one step** at a time
3. Run `typecheck` + `test:unit` + `test:e2e`
4. Paste the green evidence in the terminal
5. Mark `[x]` in the PLAN and commit
