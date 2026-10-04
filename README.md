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
| **Template** | Two complete apps — `next` (Next.js 16 App Router) and `spa` (Vite + React 19) — both with the design system already applied and both building |
| **CLI** | `npx create-sdd-ai-stack <name>` — everything in one command |
| **Submodule** | Installs only the rules into any project, with root shortcuts |

**Everything is in English by default** — commits, docs, code, identifiers — unless you
explicitly ask for another language. See [`SDD/stacks/language.md`](./stacks/language.md).

---

## ⚡ Getting started

### Requirements

| | Version | Why |
| --- | --- | --- |
| **Node.js** | 22.x | What the CI builds and gates the template on, and what `@types/node` is pinned to |
| **npm** | ≥ 11.5.1 | Only for *publishing* this template — Trusted Publishing (OIDC) does not engage below it |

`engines` in the generated app says `>=20.9.0` because that is Next.js 16's own
floor. **22 is what is verified**, and 20.9 will work but nothing in this
repository ever tested it.

> The version pin lives in three places that have to agree: `@types/node` in
> `template/next/package.json`, `node-version` in `.github/workflows/ci.yml`, and
> the table above. `tests/dependabot-contract.test.mjs` fails when they drift —
> the first version of that guard let `@types/node` jump to 26 while the runtime
> stayed on 22, and Dependabot opened the PR anyway.

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
npx create-sdd-ai-stack my-app                       # template (default: next)
npx create-sdd-ai-stack my-app --template next       # Next.js 16 App Router
npx create-sdd-ai-stack my-app --template spa        # Vite + React 19 SPA
npx create-sdd-ai-stack my-app --rules-only          # rules only
npx create-sdd-ai-stack my-app --install             # runs npm install
npx create-sdd-ai-stack my-app --git                 # git init + first commit
npx create-sdd-ai-stack my-app --submodule           # SDD/ as a git submodule
npx create-sdd-ai-stack my-app --submodule <url>     # from your fork
npx create-sdd-ai-stack my-app --shortcuts stub      # no symlink (Windows without dev mode)
```

#### The two templates

| `--template` | Stack | What it proves |
| --- | --- | --- |
| `next` | **Next.js 16** App Router, RSC, Server Actions, `proxy.ts`, Tailwind v4, shadcn | The default, and the fullest stack |
| `spa` | **Vite 7 + React 19** SPA, plain TypeScript | That the rules, the design tokens and the gates are not Next-shaped |

`spa` is not a smaller Next. It has no App Router, no server components, no
`proxy.ts`, no `shadcn` — what is left is the part that was always supposed to be
framework-independent: the SDD rules, the design tokens and the gates. Both templates
ship the **same** `themes/executive/tokens.css`, byte for byte, and both are gated on
every push by a matrix that reads the template list from `lib/constants.mjs` — so a
third template gets its own CI leg without anyone editing a workflow.

The backend stacks (Go, Python, Java, .NET) still ship rules only. A Python user gets
the rules and no project: that gap is real, recorded in the ROADMAP, and not solved
here. Two templates prove the seam; seven would prove nothing extra.

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
├── stacks/              🧱 by language and tool — all compressed on purpose
│   ├── clean-code.md    🧹 THE SPINE: SRP, SOLID, hexagonal, patterns, smells
│   ├── architecture.md  🏗 slices, boundaries, dependency rule
│   ├── next.md          ⭐ Next.js 16 (the default stack)
│   ├── java.md          Java 21+ · Spring Boot · Quarkus
│   ├── dotnet.md        C# · .NET · ASP.NET Core
│   ├── go.md            Go · chi · sqlc · errgroup
│   ├── python.md        Python 3.12+ · Django 5 · FastAPI
│   ├── node-frameworks.md  Express 5 · Fastify · Nest
│   ├── angular.md       Angular 20+ · signals · OnPush
│   ├── vue.md           Vue 3.5+ · `<script setup>`
│   ├── svelte.md        Svelte 5 · runes · SvelteKit
│   ├── javascript.md    JS/TS core rules
│   ├── node.md          plain Node.js (workers, cron, queues)
│   ├── react.md         React (server-first)
│   ├── typescript.md    tailwind.md     shadcn.md     testing.md
│   ├── database.md      ai.md           git.md        ci.md
│   ├── language.md      🗣 English by default + token economy
│   └── agent-tooling.md 🤖 tools that cut tokens, with trade-offs
├── specs/               operational SDD
│   ├── PLAN.md  BACKLOG.md  ROADMAP.md
│   ├── tasks/TASK_TEMPLATE.md
│   └── history/phases/
├── docs/                PRODUCT.md  CHANGELOG.md  PLANNING.md  RELEASE.md  EVIDENCE.md
└── SKILLS/              automations (see the table below — all 8)
```

