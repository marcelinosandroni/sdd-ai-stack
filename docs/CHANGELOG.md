# CHANGELOG

Todas as mudanças relevantes deste template. Formato baseado em
[Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/); versionamento por
[SemVer](https://semver.org/lang/pt-BR/).

---

## [0.1.19] — 2026-09-29

> Every stack covered, one shared spine, and every doc compressed on purpose.

### 🧹 The spine: `stacks/clean-code.md`

New. The shared discipline every other stack file maps:

- **SRP** — one file, one resource, one reason to change, with the test: *"what is the one
  reason this file changes?"* If more than one answer, split
- **SOLID** — a table where each principle has a **smell when broken**, because a principle
  nobody can detect is a principle nobody follows
- **Separation of concerns** — `inbound → application → domain ← outbound`, and the exact
  may-import / must-not-import matrix per layer
- **Hexagonal / ports & adapters** — the default, with the lighter `features/<x>/{domain,
  application, infrastructure, ui}` shape for prototypes and an explicit **when hexagonal is
  too much** section that does *not* abandon the inward arrow
- **Design patterns** — each one paired with the pain that justifies it, and the rule
  "add on the second occurrence, never the first"
- **Code smells** — 12 rows of refuse-in-review smells, each with the fix
- **A review checklist** with 8 items to run before marking a task `[x]`

Plus `stacks/architecture.md`: feature-first folders, the dependency rule, the composition
root, cross-module communication, error flow, when to add an abstraction, layer tests, and
a per-stack folder table.

### ☕ Seven new stacks

| File | Stack |
| --- | --- |
| `stacks/java.md` | Java 21 · Spring Boot 3 · Quarkus 3 — feature-first packages, records, `sealed` + pattern matching, constructor injection only, and the Quarkus native-image reflection rule |
| `stacks/dotnet.md` | C# · .NET 10 · ASP.NET Core · EF Core — records, nullable reference types, `async` all the way, minimal API vs MVC, `sealed` by default. **.NET only** |
| `stacks/go.md` | Go 1.23+ · chi · sqlc · errgroup — errors wrapped with `%w`, one goroutine owner, goroutine leak rules, `context` as first parameter, `-race` in CI, fakes over mocks |
| `stacks/python.md` | Python 3.12+ · Django 5 · FastAPI — `Protocol` over `ABC`, no mutable defaults, `dataclass(frozen=True)`, and the two truth tables that matter: Django (queryset in `selectors.py`, signals are the anti-pattern) and FastAPI (a blocking DB call inside `async def` blocks the event loop) |
| `stacks/javascript.md` | JS/TS core — `unknown` over `any`, `satisfies`, discriminated unions, plus **value objects for money, dates and ids**: integer minor units, injected clock, branded id types |
| `stacks/node-frameworks.md` | Express 5 · Fastify · Nest — with a decision table, and the Express 5 gotcha (it forwards rejected promises, so the `asyncHandler` wrapper in most tutorials is Express 4). Nest's DI is the whole point; using it without DI is worse than Express |
| `stacks/angular.md` | Angular 20+ — standalone only, `OnPush` everywhere, signals with `asReadonly()` on every exposed signal, `track` mandatory in `@for`, and `HttpTestingController.verify()` at the end of every HTTP test |
| `stacks/vue.md` | Vue 3.5+ — `<script setup>` only, `ref` by default over `reactive`, `computed` for anything derived, `shallowRef` for lists, and Pinia explicitly for *client* state, never a server cache |
| `stacks/svelte.md` | Svelte 5 + SvelteKit — runes over stores, `$effect` only for real side effects **with a mandatory cleanup**, and the `+page.svelte` renders / `+page.server.ts` fetches split |

### ✂️ Every doc is now compressed on purpose

`stacks/language.md` §2 is a new law: the docs themselves are written dense and
imperative, because rule files reload on every task and a rule nobody finishes reading is
a rule nobody follows.

It states what to cut (filler, hedging, preamble, symmetry), what is never compressed
(`not`/`never`/`no`/`only`/`except`, numbers, versions, error strings, code, commands), and
two rules that are easy to get wrong:

- **Never invent abbreviations.** `cfg`, `impl`, `req` cost the same as the full word under
  a modern tokenizer *and* still cost a decode. The full word is cheaper and clearer.
- **Never grow output to sound compressed.** If a terse phrasing is not shorter than the
  plain one, use the plain one.

And one hard limit: **ambiguity wins over brevity.** Restore the words. Plus the
exception that already existed in `AGENTS.md`: evidence is never compressed.

### 🧠 AGENTS.md

Two new mandatory behaviours and a new read-order step:

- `stacks/clean-code.md` in the read order, for **any** language
- "Every line must earn its tokens" with the pointer to §2
- "One file = one reason to change" with the pointer to the spine

### 🧪 Tests

27 → **30**. Three new guards, because every one of them already broke something:

- every stack document the index promises exists
- the index links each one (it caught `node.md` and `svelte.md` never being linked)
- every stack doc references `clean-code.md` (it caught nine docs drifting off the spine)

The first version of the third test was wrong — it asserted the link format
`(./stacks/x.md)` while the index lives *inside* `stacks/`, so its links are
sibling-relative. The test was fixed, not the doc.

---

## [0.1.18] — 2026-09-29

> Move every stack document into `stacks/`, make English the default output language,
> and document the agent tooling worth adopting.

### 📁 Every stack file now lives in `stacks/`

`NEXT.md`, `REACT.md` and `NODE.md` moved from the root into `stacks/`, next to the
stack docs that were already there. Before, a reader had to know which was which before
opening anything.

```text
before:  NEXT.md  REACT.md  NODE.md  +  stacks/{typescript,tailwind,shadcn,…}.md
after:   stacks/{next,react,node,typescript,tailwind,shadcn,…}.md
```

All links updated across 15 files: `AGENTS.md`, `APP.md`, `APP-STACK.md`,
`ARCHITECTURE.md`, `README.md`, the template README, the CLI help text, the scaffold
stub, all three SKILLS, the release workflow, `package.json`, and the tests.

`lib/constants.mjs` no longer lists them in `RULE_FILES` — they ship with the `stacks/`
directory, so there is exactly one place that decides what lands in `SDD/`.

### 🗣 English by default

New rule: [`stacks/language.md`](../stacks/language.md). Commits, PR titles, docs, code
comments, identifiers, specs and the changelog are English **unless the user explicitly
asks otherwise**. The one exception, stated explicitly: **you still talk to the user in
their language.** A Brazilian dev wants Portuguese chat and an English codebase.

It carries the reasoning rather than just the command: English is ~15–25% cheaper in
tokens, it matches the tokenizer and every tool's vocabulary, and a rule file in English
works for any team. It also defines what does *not* count as an explicit request — the
user writing to you in Portuguese is not a request to change the repo.

All documentation, code comments and commit guidance in this repo are now English.

### 🤖 Agent tooling, with trade-offs

New: [`stacks/agent-tooling.md`](../stacks/agent-tooling.md). Each entry was checked
against that project's own README rather than repeated from hearsay:

- **[caveman](https://github.com/JuliusBrussee/caveman)** — 65% average output-token
  reduction as a skill, ~33% input-token reduction as a local proxy, plus
  `caveman-compress`, which shrinks `AGENTS.md` itself. Included: their own caveat that
  it only affects output, costs ~1–1.5k input tokens per turn, and can go net-negative on
  already-terse workloads.
- **[superpowers](https://github.com/obra/superpowers)** — a skills framework and a
  methodology. Compared skill by skill against what this core already covers, so you can
  see what is complementary and what would be redundant.
- **[spec-kit](https://github.com/github/spec-kit)** — GitHub's heavier SDD toolkit, with
  a decision table for choosing between it and this core (including "do not run both
  routers at once").
- **[BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD)** — agile AI-driven
  development with multi-agent roles.
- **Work-pattern skills** (`investigate-first`, `lean-build`, `surgical-patch`, …) — the
  cheapest token saving available, because they prevent work rather than compress it.

Plus a checklist for evaluating a tool you found yourself: does it have a reproducible
benchmark, does it admit when it loses, is it reversible, and does it create a second
"what to do next" authority?

### 🐛 Caught by our own tests during the move

Moving the files rewrote links in 15 files, and two were wrong — `check-docs` caught both:

- `stacks/next.md` kept root-relative links (`./DESIGN.md`, `./stacks/testing.md`) after
  the move: a silently-dead link of exactly the kind that survives review
- `tests/scaffold.test.mjs` still asserted the old `SDD/NEXT.md` layout

A third corruption was **not** caught by any test and would have shipped: the PowerShell
`Set-Content -Encoding utf8` used for the bulk rewrite **writes a BOM**, which put
`\ufeff` before the `{` of `package.json`. Found by inspection, fixed, and all 15 touched
files were re-normalised to UTF-8 without BOM.

> A bulk text rewrite on Windows is a code change, and it gets the same verification as
> any other. That is now written down in
> [`phase-1-english.md`](../specs/history/phases/phase-1-english.md).

---

## [0.1.17] — 2026-09-29 (FIRST RELEASE CANDIDATE — NEVER PUBLISHED)

> This version was the first complete rewrite, but the npm publish never succeeded
> (EOTP with 2FA on, then ENEEDAUTH, then a misleading 404). Everything it introduced
> shipped in **0.1.18** instead. Kept here for the record.

### 🎯 Goal

Restructure the rules core to **Next.js 16 as the default stack** (before: React/Vite +
Node), make the repository installable as a **git submodule into `SDD/`**, and turn it
into an **npm CLI package** (`npx create-sdd-ai-stack`) with a working Next.js template
inside.

### ✨ Added

- **`stacks/next.md`** — 11 sections of Next.js 16 rules (Server-First, Data Layer, Server
  Actions, Cache Components, Security, Route Handlers, Forms, Metadata, Performance,
  traps)
- **`APP-STACK.md`** — the pointer to which rules document the app uses
- **`stacks/`** — rules by language and tool: `typescript`, `tailwind`, `shadcn`,
  `testing`, `database`, `ai`, `git`, `ci`
- **`template/next/`** — a complete, validated Next.js 16 project
- **CLI** `create-sdd-ai-stack` + the npm package with `bin/`
- **SKILLS** `create-feature` and `install-submodule`
- **Tests for the library itself** — the scaffold, the shortcuts, and the doc integrity
- **CI** (`.github/workflows/ci.yml`) that regenerates the app from the template on
  every push

### 🔄 Changed

- `AGENTS.md` — Next-first
- `DESIGN.md` — replaced by the **Executive Engineering** design system
- `ARCHITECTURE.md` — from a client/server monorepo to Next-first vertical slices
- `NODE.md` / `REACT.md` — from "the stack" to **complements**
- `specs/PLAN.md`, `TASK_TEMPLATE.md`, `README.md` — rewritten around the real gates

### 🔐 npm publishing, and the four bugs that stood in the way

1. **`cache: npm` in the workflow** with no committed lockfile.
2. **The shortcut symlinks were born broken** — `path.relative()` received a relative
   path, which resolves against `process.cwd()`. Passed 100% on Windows because
   `symlinkSync` returns EPERM there and fell back to the stub. Only CI on Linux
   exposed it.
3. **`publishConfig.provenance: true`** broke the local publish with
   `EUSAGE / provider: null`. npm reads `publishConfig` **above** CLI flags and env, so
   `--provenance=false` and `NPM_CONFIG_PROVENANCE=false` do **not** help.
4. **`_authToken` in the project `.npmrc`** shadowed the user's `~/.npmrc` and zeroed
   auth: `npm whoami` returned `401`, and the first publish returned `404 Not Found` —
   an error that looks exactly like "the package doesn't exist". Proven by deleting one
   line and watching `npm whoami` start working.

Then **2FA**: with it on, npm demands a one-time password for `npm publish`, and CI has
no way to type one. Three exits, documented in [`RELEASE.md`](./RELEASE.md): a local
bootstrap plus Trusted Publishing (OIDC), a "Bypass 2FA" token (deprecated by npm in
Jan 2027), or stage-only tokens.

Every one of those is now locked by a regression test, each verified by reintroducing
the bug on purpose.

[0.1.18]: https://github.com/marcelinosandroni/sdd-ai-stack/releases/tag/v0.1.18
