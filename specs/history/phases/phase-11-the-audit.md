# Phase 11 — The audit (CLOSED)

> The first phase in this repository's history that started by **re-reading the code
> instead of running it**. Every previous phase was triggered by something breaking.
> This one was triggered by noticing that nothing had broken, which turned out to be
> the most dangerous state of all: green everywhere, and wrong in four places.

**Why this phase existed.** Phases 8, 9 and 10 were about making the template honest —
a fact checker, a link checker, a rules checker. Three checkers, all green. So the
remaining question was the one no checker could answer: *were the checkers checking
anything?* Re-reading the repository instead of running it found four defects, three
product gaps, and one rule that structurally could not fail.

---

## 1. The four defects

### 1.1 A `.sh` mirror that the docs recommended and the CI never tested

`SKILLS/create-feature/SKILL.md` documented `bash create-feature.sh` as the entry
point. The bash script generated **no test**, while the `.mjs` it shadowed did — and
the CI guard exercised only the `.mjs`.

Every agent on Linux or macOS, following the documentation, landed on the one path
without a test. This is precisely the bug phase 8 declared closed; it had simply been
reopened by a documentation edit nobody re-checked.

**Delivered:** the mirror is deleted. The doc names only `node …/create-feature.mjs`.
`tests/skill-entrypoints.test.mjs` now asserts the mirror cannot come back, that no
skill ships a loose script in `SKILLS/`, that no `SKILL.md` mentions `bash`, and that
every `.mjs` skill has a `SKILL.md`. Two skills (`check-coverage`, `check-rules`) were
missing theirs entirely.

The alternative — fixing the `.sh` — was rejected on purpose: `.mjs` is cross-platform,
it is the only implementation CI validates, and a second entry point means every future
change is validated once and shipped twice.

### 1.2 A product in Portuguese, in a project whose phase 1 was "English by default"

`template/next/src/app/globals.css` documented the entire design system in Portuguese.
So did the library comments, the placeholders in `layout.tsx` (`[NOME DO APP]`), the
user-facing output of two skills, and the package description on npm.

Phase 1 of this repository decided the language. Phase 11 found the decision had been
quietly abandoned in the one place a consumer actually reads: the design system.

**Root cause is the interesting part.** `check-rules` RULE 1 exists, is named in CI,
and was green over all of it. Two independent reasons, and **both** had to be fixed:

1. **The pattern list was built from one remembered error string.** Fifteen patterns
   later it still passed — because a pattern nobody thought of cannot catch anything.
2. **It never walked the template.** RULE 1 only ran when its argument was a *generated
   app*, and CI passes no argument. So `template/next/src` — the only code a consumer
   receives — was the single place the language law was never applied. The branch that
   skipped it was the branch that always ran.

Then a third defect surfaced while fixing the second: **the patterns were
case-sensitive.** The real offenders were capitalised section headers
(`/* ── Superfícies ── */`), so a rebuilt list of fifteen patterns still passed over the
file. Caught only because the guard was planted by hand.

**Delivered:** a curated, case-insensitive word list; `template/next/src` and
`template/next/tests` walked unconditionally; one deliberate exception
(`src/app/(marketing)/page.tsx`, real pt-BR sample copy behind `lang="pt-BR"`, listed
in the checker and asserted to exist). Everything translated.

`tests/rules-contract.test.mjs` plants the failure in a temp fixture — including the
capitalised headers — and a separate test asserts the rule does **not** fire on
`commands`, `version`, `title`, `resource`, `conclude`, `edit`, `configuration`,
`ignored`, `validation`, `documentation`, `implementation`, `repository`. A rule that
cries wolf gets deleted, and deleting it loses the guarantee entirely.

### 1.3 The ROADMAP lying about itself

Two sections both titled `## 🧭 Planned`, phases 6–10 closed but absent from the closed
table, and phases 9 and 10 never archived — their reasoning existed nowhere else.
Meanwhile `specs/PLAN.md` carried a `[-]` task from phase 6 **since phase 8**, pointing
an agent at finished work, in a file whose own header says exactly one `[-]` exists.

**Delivered:** one `Planned` heading, a `📚 Closed phases in detail` section, the two
missing archives written, the stale `[-]` removed.

### 1.4 The README's SKILLS table listing 3 of 8 skills

Two places, two different wrong lists: 3 of 8 in the table, 6 of 8 in the tree
sketch. Five real automations — including the one you are reading this with — were
undiscoverable.

**This is also where a guard was built in the wrong place first.** The obvious fix is to
teach `check:facts` a new claim type. It is the wrong home, and the reason is worth
recording: `check-facts` recomputes a **number** a document claims. A table that lists
3 of 8, a duplicated heading, and a closed phase with no archive are **structural**
claims — properties a document must have. Folding both kinds into one script means one
exit code for two different failures, with messages that blur together.

So they live in `tests/docs-structure.test.mjs`, which asserts: the table lists every
skill, lists no ghost skill, the ROADMAP has exactly one `Planned` section, every
closed phase is archived and every archived phase is mentioned, the PLAN works the
lowest *open* phase, and the PLAN has at most one `[-]`.

