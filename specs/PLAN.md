# 🎯 PLAN (the brain of the project)

> 🛑 **FIXED RULE (AI agent, READ THIS BEFORE YOU CODE):**
> The developer has ADHD, time blindness, and zero patience for junk.
> The tasks HERE must be **microscopic**.
> If a task takes more than 1 hour, **SPLIT IT IN TWO**.
> Never skip a step. Never start step 2 without testing and committing step 1.
> Update statuses rigorously at the end of every prompt: `[ ]` (To Do), `[-]` (In
> Progress), `[x]` (Done).

> **There is exactly ONE task `[-]` at any moment.** If there are two, the agent stopped
> wrong.

> **The first task of a brand-new project is not a feature.** It is replacing the
> placeholders with the real product: `APP.md`, the `DESIGN.md` tokens, and the first
> vertical slice. A scaffold with `[YOUR APP NAME]` still in it is not a scaffold, it
> is a placeholder with a build script.
>
> A generated app receives a **clean** phase 0 with an empty history. This repository
> does not: it is the template, and it carries the phases it went through.

---

## Current phase: 11 — The audit (IN PROGRESS)

> Status: 🔨 4 defects found by re-reading the repository, not by running it
> History: [0 Bootstrap](./history/phases/phase-0-bootstrap.md) ·
> [1 English](./history/phases/phase-1-english.md) ·
> [2 All stacks](./history/phases/phase-2-all-stacks.md) ·
> [3 Rules that work](./history/phases/phase-3-rules-that-work.md) ·
> [4 Site and responsive](./history/phases/phase-4-site-and-responsive.md) ·
> [5 First real publish](./history/phases/phase-5-first-real-publish.md) ·
> [6 No age badly](./history/phases/phase-6-no-age-badly.md) ·
> [7 A project that belongs to you](./history/phases/phase-7-your-project.md) ·
> [8 Proving the rules](./history/phases/phase-8-proving-the-rules.md) ·
> [9 The rules in other tools](./history/phases/phase-9-other-tools.md) ·
> [10 A template that does not lie](./history/phases/phase-10-a-template-that-does-not-lie.md)

> ⚠️ **This file is the template's own PLAN, not a fresh project.** A generated app
> gets a clean phase 0; this repository has eleven phases. Do not confuse the
> two — that mistake is exactly what `RULE_COPY_SKIP` in `lib/constants.mjs` exists
> to prevent in the other direction.

### Tasks

[-] - The `create-feature.sh` mirror: `SKILL.md` documented the bash entry point,
      the bash script generated no test, and the CI guard exercised only the
      `.mjs`. Every agent on Linux or macOS landed on the unfixed path — the exact
      bug phase 8 declared closed. Delete the mirror, point the doc at the one
      entry point, and assert the mirror cannot come back.
[ ] - The English rule that never fired. `check-rules` RULE 1 exists, is named in
      CI, and passed over a design system documented entirely in Portuguese: its
      pattern list was built from one remembered string, and `template/next/src`
      was never walked at all, because RULE 1 only ran when the argument was a
      generated app and CI passes none.
[ ] - Every distributed file in English: the tokens' comments and placeholders,
      the two skills that print user-facing Portuguese, the library comments, and
      the package description.
[ ] - The ROADMAP's two "Planned" sections, the phases 9 and 10 that were closed
      but never archived, and the stale `[-]` phase 6 task this file carried since
      phase 8 — the rule says exactly one, and it was pointing at finished work.
[ ] - The README's SKILLS table: 3 of 8 listed in one place, 6 of 8 in another,
      while `check:facts` — the guard built to stop this repository lying about
      itself — verified numbers only and had no opinion about enumerations.
[ ] - A portable theme: the tokens extracted out of `template/next/` into an
      artifact another stack can import, so the design is an asset of the package
      rather than a feature of one template.
[ ] - A second template, with `dogfood` generalized to walk N templates — the
      pipeline must not be hardcoded to Next.js for the claim to be true.

### Phase exit criteria
- [ ] Every task `[x]` with the test evidence pasted
- [ ] `npm test && npm run check:coverage && npm run check:rules && npm run check:docs` green
- [ ] `npm run check:facts` green, with a structural claim in it
- [ ] `node SKILLS/dogfood/dogfood.mjs` green
- [ ] `specs/history/phases/phase-11-the-audit.md` written
- [ ] `docs/CHANGELOG.md` updated

### How to use this file

1. Create the phase block when the phase changes: `## Current phase: N — NAME`.
2. Tasks live under `### Tasks`, one per line, `[ ]` / `[-]` / `[x]`.
3. Mark `[-]` **before** starting. Mark `[x]` **after** you paste the green output.
4. When the phase closes, archive it in `history/phases/`, delete the finished task
   files, and tag the release.

---

## 📋 Delivery checklist (paste at the end of every task)

```markdown
**Evidence:**
- `npm run typecheck` → exit 0
- `npm run lint` → 0 errors
- `npm run test` → N passed
- `npm run build` → ✓ Compiled successfully
- `npm run test:e2e` → N passed

**Files touched:** (list them — max 5 per step)
**Commit:** `type(scope): description. (Agent: <Tool> - <Model>)`
```

Full gate and what each command proves: [`PREFLIGHT.md`](../PREFLIGHT.md).
