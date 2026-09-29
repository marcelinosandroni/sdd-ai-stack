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

## 📚 1. CONTEXT MAP (mandatory read order)

Whenever you are triggered, read in exactly this order:

1. **`SDD/AGENTS.md`** (this file) — laws and flow.
2. **`SDD/specs/PLAN.md`** — the **single** task in flight right now.
3. **`SDD/APP.md`** + **`SDD/APP-STACK.md`** — what this app is, and which stack it uses.
4. **`SDD/ARCHITECTURE.md`** — global architecture.
5. **`SDD/stacks/README.md`** — the stack index, then open the one you need
   (default: [`stacks/next.md`](./stacks/next.md)).
6. **`SDD/DESIGN.md`** — UI/UX rules (only when touching UI).
7. **`SDD/stacks/language.md`** — output language, and only if you are unsure.

> ⚠️ **Hyperfocus rule (ADHD):** read the **minimum necessary**. Do not read everything
> "just in case". Open a stack doc only when the task requires it. Context is the
> scarcest resource you have; spending it on a doc you do not need is a bug, not caution.

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
│   ├── next.md         ← Next.js 16  ⭐ DEFAULT STACK
│   ├── node.md         ← plain Node.js (worker, cron, queue)
│   ├── react.md        ← React (hooks, state, composition)
│   ├── typescript.md   tailwind.md    shadcn.md     testing.md
│   ├── database.md     ai.md          git.md        ci.md
│   ├── language.md     ← 🗣 ENGLISH BY DEFAULT
│   └── agent-tooling.md ← 🤖 companion tools, with trade-offs
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
| Next.js rules | `stacks/next.md` |
| Which stack this app uses | `APP-STACK.md` |
| Colors, type, spacing | `DESIGN.md` |
| How to commit | `stacks/git.md` |
| How to write a test | `stacks/testing.md` |
| TypeScript rules | `stacks/typescript.md` |
| Which language to write in | `stacks/language.md` |
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

---

## 🔄 4. DELIVERY FLOW (the gated workflow)

When you find your task in `specs/PLAN.md`:

1. **Refine** — read the task plus the relevant rule doc. Understand 100% before writing.
2. **Install packages** — **NEVER** run `npm install` at the root. `cd` explicitly when
   there are subfolders.
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
- **Fixed identity:** Marcelino Sandroni <marcelino.sandroni@gmail.com>.
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
