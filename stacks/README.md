# 🧱 STACKS — RULES BY LANGUAGE AND TOOL

> **Read the index, then open only the file for what you are touching.**
> Default stack: **[Next.js](./next.md)**. React and Node are complements.

## 📇 Index

| File | When to open it |
| --- | --- |
| [next.md](./next.md) | Next.js 16 — **the default stack** (App Router, RSC, Cache Components) |
| [node.md](./node.md) | Plain Node.js — workers, cron, queues, batch scripts |
| [react.md](./react.md) | React — hooks, state, composition (server-first) |
| [typescript.md](./typescript.md) | Types, interfaces, generics, strict mode |
| [tailwind.md](./tailwind.md) | Styling, tokens, utility classes |
| [shadcn.md](./shadcn.md) | UI components, primitives, variants |
| [testing.md](./testing.md) | Unit, integration, E2E, coverage |
| [database.md](./database.md) | Prisma, migrations, queries, transactions |
| [ai.md](./ai.md) | LLM/AI integrations, streaming, tokens |
| [language.md](./language.md) | 🗣 Output language — **English by default** |
| [agent-tooling.md](./agent-tooling.md) | 🤖 Companion tools that cut tokens, with trade-offs |
| [git.md](./git.md) | Commits, branches, PRs, releases |
| [ci.md](./ci.md) | GitHub Actions, lint, typecheck, deploy |

## 🎯 Modules of rule outside this folder

| File | Scope |
| --- | --- |
| [../AGENTS.md](../AGENTS.md) | Agent laws + delivery flow — **read this first** |
| [../APP.md](../APP.md) | What this app is |
| [../APP-STACK.md](../APP-STACK.md) | Which stack this app uses (pointer) |
| [../ARCHITECTURE.md](../ARCHITECTURE.md) | Global architecture and vertical slices |
| [../DESIGN.md](../DESIGN.md) | Design system (tokens, typography, components) |
| [../specs/PLAN.md](../specs/PLAN.md) | The task in flight right now |

## 🚫 Golden rule

> **Before installing any library, prove the native thing is not enough.**
> `fetch` beats axios. `<dialog>` beats a modal library. CSS beats a Tailwind plugin.
> If a library goes in, it goes in with a note in `docs/CHANGELOG.md` explaining why.
