# CHANGELOG

Todas as mudanças relevantes deste template. Formato baseado em
[Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/); versionamento por
[SemVer](https://semver.org/lang/pt-BR/).

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
