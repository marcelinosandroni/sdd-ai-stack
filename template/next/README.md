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

## No CI here — and that is the decision

This template ships **no workflow**. The commands above run locally, and nothing
runs them for you until you add CI.

That is deliberate, not an oversight. A CI is a set of opinions about your
repository — registry, secrets, branch protection, deploy targets — and every one
of them would be wrong for your project on day one. Guessing them for you produces
a workflow you delete, which costs more than writing the one you want.

The rules for building the one you want are already here:

| Document | Scope |
| --- | --- |
| [`SDD/stacks/ci.md`](./SDD/stacks/ci.md) | What a CI must gate, and how |
| [`SDD/stacks/git.md`](./SDD/stacks/git.md) | Branches, commits, tags |

The first thing to gate is the loop above — `typecheck`, `lint`, `test`, `build`
— on every push. That is the same list this repository gates on itself, so the
rules you are about to follow are the rules the template actually runs.

## Mandatory flow

1. Take the next task from `SDD/specs/PLAN.md`
2. Implement **one step** at a time
3. Run `typecheck` + `test:unit` + `test:e2e`
4. Paste the green evidence in the terminal
5. Mark `[x]` in the PLAN and commit
