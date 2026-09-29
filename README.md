# 🤖 create-sdd-ai-stack

> **The development-rule kit for AI agents, built on Spec-Driven Development (SDD).**
> Default stack: **Next.js 16**. One `npx` and you have a project with rules,
> architecture, design system and SDD already in place.

```bash
npx create-sdd-ai-stack my-dashboard
```

---

## 🎯 What this is

A **rules + code template** for AI agents (Claude Code, Cursor, Copilot, Codex, Gemini
CLI, Cline, Windsurf…).

The agent opens the project, reads **one** sequence of files, and already knows: what to
build now, how to structure it, how to write code, how to commit, and when to stop.

| Deliverable | What you get |
| --- | --- |
| **Rules** | `SDD/` with agent laws, stack rules, design, architecture, SDD, and per-tool stacks |
| **Template** | A complete Next.js 16 app, with the design system already applied and building |
| **CLI** | `npx create-sdd-ai-stack <name>` — everything in one command |
| **Submodule** | Installs only the rules into any project, with root shortcuts |

**Everything is in English by default** — commits, docs, code, identifiers — unless you
explicitly ask for another language. See [`SDD/stacks/language.md`](./stacks/language.md).

---

## ⚡ Getting started

### 1. New project (recommended)

```bash
npx create-sdd-ai-stack my-app
cd my-app
npm run dev
```

What you get:

```text
my-app/
├── src/
│   ├── app/           # routes (public marketing + authenticated /app)
│   ├── features/      # example vertical slice (domain/application/infrastructure/ui)
│   ├── shared/        # design system, lib, server-only
│   ├── proxy.ts       # network boundary + headers
│   └── app/globals.css# DESIGN SYSTEM TOKENS
├── tests/             # unit + e2e, ready
├── SDD/               # 🧠 the rules
├── AGENTS.md          # shortcut → ./SDD/AGENTS.md
├── CLAUDE.md, GEMINI.md, .cursorrules, .github/copilot-instructions.md, …
└── package.json
```

### 2. Existing project (rules only)

```bash
# Option A — submodule (updatable through git)
git submodule add https://github.com/marcelinosandroni/sdd-ai-stack.git SDD
node SDD/SKILLS/install-submodule/install-submodule.mjs

# Option B — CLI
npx create-sdd-ai-stack . --rules-only
```

The root shortcuts (`AGENTS.md`, `CLAUDE.md`, `.cursorrules`…) point to
`./SDD/AGENTS.md`, so **every agent starts in the right place** — with no manual
configuration from you.

Updating the rules later:

```bash
git submodule update --remote --merge SDD
```

> ⚠️ The generated app's `.gitignore` protects `.env.local`, `.next/` and `node_modules/`.
> Never commit a real `.env` — only `.env.example`, which has placeholders.

### 3. CLI options

```bash
npx create-sdd-ai-stack my-app --template next      # template (default)
npx create-sdd-ai-stack my-app --rules-only         # rules only
npx create-sdd-ai-stack my-app --install            # runs npm install
npx create-sdd-ai-stack my-app --git                # git init + first commit
npx create-sdd-ai-stack my-app --submodule          # SDD/ as a git submodule
npx create-sdd-ai-stack my-app --submodule <url>    # from your fork
npx create-sdd-ai-stack my-app --shortcuts stub     # no symlink (Windows without dev mode)
```

---

## 🧠 The rule map (`SDD/`)

```text
SDD/
├── AGENTS.md            ⭐ laws + flow — READ FIRST
├── specs/PLAN.md        ⭐ the task RIGHT NOW
├── APP.md               what this app is
├── APP-STACK.md         which stack this app uses
├── ARCHITECTURE.md      🏗️ vertical slices
├── DESIGN.md            🎨 full design system (tokens, typography, components)
├── stacks/              🧱 by language and tool
│   ├── next.md          ⭐ Next.js 16 (the default stack)
│   ├── node.md          plain Node.js (workers, cron, queues)
│   ├── react.md         React (server-first)
│   ├── typescript.md    tailwind.md     shadcn.md
│   ├── testing.md       database.md     ai.md
│   ├── git.md           ci.md
│   ├── language.md      🗣 English by default
│   └── agent-tooling.md 🤖 tools that cut tokens, with trade-offs
├── specs/               operational SDD
│   ├── PLAN.md  BACKLOG.md  ROADMAP.md
│   ├── tasks/TASK_TEMPLATE.md
│   └── history/phases/
├── docs/                PRODUCT.md  CHANGELOG.md  PLANNING.md  RELEASE.md
└── SKILLS/              automations (create-feature, install-submodule, check-docs)
```

### The read order `AGENTS.md` enforces

```text
1. SDD/AGENTS.md      laws and flow
2. SDD/specs/PLAN.md  the single [-] task
3. SDD/APP.md         what this app is
4. SDD/APP-STACK.md   which stack
5. SDD/stacks/next.md the stack rules
6. SDD/DESIGN.md      only when touching UI
7. SDD/stacks/…       only the tool you're using
```

> Every rule doc has a **router at the top**: "if you are doing X, read §Y". That keeps
> the agent's context small — which matters, because long context is where agents die.

---

## 🗣 English by default

Everything that lands in the repository is English: commits, PR titles, docs, code
comments, identifiers, specs, task names, changelog. **You still talk to the agent in
your own language.**

Why it matters: English is ~15–25% cheaper in tokens for the same content, it matches
every tool's vocabulary, and a rule file in English works for any team in any country.
The full rule, the reasoning, and the exceptions:
[`SDD/stacks/language.md`](./stacks/language.md).

