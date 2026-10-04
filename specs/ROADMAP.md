# 🗺️ ROADMAP

> The macro view. **Don't work from this** — use [`PLAN.md`](./PLAN.md) for the task at
> hand.

> ⚠️ **This roadmap describes the template, not a consuming product.** It used to list
> generic phases ("multi-tenant, billing, growth loop") that belong to a product built
> *with* this template, not to the template itself. That made it useless here: the rule
> below says no task may enter the PLAN without existing in the ROADMAP, and the real
> work — six phases of rules, site and release — was in none of them.

---

## ✅ Closed

| Phase | Name | What it changed |
| --- | --- | --- |
| [0](./history/phases/phase-0-bootstrap.md) | Bootstrap | Next.js 16 template, the SDD rules, the design system, the `npx create-sdd-ai-stack` CLI |
| [1](./history/phases/phase-1-english.md) | English | English by default, across code, docs and specs |
| [2](./history/phases/phase-2-all-stacks.md) | All stacks | 17 stack files behind a single router |
| [3](./history/phases/phase-3-rules-that-work.md) | Rules that work | 13 findings from letting an agent follow the rules, and the check that catches them |
| [4](./history/phases/phase-4-site-and-responsive.md) | Site and responsive | The site, copy buttons, analytics, and a responsive rule with teeth |
| [5](./history/phases/phase-5-first-real-publish.md) | First real publish | `0.3.1` live on npmjs and GitHub Packages, OIDC, and eight release bugs found by running the release |
| [6](./history/phases/phase-6-no-age-badly.md) | No age badly | Dependabot's ignore was inverted, and three files that had to agree on the Node version did not |
| [7](./history/phases/phase-7-your-project.md) | A project that belongs to you | Five leaks that shipped this repository's own documents into someone else's app |
| [8](./history/phases/phase-8-proving-the-rules.md) | Proving the rules | Six bugs that only exist in a generated app, and the CI job that finds them in 5 seconds |
| [9](./history/phases/phase-9-other-tools.md) | The rules in other tools | `.cursorrules` is Chat-only in Cursor; the other six shortcuts named a file that was not themselves |
| [10](./history/phases/phase-10-a-template-that-does-not-lie.md) | A template that does not lie | `check-facts` made the numbers in prose falsifiable |
| [11](./history/phases/phase-11-the-audit.md) | The audit | Four defects that were green on `main`, and one rule that structurally could not fail |
| [12](./history/phases/phase-12-more-than-one-template.md) | More than one template | A `--template` with one option, and three Next-only assumptions the second template exposed |
| [13](./history/phases/phase-13-a-theme-that-is-an-asset.md) | A theme that is an asset | The design system extracted out of one template into a portable artifact |

---

## 📚 Closed phases in detail

Each phase below exists because something **was broken or false**, not because it
sounded useful. The problem is named, not the solution.

### Phase 13 — A theme that is an asset ✅

