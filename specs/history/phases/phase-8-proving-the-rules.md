# Phase 8 — Proving the rules where they land (DONE)

> Six bugs reached `main` green. None of them is visible from inside this
> repository, and none ever will be.

## The gap

Every gate in this repository validates **this** repository. It has:

```
tests/cli-flags.test.mjs
its own package.json
its own .github/workflows/release.yml
```

A generated app has **none of those three**. That is not a detail — it is the
entire bug list.

Phase 3 validated the rules by letting an agent follow them here. Nobody ever
walked them into a project the template *generated*. The gap was theoretical
until someone did.

## Six bugs, all green on `main`

| # | Bug | Why nothing else could see it |
| --- | --- | --- |
| 1 | `check-rules` crashed, `ENOENT SDD/package.json` | that file exists here and only here |
| 2 | `check-coverage` crashed | looks for this repo's test files **by name** |
| 3 | `check-facts` crashed, `ENOENT .github/workflows/release.yml` | the release workflow is ours |
| 4 | `TASK_TEMPLATE.md` linked `../../DESIGN.md` | the file is three levels deep, and no `phase-N/` ever existed here |
| 5 | `PREFLIGHT.md` said "6 passed" and "20 passed" | those are our counts, shipped in someone else's project |
| 6 | `create-feature` produced seven files and no test | it compiled, which is all the old gate checked |

Bugs 1–3 are the worst kind: the template shipped scripts that **crash** where
they land and that **no document tells anyone to run**. That is worse than not
shipping them — it looks like coverage and it is not.

## The one I misdiagnosed

I reported a biome schema mismatch as the cause of a failing `npm run lint`:

```
The configuration schema version does not match the CLI version 2.5.15
  Expected: 2.5.15
  Found:    2.5.14
```

It is an `info`. It never failed anything. Changing the schema made no
difference — both versions exit 1.

The real failure, once I stopped reading and started measuring:

```
× Sort these imports.
> import { ForbiddenError, UnauthorizedError, requireUser } from "@/shared/server/auth";
```

`create-feature` generated imports its own lint rejects. **The skill shipped code
that failed the gate the skill tells the agent to run.** Four errors, all from
one line of a template string.

This is the same mistake the whole repository has been making, and it is worth
naming precisely: I read the loudest output instead of the exit code.

## What shipped

`SKILLS/dogfood` — generates an app and walks the cycle:

```
1. generate an app into a temp directory
2. run every gate PREFLIGHT.md names
3. run create-task and create-feature
4. typecheck the generated slice, and check it ships a test
5. run every shipped skill
6. resolve every relative link
7. check no document states this repository's counts
```

The gate list is **read from the generated `PREFLIGHT.md`**, not hardcoded. A
hardcoded list would drift from the document that tells an agent what to run, and
that drift is the failure being caught.

## The fixes

- **`create-feature` ships a test.** Its output told the agent to write that file
  by hand, so every project that used the skill started with a red suite or none at
  all. The generated test carries one `TODO` marking the real invariant, so the
  first `npm run test` shows exactly what to fill in.
- **`create-feature` emits lint-clean imports.** Sorted the way biome sorts them.
- **`RULE_SKILL_COPY_SKIP`** drops the three skills that verify this repository.
  They run in CI, against the thing they were written for. `check-docs` stays — it
  works on any markdown tree, which is what a consumer has.
- **The task template stops using a relative link.** The same template serves two
  depths — `specs/tasks/` here, `specs/tasks/phase-N/` in a generated app — and no
  relative path is correct in both. It names the file instead.
- **`PREFLIGHT.md` states placeholders**, says why, and lists the three skills a
  consumer can actually run.

## Skipped is not passed

```
  ○ npm run test:e2e  — skipped: the host cannot start a Playwright browser
```

Firefox does not launch on the Windows sandbox this was written on. CI runs both
browsers against the same template. Reporting that as a failing gate reports the
machine as the product — and a red suite that means "the machine" is a red suite
people learn to ignore.

## CI

`Dogfood` runs in **5 seconds** and is a **required status check**. A check nothing
blocks on is a comment.

## Evidence

```
npm test            110 passed (was 104)
check:coverage      line 98.83 / branch 89.59 / func 95.76
check:rules         0 violations
check:docs          57 documents, 0 broken links
check:facts         1 claim verified (110 tests, 57 documents)
check:pack          110 files

dogfood             5 checks, 0.6s
dogfood --full      11 passed, 1 skipped, 100.3s
CI Dogfood          pass 5s
```

Every dogfood check verified by planting its failure: the borrowed count, the dead
link, the crashing skill and the missing slice test each turn it red.

## The pattern across every phase of this repository

| Phase | Bugs | All green on main? |
| --- | --- | --- |
| 3 — rules | 13 | yes |
| 5 — release | 8 | yes |
| 7 — scaffold | 5 leaks | yes |
| 8 — dogfood | 6 | yes |

**Thirty-two bugs, and not one found by a review.** Not one found by a test that
existed before it. Every single one was found by *running the thing* — the
release, the scaffold, the generated app.

The guard written afterwards is the only reason the next one will not need the
same walk to find it.
