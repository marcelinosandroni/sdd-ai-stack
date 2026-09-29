# 🧱 STACKS — RULES BY LANGUAGE AND TOOL

> Read the index, open only what you touch.
> Every stack file maps the shared spine in **[clean-code.md](./clean-code.md)**.
> All docs compressed on purpose: same meaning, fewer tokens.

## 📇 Index

### 🏗 Cross-cutting (read these first)

| File | What |
| --- | --- |
| [clean-code.md](./clean-code.md) | **The spine.** SRP, SOLID, separation of concerns, hexagonal, patterns, smells |
| [language.md](./language.md) | English by default + token economy for docs |
| [agent-tooling.md](./agent-tooling.md) | Tools that cut tokens, with trade-offs |
| [architecture.md](./architecture.md) | Vertical slices, folders, boundaries |

### 💻 Backend

| File | Stack |
| --- | --- |
| [next.md](./next.md) | **Next.js 16 — the default stack** |
| [java.md](./java.md) | Java 21+ · Spring Boot 3 · Quarkus 3 |
| [dotnet.md](./dotnet.md) | C# · .NET 10 · ASP.NET Core · EF Core |
| [go.md](./go.md) | Go 1.23+ · chi · sqlc · errgroup |
| [python.md](./python.md) | Python 3.12+ · Django 5 · FastAPI |
| [node-frameworks.md](./node-frameworks.md) | Express 5 · Fastify · Nest |
| [node.md](./node.md) | Plain Node.js — workers, cron, queues, batch |

### 🎨 Frontend

| File | Stack |
| --- | --- |
| [javascript.md](./javascript.md) | JavaScript / TypeScript core rules |
| [angular.md](./angular.md) | Angular 20+ · signals · OnPush · standalone |
| [vue.md](./vue.md) | Vue 3.5+ · `<script setup>` · Composition API |
| [svelte.md](./svelte.md) | Svelte 5 · runes · SvelteKit |
| [react.md](./react.md) | React 19 · Server-First |

### 🧰 Tooling

| File | What |
| --- | --- |
| [typescript.md](./typescript.md) | Types, generics, strict mode |
| [tailwind.md](./tailwind.md) | Styling, tokens, utilities |
| [shadcn.md](./shadcn.md) | UI components, primitives, variants |
| [testing.md](./testing.md) | Unit, integration, E2E, coverage |
| [database.md](./database.md) | Prisma, migrations, queries, transactions |
| [ai.md](./ai.md) | LLM integrations, streaming, tokens |
| [git.md](./git.md) | Commits, branches, PRs, releases |
| [ci.md](./ci.md) | GitHub Actions, lint, typecheck, deploy |

---

## 🎯 Which file for which job

| Job | File |
| --- | --- |
| Any refactor, any language | [clean-code.md](./clean-code.md) |
| Writing a feature slice | [architecture.md](./architecture.md) |
| Committing | [git.md](./git.md) |
| Reviewing a PR | [clean-code.md](./clean-code.md) §11 |
| Tightening docs | [language.md](./language.md) §Token economy |

---

## 🚫 Golden rules

1. **Prove the native is enough before adding a library.** `fetch` beats axios. CSS beats
   a plugin. A library goes in with a note in `docs/CHANGELOG.md` saying why.
2. **Never one file for two resources.** See [clean-code.md](./clean-code.md) §1.
3. **`domain/` imports nothing external.** See §3. Non-negotiable in every stack.
4. **One stack doc per stack.** No new file without a reason to be separate.
5. **Docs stay compressed.** A rule nobody finishes reading is a rule nobody follows.