> Delivered inside phase 11. The full reasoning is in
> [the phase 11 archive](./history/phases/phase-11-the-audit.md#2-2-the-theme-was-a-feature-of-one-template-not-an-asset-of-the-package).

**Problem.** Every token lived inside `@theme` in `template/next/src/app/globals.css`.
The design system was therefore inseparable from one framework, and "the design is
mine" was a property of the Next template rather than of this package.

**Delivered.** `themes/matrix/tokens.css` is the canonical source, shipped in the
package and exported at `./themes/*`. Each template keeps a byte-identical copy at
`src/app/theme.css` and imports it — because Turbopack refuses an `@import` that leaves
the project root, which is a bundler constraint and not a design decision. The copies
are asserted byte-identical, and `check-rules` RULE 7 now **fails when it reads zero
tokens** so it cannot pass by comparing nothing.

**Scope out.** A second theme. One portable theme proves the mechanism.

### Phase 11 — The audit ✅

**Problem.** Phases 3 to 10 found bugs by *running* something: the release, the
scaffold, the generated app. Nobody re-read the repository asking a different
question — not "does it work" but "does it obey its own rules". This phase was that
re-read, and it found four defects, three gaps, and one guard that could not fail.

| # | Defect | Why every gate was green |
| --- | --- | --- |
| 1 | `SKILLS/create-feature.sh` generates no test | the CI check exercises the `.mjs`; `SKILL.md` told the agent to run the `.sh` |
| 2 | The design system is documented in Portuguese | RULE 1's pattern list was built from one string, was case-sensitive, and never walked `template/next/src` |
| 3 | `ROADMAP.md` had two "Planned" sections, and phases 9 and 10 were never archived | `check:facts` verifies numbers, not structure |
| 4 | The README lists 3 of 8 skills | same blind spot: enumeration drift is invisible to a fact check |

**Delivered.** The `.sh` deleted and its absence asserted. RULE 1 rebuilt around a
curated word list, made case-insensitive, extended to the template source, and proven
by planting the failure. Every distributed file is English. The ROADMAP has one
`Planned` section and the missing archives. The README lists all eight skills, and
structural claims — enumerations, archive symmetry, one `[-]` — now live in
`tests/docs-structure.test.mjs`, because a fact checker recomputes numbers and has no
opinion about a table that lists 3 of 8. Plus phase 13, the portable theme.

Full account: [phase-11-the-audit.md](./history/phases/phase-11-the-audit.md).

**Scope out.** Fixing the rules the audit surfaced *as rules*, and writing the five
stack documents the router promises. Phase 8 measured and declined to tune; this one
tunes only what it can prove.

### Phase 6 — A template that does not age badly ✅

**Problem.** `template/next` pins `next: ^16.3.7`, and CI broke on its own when
`16.3.8` was unpublished from the registry mid-run. Dependabot covers the template
but its `@types/node` ignore rule was **inverted** — it blocked the safe minor
bumps and let every major through, so it offered types for a runtime that does not
exist. The README documented no Node version at all, so the pin was a private
detail nobody could check.

**Delivered.** The ignore now blocks majors only. `@types/node`, the CI
`node-version` and the README table are asserted equal, so changing one fails.
The README states what the repository is verified on.

**Scope out.** A lockfile in the template — the consumer commits their own, and
shipping ours would fight them.

### Phase 7 — A project that belongs to you ✅

**Problem.** `npx create-sdd-ai-stack my-app` produced an app that compiled but
shipped **this repository's own documents**: 41 references to the owner's handle,
9 dead links, and a 400-line `SDD/README.md` — the index an agent opens first —
teaching it how to publish `create-sdd-ai-stack`, with the npm username and the
OIDC dashboard URL. The template's release history was installed into someone
else's project.

**Delivered.** Five leaks closed and asserted: `RULE_DOC_COPY_SKIP`, the
repository README out of `RULE_FILES`, a fresh `ROADMAP.md`, a rewritten
`AGENTS.md` provenance block, and a two-way link resolver in `check-docs`. Plus
`check-rules` RULE 8, which asserts the generated app has the gates it promises
and says its missing CI is a decision.

**Result.** 41 references → 1 (the provenance line, on purpose). 9 dead links → 0.
49 documents, all resolving, zero rules violations.

**Scope out.** Turnkey CI in the generated app — `PRODUCT.md` deliberately does not
deliver it, and a wrong guess at your registry costs more than writing the one you
want.

### Phase 8 — Proving the rules in a generated project ✅

**Problem.** Phase 3 validated the rules by letting an agent follow them in *this*
repository. They had never been validated in a project the template *generated* —
and this repository has the three files a generated app lacks: its own
`package.json`, `tests/cli-flags.test.mjs`, and `.github/workflows/release.yml`.

**Found by walking it.** Six bugs, all green on `main`:

| # | Bug |
| --- | --- |
| 1 | `check-rules` crashed — reads `SDD/package.json`, which only exists here |
| 2 | `check-coverage` crashed — looked for this repo's test files by name |
| 3 | `check-facts` crashed — reads `.github/workflows/release.yml` |
| 4 | `TASK_TEMPLATE.md` linked `../../DESIGN.md` from a file three levels deep |
| 5 | `PREFLIGHT.md` stated this repo's counts ("6 passed", "20 passed") |
| 6 | `create-feature` generated a slice with no test |

**Delivered.** `SKILLS/dogfood` generates an app and walks the cycle, running in
CI in 5 seconds as a required status check. `create-feature` now ships a test and
lint-clean imports. The three template-only skills are no longer copied to
consumers. `PREFLIGHT.md` states placeholders.

**The one that was not what I thought.** I reported the biome schema mismatch as
the lint failure. It is an `info` and never failed anything — the real failure was
`create-feature` emitting imports its own lint rejects. Measuring beat reading.

**Scope out.** Changing the rules based on what the dogfood found. This phase
measures; it does not tune.

### Phase 9 — The rules in other tools ✅

**Problem.** The rules live in `AGENTS.md`; Claude Code reads `CLAUDE.md` and
Cursor's legacy format is `.cursorrules`. Nobody checked whether each tool still
reads the file the template generates for it.

**Found.** `.cursorrules` loads in Cursor's Chat mode and is **silently ignored in
Agent mode** — the mode an SDD workflow depends on. The other six were all titled
"AGENTS.md (pointer)", so an agent opening `CLAUDE.md` saw a heading naming a
different file.

**Delivered.** Each shortcut names its own reader. `.cursorrules` says, in the
file, that it is Chat-only and points at `AGENTS.md`. The generated README carries
the table and says to edit `SDD/`, never the pointer.

**Scope out.** Duplicating the rules per tool — pointers only, or they drift.

### Phase 10 — A template that does not lie about itself ✅

**Problem.** `docs/PRODUCT.md` claimed 27 tests while the suite had 79;
`README.md` claimed 52 tests and 33 documents. Four stale claims, none reported.

**The cost was never the wrong number.** It is that a document which misstates a
fact it could have verified teaches an agent to trust no document — the exact
failure this template exists to prevent, committed by the template itself.

**Delivered.** `SKILLS/check-facts` recomputes every verifiable claim in `README.md`
and `docs/PRODUCT.md` and fails naming the file, the stale value and the real one.
Wired into CI and `prepublishOnly`.

**Three things I got wrong building it**, all recorded in the SKILL.md:

1. The test count does not belong in a document. It went stale four times in an
   afternoon — every test added to the guard invalidated the claim the guard
   protected. The tracked claim is now "19 essential files", which changes only
   when the package changes shape.
2. `node --test` refuses to recurse inside a test file, so the check cannot run the
   suite from a test that invokes it. The count is a static scan — which can drift
   silently, so the check prints its own number beside `npm test`'s in the same log.
3. The check has a degenerate state: correcting a document by deleting the number
   left it green with nothing to verify. It now warns, and a test asserts it always
   finds at least one claim.
4. It counted the **first** `for f in …` loop in the release workflow and no others,
   so when phase 12 made that guard per-template it reported a number 5 too low —
   going *down* while the requirement went *up*. A checker that reads part of the
   thing it checks is as wrong as one that reads none of it, and it is not more
   honest about it.

**Scope out.** Checking prose quality, style or grammar. Verifiable claims only.

---

## 🧭 Planned

Nothing is scheduled. The open problems below are known, recorded, and not yet
claimed by a phase — deliberately, because a phase is a promise to finish something
and this repository does not make those promises lightly.

### Known and unscheduled

| Problem | Why it is not a phase yet |
| --- | --- |
| Seven backend rule sets (Go, Python, Java, .NET, …) ship rules with **no `npx` path**. A Python user gets rules and no project. | Each needs its own gate matrix, install path, and an answer to what "the rules apply" means for a server-rendered app. That is a phase of its own, not an appendage to phase 12 — which is why phase 12 shipped a frontend template and said so. |
| `docs/CHANGELOG.md` is written in Portuguese | `check-rules` does not scan `.md` in repository mode, so the language law stops one directory layer above where the drift is. Phase 11 fixed the rule for code and left the documents. Coercing them means deciding what "English by default" is *for*, not just *where*. |
| No second theme | Phase 13 proved the mechanism with one theme. A second theme would test whether the mechanism survives being used twice — a different question, and only worth asking once something else depends on it. |

### Phase 12 — More than one template ✅

**Problem.** `--template <next|none>` accepted a list of one. `TEMPLATES` was
`["next"]`, and `none` is what `--rules-only` already did. Meanwhile seven backend
rule sets ship with no `npx` path at all: a Go or Python user gets rules and no
project.

**Delivered.** `template/spa` — Vite 7 + React 19, no App Router, no server
components, no `proxy.ts`, no `shadcn` — carrying the same `themes/matrix/tokens.css`
byte for byte. `SKILLS/dogfood` walks *N* templates, the CI template job is a matrix
over `TEMPLATES`, and the release guard loops. All of them read the same constant, and
the hardcoded `next` in `dogfood` is now asserted **absent**.

**And three defects the second template exposed**, none of which was visible with only
one: `create-feature` was a Next-only skill that emitted `next/cache` and
`@/shared/server/auth` into every app it ran in; `npm run lint` had **never worked**
inside a template folder because Biome refused to start without a `.gitignore` that npm
pack drops; and `check-facts` counted only the first of three guard loops in the
release workflow, reporting a number 5 too low.

Full account: [phase-12-more-than-one-template.md](./history/phases/phase-12-more-than-one-template.md).

**Scope out.** Seven templates. Two is the number that proves the seam is real — and
the backend gap is listed above, unscheduled, rather than quietly claimed.

---

## 🧭 How this roadmap talks to the PLAN

```text
ROADMAP.md   →  macro, the phases and their problems     (vision)
    ↓
PLAN.md      →  this week                 (one task at a time)
    ↓
tasks/       →  this task, in detail      (micro-steps)
    ↓
commit       →  this task, one step       (evidence)
```

> Rule: **no task enters the PLAN without existing in the ROADMAP** (even as a single
> line).