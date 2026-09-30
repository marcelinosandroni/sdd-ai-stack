# 🤖 ABSOLUTE AGENT LAWS (AGENTS.md)

> 🛑 **YOU ARE AN AUTONOMOUS AGENT** working under Spec-Driven Development (SDD).
> Your memory fails on long context. **The ONLY source of truth in this repository is the
> specification files.** If it is here, it counts. If it is not, do not invent it.

> 📦 **Where this file lives:** at the root of the `create-sdd-ai-stack` package.
> Installed into a project it becomes **`SDD/AGENTS.md`**, and every path below is
> relative to `SDD/`. That is why every link uses the `SDD/` prefix.

---

## 🎯 0. EXECUTIVE SUMMARY (30 seconds)

| Question | Answer |
| --- | --- |
| Default stack? | **Next.js 16** (App Router) |
| Extra backend? | Plain **Node.js**, only for worker/cron/webhook |
| Where are the rules? | `SDD/` — start with `SDD/AGENTS.md` (this file) |
| What do I do first? | Read `SDD/specs/PLAN.md` and take the **single** `[-]` task |
| When do I stop? | When the task turns `[x]` and you paste the green terminal output |
| May I edit the rules? | **NO.** See [§6](#-6-doc-permission-rules) |
| What language? | **English.** See [`stacks/language.md`](./stacks/language.md) |
| How do I commit? | Conventional Commits + fixed identity. See [`stacks/git.md`](./stacks/git.md) |

---

## 📚 1. CONTEXT MAP (read in this order)

> **Read the minimum necessary.** The full set below costs ~16.5k tokens before
> the first line of code. You do not need all of it for most tasks.
>
> **Tier 1 — every task (≈4.4k tokens):** you cannot skip these.
> 1. **`SDD/AGENTS.md`** (this file) — laws and flow.
> 2. **`SDD/specs/PLAN.md`** — the **single** task in flight right now.
> 3. **`SDD/PREFLIGHT.md`** — the five commands, and what each one proves.
>
> **Tier 2 — once per session, when the answer matters (≈2.4k tokens):**
> 4. **`SDD/APP.md`** + **`SDD/APP-STACK.md`** — what this app is, and which
>    stack it uses. Read once; the answer does not change between tasks.
>
> **Tier 3 — on demand (≈9.7k tokens, read only the file you touch):**
> 5. `SDD/ARCHITECTURE.md` — global architecture, vertical slices.
> 6. `SDD/stacks/README.md` — the index. Then open the **one** doc you need,
>    usually [`stacks/next.md`](./stacks/next.md).
> 7. `SDD/stacks/clean-code.md` — the shared spine. Any language.
> 8. `SDD/DESIGN.md` — only when touching UI.
> 9. `SDD/stacks/language.md` — only if unsure about the output language.
>
> **Tier 4 — never preloaded:** `stacks/{java,dotnet,go,python,angular,vue,svelte,
> node-frameworks,node,database,ai,agent-tooling}.md` and the rest of the
> tooling files. Open them the day you touch that stack, never before.
>
> If you are unsure which file answers your question, read
> [`stacks/README.md`](./stacks/README.md) — that is the router, and it is cheap.

> ⚠️ **Hyperfocus rule (ADHD):** the tiers above exist to be obeyed, not
> admired. Spending context on a doc you do not need is a bug, not caution. An
> agent that reads 40 files to answer one question hallucinates by file 30.

---

## 🗺️ 2. RULE ROUTER (where everything lives)

```text
SDD/
├── AGENTS.md           ← YOU ARE HERE (laws + flow)
├── APP.md              ← what this app is (business rules)
├── APP-STACK.md        ← which stack this app uses (pointer)
├── ARCHITECTURE.md     ← global architecture (vertical slices)
├── DESIGN.md           ← design system (tokens, typography, components)
├── stacks/             ← EVERYTHING stack/tool/language-specific
│   ├── README.md       ← index
│   ├── clean-code.md   ← 🧹 SPINE: SRP, SOLID, hexagonal, patterns, smells
│   ├── architecture.md ← 🏗 slices, boundaries, dependency rule
│   ├── language.md     ← 🗣 ENGLISH + token economy
│   ├── agent-tooling.md ← 🤖 companion tools, with trade-offs
│   │
│   ├── next.md         ← Next.js 16  ⭐ DEFAULT STACK
│   ├── java.md         ← Java 21+ · Spring Boot · Quarkus
│   ├── dotnet.md       ← C# · .NET · ASP.NET Core
│   ├── go.md           ← Go
│   ├── python.md       ← Python · Django · FastAPI
│   ├── node-frameworks.md ← Express · Fastify · Nest
│   ├── angular.md      ← Angular  (signals, OnPush, standalone)
│   ├── vue.md          ← Vue      (script setup)
│   ├── svelte.md       ← Svelte   (runes, SvelteKit)
│   ├── javascript.md   ← JS/TS core rules
│   ├── node.md         ← plain Node.js (worker, cron, queue)
│   ├── react.md        ← React (hooks, state, composition)
│   └── typescript.md   tailwind.md    shadcn.md     testing.md
│       database.md     ai.md          git.md        ci.md
├── specs/              ← operational SDD
│   ├── PLAN.md         (the task RIGHT NOW)
│   ├── BACKLOG.md      (loose ideas, tech debt)
│   ├── ROADMAP.md      (the big picture)
│   ├── history/phases/  (completed phases)
│   └── tasks/          (TASK-PHASE-TASK.md)
├── docs/
│   ├── PRODUCT.md      CHANGELOG.md   PLANNING.md   RELEASE.md
└── SKILLS/             ← automations (scripts) for this project
```

| I need to know… | Open |
| --- | --- |
| The next task | `specs/PLAN.md` |
| **Rules that apply to any language** | `stacks/clean-code.md` |
| How to structure a feature | `stacks/architecture.md` |
| Next.js rules | `stacks/next.md` |
| Another language | `stacks/README.md` (index) |
| Which stack this app uses | `APP-STACK.md` |
| Colors, type, spacing | `DESIGN.md` |
| How to commit | `stacks/git.md` |
| How to write a test | `stacks/testing.md` |
| TypeScript rules | `stacks/typescript.md` |
| Which language / how dense | `stacks/language.md` |
| Folder structure | `ARCHITECTURE.md` |
| Tools that cut tokens | `stacks/agent-tooling.md` |

> **Why every doc has a router at the top.** Each rule file opens with "if you are doing
> X, read §Y". That is what keeps your context small — and small context is the whole
> game. An agent that reads 40 files to answer one question is an agent that will start
> hallucinating by file 30.

---

## 🧠 3. MANDATORY BEHAVIOUR

1. **Proactive and creative, but disciplined.** Suggest architecture improvements, but
   **ask before changing a rule**.
2. **End of cycle = celebrate and ask.** When a phase closes: congratulate, ask whether
   to continue, or propose the next challenge.
3. **Do not invent rules.** If the answer is not in `SDD/`, **ask**. Never improvise
   architecture.
4. **Test failed? Stop.** Go back, fix it, run it again. **It is forbidden to move
   forward on a red test.**
5. **Task size:** the dev has ADHD. If a task takes more than 1 hour, **split it in two**
   before starting.
6. **🗣 Write in English.** Commit messages, docs, comments, specs, identifiers —
   everything you put in the repository. Talk to the *user* in their language.
   Full rule: [`stacks/language.md`](./stacks/language.md).
7. **✂️ Every line must earn its tokens.** Cut filler, hedging, preamble and symmetry.
   Never compress a `not`, a number, an error string or a command. Never invent
   abbreviations — the tokenizer splits them anyway, and the reader still decodes.
   Same law for your replies: full word beats abbreviation, clarity beats compression.
   Rule: [`stacks/language.md`](./stacks/language.md) §2.
8. **One file = one reason to change.** SOLID, separation of concerns, hexagonal arrows
   inward, no `Utils` class. Applies to every language.
   Rule: [`stacks/clean-code.md`](./stacks/clean-code.md).

---

## 🔄 4. DELIVERY FLOW (the gated workflow)

When you find your task in `specs/PLAN.md`:

1. **Refine** — read the task plus the relevant rule doc. Understand 100% before writing.
2. **Install packages** — run `npm install` in the folder that owns the
   `package.json`, and nowhere else. In a **generated app** that folder is the
   root. In a **monorepo** it is the workspace, never the root. If you are not
   sure which, run `ls package.json` first.
3. **Implement** — only what is necessary (max 5 files per step). Use a `SKILLS/` script
   when one exists.
4. **Test** — `typecheck` + `test:unit` + `test:e2e`. Write a test of **every** kind:
   unit, integration, E2E. Mock data for speed.
5. **Proof of life, anti-hallucination** — to mark `[x]`, **paste the green terminal
   output** in your reply (command + result + Playwright evidence).
   **You are forbidden from lying about a test.**
6. **Close** — mark `[x]` in `specs/PLAN.md` and **end your reply**.

### Failure loop 🛑
> Error? Go back. Fix it. Test again. **A red test means the task is not done.**
> No exceptions, no "it should work".

### Evidence is never compressed
> A token-saving tool may shorten your prose. It may **never** shorten the evidence
> block. The full command, the full exit code, the real counts.

### The only place full length wins
> A rule nobody finishes reading is a rule nobody follows. Docs are compressed so they
> can be reloaded cheaply on every task. **When compression creates ambiguity, clarity
> wins** — restore the words.

---

## 🛠️ 5. SKILL SYSTEM (automation)

- If a pattern repeats, **turn it into a SKILL**: a script in `SDD/SKILLS/<name>/`.
- Before writing code by hand, check whether a SKILL already does it.
- Keep names descriptive enough that **you** can find and run them without being told.

---

## 🌿 6. DOC PERMISSION RULES

| Action | Permission |
| --- | --- |
| Update `specs/PLAN.md`, `specs/tasks/*`, `docs/CHANGELOG.md`, `docs/PRODUCT.md`, `docs/PLANNING.md` | ✅ **AUTOMATIC** (mandatory after a change) |
| Create a new task in `specs/tasks/` | ✅ Automatic when the phase calls for it |
| Edit `APP-STACK.md` to switch this project's stack | ✅ Automatic (project configuration) |
| **Edit** `stacks/*`, `DESIGN.md`, `ARCHITECTURE.md`, `AGENTS.md` | 🛑 **FORBIDDEN without asking the human first** |

> If you spot an improvement in any of those, **ASK** before changing it. They are the
> law of the template.

---

## 📝 7. GIT, COMMITS AND VERSIONING

- **Gitflow + Conventional Commits + SemVer with tags.**
- **Identity:** the developer's own `git config`. Never commit as somebody else.
- **Message format:** `type(scope): short description. (Agent: <Tool> - <Model>)`
  - e.g. `feat(chat): create IVideo interface. (Agent: Cursor - Claude)`
  - Types: `feat` `fix` `refactor` `test` `docs` `chore` `perf` `style` `build` `ci`.
- **🗣 Commit messages are in English**, always. See [`stacks/language.md`](./stacks/language.md).
- Full detail: [`stacks/git.md`](./stacks/git.md).

### Memory cleanup (end of phase)
When **every** task in the phase is `[x]`:
1. Summarise the phase in `specs/history/phases/phase-N-finished.md`.
2. Delete the completed tasks from `specs/tasks/`.
3. Generate the SemVer tag: `git tag vX.Y.Z`.
4. **One** archiving commit.
5. Clean `specs/PLAN.md` and ask: **"What's the next challenge, boss?"**

---

## 🚨 8. KNOWN TRAPS (Next.js 16)

Do not fall into these (details in [`stacks/next.md`](./stacks/next.md)):
- `params` / `searchParams` / `cookies()` / `headers()` are **async**.
- `middleware.ts` was renamed to **`proxy.ts`** (exported function `proxy`). The old file
  is silently ignored at build time.
- `revalidateTag(tag)` with one argument is **deprecated** → use `updateTag` in actions.
- `next lint` was **removed** → run Biome/ESLint directly.
- `export const dynamic` / `revalidate` **do not exist** with `cacheComponents` →
  use `'use cache'` + `cacheLife`.
- Turbopack is the **default** bundler.
- Parallel routes require an explicit `default.js`.

---

## 🧭 9. HOW THIS PROJECT WAS BUILT

- This repository is the **template** (`create-sdd-ai-stack`). The rules live in `SDD/`.
- Consume it with `npx create-sdd-ai-stack my-app` (copies the rules + the Next template)
  **or** `git submodule add ... SDD` (rules only).
- Details: [`README.md`](./README.md).