---

## 🎨 Design System

`DESIGN.md` implements **Executive Engineering**: deep obsidian-tinted slates (never
pure black), 1px micro-borders, accents in neon lime `#BAF336` and mint `#34D399`, a
triple-font system (**Manrope** structural + **JetBrains Mono** technical +
**Playfair Display** editorial), a 12-column grid capped at 1320px.

The tokens live in `src/app/globals.css` (Tailwind v4 `@theme`) and become utilities
(`bg-surface-raised`, `text-text-secondary`, `text-label-mono`, `border-border-subtle`…)
plus primitives (`btn-primary`, `btn-secondary`, `card`, `card-metric`, `chip`, `field`).

**One place.** Change the design in `@theme`, never in a component.

---

## 🏗️ Architecture

Vertical slices. One folder per domain, carrying everything that domain needs:

```text
src/features/<domain>/
├── domain/           # entities + contracts (I*.ts) — zero dependencies
├── application/      # use cases — pure rules, no Next, no Prisma
├── infrastructure/   # Prisma, HTTP, queues
├── container.ts      # the slice's DI
├── queries.ts        # read entrypoint
├── actions.ts        # write entrypoint (Server Action)
└── ui/               # domain components
```

The reason: **to understand a requirement you open one folder** — and `application/` is
testable without mocking infrastructure.

---

## 🤖 Companion tooling

[`SDD/stacks/agent-tooling.md`](./stacks/agent-tooling.md) reviews the ecosystem with
honest trade-offs, verified against each project's own README:

- **[caveman](https://github.com/JuliusBrussee/caveman)** — 65% average output-token
  reduction as a skill, ~33% input-token reduction as a local proxy. Includes
  `caveman-compress`, which rewrites `AGENTS.md` itself.
- **[superpowers](https://github.com/obra/superpowers)** — a skills framework *and* a
  methodology (TDD, planning, code review, worktrees). The strongest complement here.
- **[spec-kit](https://github.com/github/spec-kit)** — GitHub's heavier SDD toolkit, with
  a comparison table for choosing between it and this core.
- **[BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD)** — agile AI-driven
  development with multi-agent roles.
- Work-pattern skills (`investigate-first`, `lean-build`, `surgical-patch`, …) — the
  cheapest token saving available, because they prevent work instead of compressing it.

Nothing here is a dependency. This core stays a set of rules; these are add-ons.

---

## 🚀 Publishing to npm

Single path: **you version, GitHub Actions publishes.**

```bash
npm run version:minor              # 0.1.17 → 0.2.0 (commits + creates tag v0.2.0)
git push origin main
git push origin --tags            # ← fires the publish
```

The first time you have to settle authentication. With **2FA enabled on the npm
account**, an ordinary token will not publish (`EOTP` — CI cannot type the OTP). Two
ways out:

```bash
# A. Recommended: publish the 1st version locally, enable OIDC, delete the token
npm publish --access public --provenance=false --otp=123456
# then npmjs.com → create-sdd-ai-stack → Settings → Trusted publishing
#   owner: marcelinosandroni · repo: sdd-ai-stack · workflow: release.yml · allow: npm publish
gh secret delete NPM_TOKEN --repo marcelinosandroni/sdd-ai-stack

# B. Bridge: granular token with "Bypass 2FA" checked (deprecated by npm in Jan 2027)
gh secret set NPM_TOKEN --repo marcelinosandroni/sdd-ai-stack
```

The workflow picks the mode by itself: **with** `NPM_TOKEN` it uses a token, **without**
it uses OIDC. No token is ever written to a file.

Guards before publishing: `npm test` (27 tests) · doc links · tag `vX.Y.Z` matches
`package.json` · 10 essential files in the tarball · `npm ≥ 11.5.1` · `concurrency` ·
provenance.

📖 Full walkthrough, the three auth paths, and troubleshooting in
[`docs/RELEASE.md`](./docs/RELEASE.md).

---

## 🔌 Supported agents

Root shortcuts are created for:

| File | Agent |
| --- | --- |
| `AGENTS.md` | the de-facto standard (Cursor, Codex, Windsurf, Cline, Gemini) |
| `CLAUDE.md` | Claude Code |
| `GEMINI.md` | Gemini CLI |
| `.cursorrules` | Cursor (legacy format) |
| `.windsurfrules` | Windsurf |
| `.github/copilot-instructions.md` | GitHub Copilot |
| `.clinerules` | Cline |

All of them point to `SDD/AGENTS.md`. No manual configuration required.

---

## 🧪 Verification

```bash
npm test                              # 27 tests: CLI, scaffold, docs integrity, release guards
node SDD/SKILLS/check-docs/check-docs.mjs   # 33 documents, relative links
npm run check:pack                    # what will go to npm (73 files, ~66 kB)
```

The template in `template/next/` is validated for real: `typecheck` + `lint` + `test` +
`test:e2e` + `build`. The CI (`.github/workflows/ci.yml`) re-runs that validation on
every push, **generating the app from the template itself**.

---

## 📚 SKILLS

| SKILL | What it does |
| --- | --- |
| `create-feature` | Creates a new vertical slice with domain/application/container/queries/actions |
| `install-submodule` | Installs the rules into an existing project + creates the shortcuts |
| `check-docs` | Validates that every relative link between documents resolves |

---

## 👨‍💻 Author

**Marcelino Sandroni** — [github.com/marcelinosandroni](https://github.com/marcelinosandroni)

MIT License.
