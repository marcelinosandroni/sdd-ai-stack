# CHANGELOG

Todas as mudanças relevantes deste template. Formato baseado em
[Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/); versionamento por
[SemVer](https://semver.org/lang/pt-BR/).

---

## [0.3.1] — 2026-09-30

> **This is the first release where the package actually works.** Everything below
> existed only on GitHub until now: `npm view` served `0.1.17` while the rules the
> repository claims had never reached a single `npx` install.
>
> The release workflow had three guards in place and eight bugs behind them. All
> eight were green on `main` when they were found. Every one was found by running
> the release, none by reading it. Full record:
> [`phase-5-first-real-publish.md`](../specs/history/phases/phase-5-first-real-publish.md).

### 🐛 The publish jobs ran below their own coverage gate

`prepublishOnly` runs `npm run check:coverage`, which refuses to run below Node 24
because the test runner only aggregates coverage across its child processes from 24
on. Both publish jobs were on Node 22:

```
##[error]check-coverage needs Node >= 24 (running 22.23.2)
```

The publish died in its own gate before it ever reached the registry. A number in a
workflow is not a preference; it is a promise to every script that runs under it.

### 🐛 The GitHub Packages registry leaked into the gate suite

`setup-node` carried `registry-url: https://npm.pkg.github.com` and
`scope: '@marcelinosandroni'`, so `prepublishOnly` resolved the repository's own
dependencies from GitHub Packages. The suite died 0.3s into the first test file
with an error naming neither the scope nor the registry. The publish now names its
registry on the command instead of rewriting the job globally.

### 🐛 The GitHub Packages job was failing on its own gate

The job rewrites the name to a scope, because GitHub Packages only accepts scoped
names. `prepublishOnly` then ran the gate suite, and a test asserted the npm name
stays unscoped. Each half is correct; together they are a deadlock no unit test can
see. `--ignore-scripts` on both publish steps, with `needs: verify` as the guarantee
the skipped gates already ran on the same SHA.

### 🐛 Removing the registry also removed the auth

`registry-url` is what writes the `.npmrc` line that makes npm.pkg.github.com read
`NODE_AUTH_TOKEN`. Removing it fixed the leak and created this. The dry run stayed
green because `npm publish --dry-run` never touches the registry — a dry run is
evidence about exactly as much as the dry run exercised.

### 🐛 A half-succeeded release could not be resumed

The two registries publish in parallel and one succeeding does not undo the other, so
neither could assume the other failed. Retrying after the npm publish succeeded failed
on the registry that was already done. Each publish now checks its own registry first
and skips if the version is there.

### 🔒 `NPM_TOKEN` is gone

Trusted Publishing (OIDC) is the only path. The npm job injects no token at all —
a `NODE_AUTH_TOKEN` in the env makes npm ignore the OIDC entirely.

### ✅ Published

```
npm view create-sdd-ai-stack version     0.3.1
dist-tag latest                          0.3.1
fileCount                                103

GitHub Packages
  + @marcelinosandroni/create-sdd-ai-stack@0.3.1
```

`npm test` 64 → 79. The new tests cover the Node version, the registry isolation, the
auth wiring, the resumability, and the coverage floor label.

---

## 0.3.1 (pre-publish fixes)

### 🐛 A generated app inherited this repository's PLAN

`RULE_COPY_SKIP` already stopped `specs/history/` from being copied, but `specs/PLAN.md`
is a loose file and it was copied whole. A brand-new app received:

```
## Current phase: 4 — Site and responsive (DONE)
> This file is the template's own PLAN, not a fresh project
```

An agent would read that as *this project is already built* and skip straight to phase 5.
The scaffold now writes a fresh PLAN for a new project and logs that it did. A submodule
keeps the real one, because there it is the real one.

Two tests hold it: one asserts a generated app gets phase 0 and no reference to this
repository, the other asserts this repository keeps its own PLAN and a file per phase.

### 📋 The phase history had two gaps

`AGENTS.md` §7 archives every closed phase. Five phases had shipped and three had files:
the thirteen-finding audit and the site had none. Both are written now, and this repository's
PLAN points at all five instead of pretending to be a fresh project.

---

## [0.3.0] — 2026-09-30

> An agent was let loose on this repository, followed the rules in the documented
> order, and the rules failed him. Thirteen findings, all fixed — and the check
> that would have caught most of them is now a gate.

### 🧪 The simulation

An agent with no context was given a generated app and asked to follow
`AGENTS.md` §1. It ran the SKILL that §5 tells it to run before writing any
code, and could not get past `npm run typecheck`. Everything below came out of
actually doing it rather than reading the docs and assuming they were right.

### 🐛 Three that broke the flow

- **The `create-feature` SKILL generated code that did not compile.** `z.flattenError`
  returns `string[] | undefined` per field in Zod 4, and the template was written for
  Zod 3. It also used `undefined as never` and `throw new Error("not implemented")`, so
  the slice was born broken. It now compiles on the first run, and the parts that need
  a human decision fail loudly at runtime instead of at build time.
- **The author's name shipped to every consumer.** `PLAN.md` said "The developer
  (Marcelino) has ADHD", `git.md` declared a fixed identity, and `--git` committed as
  `Marcelino Sandroni <marcelino.sandroni@gmail.com>` in the user's repository. The
  first commit of somebody's project was in a name they never chose. Now the commit uses
  the developer's own `git config`, and when git has no identity the scaffold says so and
  leaves the staging intact instead of inventing an author.
- **`AGENTS.md` §4 said never run `npm install` at the root** — but in a generated app
  the root *is* the project. The rule was written from the template repository's point of
  view. It now names both cases.

### 🔧 Ten that made the agent drift

| Finding | Fix |
| --- | --- |
| The template's own phase history shipped to a new app, so the agent read "phase 0 done" and concluded the app existed | `specs/history/` is not copied; the app gets a folder plus a README that says a new project starts empty |
| `testing.md` told the agent to name tests in Portuguese | English, like every other rule |
| The `testing.md` example did not compile (`repo as never`, an input the schema does not have) | rewritten against the real schema |
| `next.md` asked for `src/DI/container.ts` that the template does not have | the slice container is the DI point, documented as such |
| `README.md` never mentioned `npx playwright install`, so the first `test:e2e` failed | documented, in the install block |
| `tests/integration` is named in the rules and absent from the template | a test now asserts every command `PREFLIGHT.md` names exists |
| Portuguese strings in `error.tsx`, `not-found.tsx` and `.env.example` | English, which is the rule the template ships |
| `DESIGN.md` documented `primary-container: #B4F230` while the CSS said `#BAF336` | both now `#BAF336`; a check compares them |
| No SKILL to create a task, so ids and paths drifted | `SKILLS/create-task` writes the file, fills the title and registers it in `PLAN.md` |
| Screenshots taken as E2E evidence landed in git | `test-results/` is gitignored and the screenshot path is documented |

### 🛡️ The rules are executable now

`SKILLS/check-rules` turns the load-bearing prose into checks. It found real
violations the moment it was written — Portuguese in `lib/check-links.mjs` and
`lib/scaffold.mjs` — that no review had caught.

| Rule | What it catches |
| --- | --- |
| `language.md §1` | Portuguese in code, comments, error strings, test names |
| `git.md §1` | a hardcoded identity passed to `git commit` |
| — | the author's own name inside the rules that ship to every user |
| `AGENTS.md §4` | the install rule contradicting the generated layout |
| `AGENTS.md §4` | a command a doc tells the agent to run that no `package.json` defines |
| `DESIGN.md §2` | a token whose hex disagrees between the doc and the CSS |
| `testing.md` | a named test layer the template does not have |

It runs against the generated app, not only the source — the template has to obey
the rules it ships.

### 🧭 PREFLIGHT.md

Tier 1 now includes what each gate actually proves, and — more usefully — what
each one does *not* prove. Commands 1 to 4 all pass on code that does the wrong
thing. A table says which layer is required for which kind of change, and the
three ways to fake evidence are named explicitly.

### 🧠 Read order: 16.5k → 5.8k tokens

`AGENTS.md` §1 was a flat list of eight documents, every one mandatory. It is now
four tiers: three documents you cannot skip, two you read once per session, and
everything else behind a decision. Tier 1 plus Tier 2 costs ~5.8k tokens instead
of ~16.5k, and the rules that moved to Tier 3 are still one `Read` away.

### 🌐 The site

`site/` is a static Next.js export for **sdd.marcelinosandroni.com**: what SDD
is, why it works, the six practices, how AI sits in the loop, how to install,
recommended tooling, the author's track record, and how to contribute. Same design
tokens as the portfolio and as `DESIGN.md` — one palette across the resume, the
site and every app the template generates. A `Site` CI job proves its anchors
resolve and its claims stay true.

### 🔧 CI hygiene

The annotations on every run were being ignored. Both were real:

- `actions/checkout@v4` and `actions/setup-node@v4` run on the deprecated Node 20
  runtime, and the `actions` job that was supposed to catch it only rejected
  `@v[0-3]`. Both are on `@v7`, and the guard now has an explicit per-action floor.
- `ubuntu-latest` migrates to Ubuntu 26 on 2026-10-19, which would change the OS
  under a green build. Pinned to `ubuntu-24.04`, with a check that fails if the
  floating label comes back.

Job names, step names and every comment in both workflows are English now, and
the check contexts in the branch protection match the real job names — they did
not, which is why PR #10 sat at `BLOCKED` with four green jobs.

### Evidence

```
npm test              → 62 passed (was 34)
npm run check:coverage → line 98.59 / branch 90.77 / func 95.28
npm run check:rules    → 0 violations, repo and generated app
npm run check:docs     → 49 documents, 0 broken links

template: typecheck 0 · lint 0 · unit 6/6 · build ✓ · e2e 20/20 · audit 0
site:     typecheck 0 · lint 0 · unit 4/4 · build ✓ · e2e 8/8
```

---

## [0.2.0] — 2026-09-29

> Deep audit. The example feature was dead code, the release could ship a red
> `main`, and `--git` was broken on Windows. All of it is now covered by tests.

### 🐛 Bugs found by the audit, all fixed

- **`scaffold --git` never committed on Windows.** `execFileSync` with
  `shell: true` joins arguments with plain spaces and never quotes them, so
  `user.name=Marcelino Sandroni` was split and git reported
  `Sandroni is not a git command`. Every Windows user got a repository with no
  commits. Arguments are now quoted on Windows.
- **`--submodule` always failed.** `git submodule add` needs a repository that
  already exists, and the scaffold ran it before `git init`. The target is now
  initialised first. Covered by two tests that clone a real local remote.
- **`--yes` was parsed and thrown away.** The flag did nothing; a TTY user was
  still asked to confirm. It is now recorded and honoured.
- **A tag published a red `main`.** `release.yml` fired on `push: tags` with no
  link to CI. A `guard` job now queries the CI conclusion for the tagged commit
  and fails the release unless it is `success`.
- **The release never re-ran the heavy gates.** `typecheck`, `lint`, `test` and
  `build` lived only in the PR CI, which nobody re-reads after a merge. The
  `verify` job now runs them against the app generated from the exact commit.
- **`node_modules` leaked into generated apps.** `installTemplate` only ignored
  `.git`, so a developer who ran `npm install` inside `template/next/` shipped
  their own `node_modules` to every consumer.
- **E2E ran against `next dev`,** which does not minify and takes a different
  render path. It now runs against `next build && next start`.

### 🧟 The example feature was dead code

`CreateExampleForm` — the only stateful component in the template, with
`useActionState`, `useFormStatus` and a pending button — was imported by nothing.
The action it called was unreachable, and the rule the project lives by ("no dead
code") was broken in its own template.

- `/app` now renders the form against the real action, behind real auth.
- The repository persists per process, so a created row is read back.
- Four E2E cases: unauthenticated, invalid field, valid, and banned role.
- `auth.ts` reads a demo header instead of returning `null` forever, and
  `requireUser()` is actually called by the action.
- `env.ts` is imported by the root layout, so a bad `DATABASE_URL` fails the
  build instead of the first request.

### 🔐 Security, now tested instead of asserted

- `proxy.ts` sets every security header on **every** branch, extracted into one
  function so no `return` can skip it.
- E2E proves a forged `x-middleware-subrequest` (CVE-2025-29927) does not bypass
  the proxy: the hardening headers would be missing if it had.
- A 401-style rejection is proven to write nothing.

### 🧰 The template became real

- `components.json`, so `npx shadcn add` stops asking for a layout.
- `Button` and `Skeleton` copied in, which finally uses the `class-variance-authority`
  that was declared and never imported.
- `loading.tsx` — the docs asked for it since the beginning.
- E2E on Chromium **and** Firefox, 20 tests.

### 📏 Gates that cannot be bypassed

- `npm run check:coverage` — floor at line 95 / branch 85 / func 90. Currently
  **98.51 / 90.63 / 95.19**. `bin/` is excluded from the report: it is a
  top-level script that executes on import, so the runner cannot instrument it
  without running the whole CLI. It is covered by `tests/bin.test.mjs` instead,
  which spawns the real binary.
- `tests/bin.test.mjs` — 9 tests driving the real `bin` and real `git`, which
  is where three of the bugs above were hiding.
- `supply-chain` CI job: `npm audit --omit=dev --audit-level=high`.
- `actions` CI job: fails if an action is pinned to a deprecated runtime.
- `main` is protected with `strict: true` on all four jobs.
- The published tarball grew to **16.803 files / 153 MB** because `files` listed
  `template` as a directory and npm happily packed every developer's
  `template/next/node_modules`. It is now 98 files / 153.6 kB, with the template
  enumerated and the build artefacts negated.

### 📚 Docs

- `docs/EVIDENCE.md` — what each command proves, and what the historical
  releases were actually validated by.
- `stacks/git.md` — the tag example was `v1.2.0` in a `0.x` project.
- `specs/tasks/TASK_TEMPLATE.md` — behavioural acceptance criteria and a
  security checklist, because a green build does not prove correct behaviour.
- `stacks/ci.md`, `docs/RELEASE.md` — branch protection, the release guard, and
  why the template ships without a lockfile.

---

### 🔒 Permissions and provenance

Every job now declares only what it needs. The workflow-level `id-token: write`
applied OIDC minting to the verification job as well, which had no business
having it. `guard` gets `actions: read` to read the CI conclusion, `verify` gets
nothing but `contents: read`, npm gets `id-token: write` for provenance, and
GitHub Packages gets `packages: write`.

---

## [0.1.20] — 2026-09-29

> One tag publishes to **npm and GitHub Packages**, in parallel.

### 📦 Dual registry

`release.yml` gains a second publish job. Both `needs: verify`, so they run in
parallel from the same commit and read the same `version`. A failure on one registry does
not cancel the other: npm can be down while GitHub Packages succeeds, and vice versa.
`concurrency: release-registry` still serialises *runs* so two publishes of the same
version never race.

| Registry | Name | Auth | Permission |
| --- | --- | --- | --- |
| npmjs.com | `create-sdd-ai-stack` | `NPM_TOKEN` or OIDC | `contents: read`, `id-token: write` |
| GitHub Packages | `@marcelinosandroni/create-sdd-ai-stack` | `secrets.GITHUB_TOKEN` (built in) | `contents: read`, `packages: write` |

### 🧭 Why two names for one package

**GitHub Packages only accepts scoped packages.** An unscoped name is rejected with a
`404` and there is no flag to work around it — the scope has to be in the name, matching
the account that owns the repo.

So the GitHub job rewrites `name` **only for its own publish**, in a disposable checkout.
The committed `package.json` stays unscoped, because an npm scope publishes **private**
by default. The job also asserts `repository.url` points at `marcelinosandroni`, which is
what GitHub Packages uses to link the package to the repo.

### 🪤 Two npm-only settings had to be removed, not out-flagged

Both come from the precedence this project already got bitten by: **npm reads
`publishConfig` above CLI flags.**

- `--access public` is rejected by GitHub Packages for a private package.
- `--provenance` is npm-only, and a leftover `publishConfig.provenance` could not be
  overridden with `--no-provenance` either.

So the job **deletes `publishConfig` entirely** and publishes with `--provenance=false`
rather than trying to out-flag npm.

### 📄 `.npmrc`

```ini
@marcelinosandroni:registry=https://npm.pkg.github.com
```

Scope mapping only: it routes `@marcelinosandroni/*` to GitHub Packages and leaves the
unscoped npm publish on npmjs. The file still must **not** declare `_authToken` — that
line shadows the user's `~/.npmrc` and silently zeroes auth.

### ⚠️ One manual step after the first publish

GitHub Packages creates npm packages **private**. Until the visibility is flipped,
installing `@marcelinosandroni/create-sdd-ai-stack` requires authentication, which
defeats the point of a second registry:

<https://github.com/users/marcelinosandroni/packages> → the package → **Change
visibility → Public**.

### 🧪 Tests

30 → **34**. Four new guards, plus two that were silently broken and are now honest:

- releases go to both registries, and the GitHub job declares `packages: write`
- the GitHub job rewrites the name to a scope and deletes `publishConfig`
- the GitHub job sends no npm-only flags and uses `GITHUB_TOKEN`
- the `.npmrc` scope matches the repository owner, and the npm name stays unscoped

Two pre-existing tests still searched the workflow for step names in **Portuguese**
(`- name: Publica`, `- name: Autentica`) after those steps were renamed to English.
`indexOf` returned `-1`, `slice(-1)` returned the last character, and both tests had
been passing **vacuously** — asserting against a newline. They now search the real
English names and slice only the npm job, so the GitHub job's flags cannot satisfy an
npm assertion by accident.

> A test that cannot fail is worse than no test: it looks like coverage while checking
> nothing. These two had been green through three releases.

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
