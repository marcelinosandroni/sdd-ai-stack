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

---

## 🧭 Planned

Each phase below exists because something is **broken or false today**, not because
it sounds useful. The problem is named, not the solution.

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
   protected. The tracked claim is now "17 essential files", which changes only
   when the package changes shape.
2. `node --test` refuses to recurse inside a test file, so the check cannot run the
   suite from a test that invokes it. The count is a static scan — which can drift
   silently, so the check prints its own number beside `npm test`'s in the same log.
3. The check has a degenerate state: correcting a document by deleting the number
   left it green with nothing to verify. It now warns, and a test asserts it always
   finds at least one claim.

**Scope out.** Checking prose quality, style or grammar. Verifiable claims only.

---

## 🧭 Planned

_Nothing yet. A phase appears here when something is broken or missing, and the
entry names the problem rather than the solution._

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