### The site

**[sdd.marcelinosandroni.com](https://sdd.marcelinosandroni.com)** — the public page for this
project: what SDD is, why it works, how to install it, and who built it. Lives in
[`site/`](./site/), deployed to Vercel, and it obeys the same rules it documents.

### The read order `AGENTS.md` enforces

```text
TIER 1 — every task, ~4.4k tokens, cannot skip
1. SDD/AGENTS.md        laws and flow
2. SDD/specs/PLAN.md    the single [-] task
3. SDD/PREFLIGHT.md     the five gates, and what each one proves

TIER 2 — once per session, ~2.4k tokens
4. SDD/APP.md           what this app is
5. SDD/APP-STACK.md     which stack

TIER 3 — on demand, only the file you touch, ~9.7k tokens
6. SDD/ARCHITECTURE.md  vertical slices
7. SDD/stacks/next.md   the stack rules
8. SDD/stacks/clean-code.md   the spine — for ANY language
9. SDD/DESIGN.md        only when touching UI
10. SDD/stacks/…        only the tool you are using
```

> The tiered read order exists because **context is the scarcest resource an agent
> has**. The old flat list cost ~16.5k tokens before the first line of code. The
> tiering keeps Tier 1 at ~5.8k and moves the rest behind a decision.
>
> Every rule doc has a **router at the top**: "if you are doing X, read §Y".

---

## 🧹 One spine, every stack

[`stacks/clean-code.md`](./stacks/clean-code.md) is the shared spine; every other stack
file maps it:

- **SRP** — one file, one resource, one reason to change. Never two.
- **SOLID** — with a "smell when broken" column, because a principle nobody can detect is
  a principle nobody follows
- **Separation of concerns** — `inbound → application → domain ← outbound`, arrows inward
- **Hexagonal / ports & adapters** — the default when it scales, which is always
- **Design patterns** — with the pain that justifies each one. Add on the *second*
  occurrence, never the first
- **Code smells** — a refuse-in-review table: feature envy, primitive obsession, shotgun
  surgery, boolean blindness, `Manager`/`Helper` naming
- **A review checklist** with 8 items you can run before marking a task `[x]`

And [`stacks/architecture.md`](./stacks/architecture.md) holds what stays constant across
languages: feature-first folders, the dependency rule, the composition root, cross-module
communication, and the per-stack folder table.

---

## ✂️ Every doc is compressed on purpose

A rule nobody finishes reading is a rule nobody follows — and rule files reload on every
single task. So the docs are dense, imperative, and free of filler.

The rules are written down, not left to taste
([`stacks/language.md`](./stacks/language.md) §2):

- **Cut:** filler, hedging, preamble, symmetry padding, restating the obvious
- **Never cut:** `not`, `never`, `no`, `only`, `except` — dropping them flips the meaning.
  Numbers, versions, error strings, code and commands stay exact
- **Never invent abbreviations:** `cfg`, `impl`, `req` cost the same as the full word under
  a modern tokenizer *and* still cost a decode. The full word is cheaper and clearer
- **Never grow output to sound compressed:** if a terse phrasing is not shorter than the
  plain one, use the plain one
- **Ambiguity wins over brevity.** Restore the words.

> Applies to docs, comments, test names, commits, and the chat reply. **One exception:
> evidence is never compressed.** Full command, full exit code, real counts.

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

Vertical slices. One folder per domain, carrying everything that domain needs. Full map in [`stacks/architecture.md`](./stacks/architecture.md):

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

## 🚀 Publishing to npm and GitHub Packages

Single path: **you version, GitHub Actions publishes — to both registries.**

```bash
npm run version:minor              # 0.1.19 → 0.2.0 (commits + creates tag v0.2.0)
git push origin main
git push origin --tags            # ← fires the publish
```

One tag, two registries, in parallel, from the same commit:

| Registry | Name | Auth |
| --- | --- | --- |
| npmjs.com | `create-sdd-ai-stack` | `NPM_TOKEN` or OIDC |
| GitHub Packages | `@marcelinosandroni/create-sdd-ai-stack` | `GITHUB_TOKEN` (built in) |

**Two names, one package:** GitHub Packages only accepts scoped packages, so the
workflow rewrites the name for the GitHub step alone. Our committed `package.json`
stays unscoped, because an npm scope publishes private by default.

The npm side needs auth settled once. With **2FA on**, an ordinary token will not
publish (`EOTP` — CI cannot type the OTP):

```bash
# A. Recommended: publish the 1st version locally, enable OIDC, delete the token
npm publish --access public --provenance=false --otp=123456
# then npmjs.com → create-sdd-ai-stack → Settings → Trusted publishing
#   owner: marcelinosandroni · repo: sdd-ai-stack · workflow: release.yml · allow: npm publish
gh secret delete NPM_TOKEN --repo marcelinosandroni/sdd-ai-stack

# B. Bridge: granular token with "Bypass 2FA" checked (deprecated by npm in Jan 2027)
gh secret set NPM_TOKEN --repo marcelinosandroni/sdd-ai-stack
```

The GitHub job needs no secret — `GITHUB_TOKEN` is built in and the workflow grants
`packages: write`. One thing to do by hand after the first publish: GitHub Packages
creates packages **private**, so flip the visibility once, or installs will need a token.

Guards before publishing: **CI green on the tagged commit** · the template gates
re-run (`typecheck`, `lint`, `test`, `build`) · `npm test` · coverage floor · doc
links · doc facts · the tag must match `package.json` · the tarball must carry
every essential file · `npm ≥ 11.5.1` · `concurrency` · provenance (npm only).

The release lists 19 essential files the tarball must contain, and every one of
them has to exist or the CLI breaks for whoever installs it. The release workflow
lists them; `npm run check:facts` recomputes that number from that list.

> The test count is not written here on purpose. `npm run check:facts` recomputes
> it, and a number that has to be updated by hand every time a test is added is
> a number that will be wrong. <!-- fact:off -->
> This file claimed 27 tests for months while the suite ran more than double that.
> <!-- fact:on -->

A tag is a release, not an annotation: `git push --tags` ships the package.

📖 Full walkthrough, the three npm auth paths, the two-name design, and troubleshooting
in [`docs/RELEASE.md`](./docs/RELEASE.md). What each command actually proves is
listed in [`docs/EVIDENCE.md`](./docs/EVIDENCE.md).

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
npm test                              # CLI, scaffold, docs integrity, release guards
node SDD/SKILLS/check-docs/check-docs.mjs   # relative links resolve
npm run check:facts                  # the numbers in these docs are still true
npm run check:pack                   # what will go to npm
```

`check:facts` recomputes every number this file and `docs/PRODUCT.md` state and
fails when one drifts. It exists because this README and `PRODUCT.md` both
<!-- fact:off -->
claimed 27 tests and 33 documents while the repository had more than double that
<!-- fact:on -->
— and nothing was red. A document that misstates a fact it could have checked
teaches an agent to trust no document, which is the failure this template exists
to prevent.

Every template is validated for real: `typecheck` + `lint` + `test` + `test:e2e` +
`build`, plus a check that the generated app carries the canonical design tokens
unchanged. The CI (`.github/workflows/ci.yml`) re-runs that validation on every push,
**generating the app from each template itself**, and the matrix reads the template
list out of `lib/constants.mjs` — so the workflow cannot fall behind the code the way a
hardcoded list would.

Both templates are also lintable **in this repository**, which they were not for
months: Biome could not start at all inside a template folder, because the packer
drops a literal `.gitignore` and the template stores it under another name. CI never
saw it, because CI lints the generated app. `tests/template-lint-config.test.mjs` now
keeps that command runnable.

---

## 📚 SKILLS

| SKILL | What it does | Ships to you? |
| --- | --- | --- |
| `create-feature` | Creates a new vertical slice with domain/application/container/queries/actions, **and its test** | ✅ |
| `create-task` | Registers a task in `specs/PLAN.md` from the task template | ✅ |
| `install-submodule` | Installs the rules into an existing project + creates the shortcuts | ✅ |
| `check-docs` | Validates that every relative link between documents resolves | ✅ |
| `check-rules` | Makes the written rules executable — English, identity, token agreement | ❌ |
| `check-coverage` | Fails when line, branch or function coverage drops below the floor | ❌ |
| `check-facts` | Recomputes every number these docs claim, and fails when one is stale | ❌ |
| `dogfood` | Generates an app and walks the cycle the rules describe | ❌ |

The four marked ❌ verify **this repository** — its own tokens, its own coverage
floor, its own documented numbers — and they crash with `ENOENT` in a project that
has none of those. They run in CI, against the thing they were written for, and
`RULE_SKILL_COPY_SKIP` in `lib/constants.mjs` keeps them out of your `SDD/`. A
check that breaks where it lands is worse than no check, because it looks like
coverage and it is not.

---

## 👨‍💻 Author

**Marcelino Sandroni** — [github.com/marcelinosandroni](https://github.com/marcelinosandroni)

MIT License.