Both of those last two assertions were **wrong on first write** and the test said so:
the first demanded the PLAN match the *highest* described phase (12 and 13 are planned,
not started), and its phase-done regex was greedy enough to swallow the ✅ and report
every phase as open. Both were fixed by reading the failure, not by relaxing the test.

---

## 2. The three product gaps

### 2.1 `--template` offers a choice of one

The CLI accepts a template name, validates it against `TEMPLATES`, and prints
`Use: next or none`. A flag with one valid value is a hardcoded decision wearing an
option's clothing — and it is *proved* hardcoded by `SKILLS/dogfood/dogfood.mjs`, whose
gate list and assertions name `next` literally.

**Deferred to phase 12.** It stays in the ROADMAP as its own phase rather than being
quietly dropped, because "the pipeline works for more than one template" is a claim
that only becomes true when there *is* a second template to walk.

### 2.2 The theme was a feature of one template, not an asset of the package

Every token lived inside `@theme` in `template/next/src/app/globals.css`. The design
system was therefore inseparable from one framework, and the README's claim that it is
the author's own reusable system had no artifact behind it.

**Delivered:** `themes/executive/tokens.css` is the canonical source, shipped in the
published package and exported at `./themes/*`. Each template keeps a byte-identical
copy at `src/app/theme.css` and imports it.

**The copy is not a preference — it is a bundler constraint, and it nearly broke a
guard.** The first attempt imported the canonical file across directories, which
Turbopack rejects outright:

```
FileSystemPath("").join("../../themes/executive/tokens.css") leaves the filesystem root
```

So the tokens must physically live inside the app. Two copies of one design is exactly
the arrangement that rots, so `tests/theme.test.mjs` asserts they are byte-identical,
that every template imports its copy, that no template still declares `@theme` inline,
and that the scaffold writes the canonical file into a fresh app.

Verified against a **real build**, not an assumption: `npm run build` in
`template/next` succeeds, and the emitted bundle contains `--color-primary:#baf336`
plus `bg-surface-raised` — a utility that can only exist if the token was registered
through `@theme` in the imported file.

**And RULE 7 nearly went vacuous in the move.** It compares `DESIGN.md` against the
tokens by looking for tokens in one of the files, so pointing it at a file that no
longer has any produces *zero findings and a green run* — the same class of failure as a
fact check with no target. It now reads `themes/executive/tokens.css` and **fails when
it reads zero tokens**, printing how many it compared:

```
(RULE 7 compared 35 tokens against 27 documented)
```

A guard that cannot report "I checked nothing" is a guard that cannot lie by omission.

### 2.3 A gap this phase invented, and then caught in itself

The audit originally reported a third product gap: *"five stacks documented by name
and not by content — `stacks/` indexes `api.md`, `observability.md`, `security.md`,
`docker.md`, `rust.md`, and none exists."*

**That was false.** The router in `stacks/README.md` lists exactly the files that
exist. Grepping the repository for those five names finds them in **two places, both
written during this phase** — this archive and `docs/CHANGELOG.md`. Nowhere else. The
claim was not discovered in the code; it was manufactured while writing the report, and
then filed as a finding.

So the third gap is not a gap, and no five rule files were written. Writing them would
have been the worst possible outcome: five documents nobody asked for, created to
satisfy a finding that never existed, adding roughly a thousand lines of rules to a
repository whose stated problem is too much rule text.

**Why it happened, and why it is worth more than the other three findings.** A claim
about what a file *contains* feels verifiable while you are writing it, and nothing
re-reads a report. The three real defects were each caught by a command; this one was
caught by a single `grep` run *after* the report was already committed.

That is the same failure this phase exists to correct, committed by the auditor. So
the correction is enforced, not just written down:

- `tests/docs-structure.test.mjs` asserts that **every file the stacks router names
  exists**. That is the actual promise surface of a router, and it is now checkable.
- The rule applied here is the one worth generalising: **before filing a finding,
  prove the thing does not exist — with a command, not with a recollection.** A defect
  report is itself a document, and this repository has a history of documents that lie.

Five real stack documents may still be worth writing someday. Not as the repayment of
a finding that never was, and not in an audit phase.

---

## 3. What this phase cost, and what it bought

**Cost:** 18 tests added (115 → 133), and coverage went *down* slightly
(line 98.83 → 98.48, function 95.76 → 94.21) because a new module's branches are
mostly error paths. The floors held, and the honest reading is that the percentage
moved because the denominator grew.

**Bought:** three guards that plant their own failure instead of trusting an exit code
that was previously lying, and one theme that is finally an artifact.

**The lesson, stated once so it is not re-learned:**

> A green check is a claim, not a proof. This repository shipped a language rule, a
> fact checker and a link checker for months, and all three were green over a design
> system written in the wrong language, a README listing 3 of 8 automations, and a
> ROADMAP with two sections both titled "Planned". Not one of them was lying. They
> were answering a different question than the one being asked — and a guard that
> cannot report "I found nothing" will happily pass forever.

Every guard added in this phase is therefore required to fail when it finds nothing,
and required to prove it by planting the failure. `tests/rules-contract.test.mjs`,
`tests/docs-structure.test.mjs`, `tests/theme.test.mjs` and
`tests/skill-entrypoints.test.mjs` are that requirement, written down.

## Carried into phase 12

- A second template, with `dogfood` generalized to walk N templates.
- The five stack documents the router promises.