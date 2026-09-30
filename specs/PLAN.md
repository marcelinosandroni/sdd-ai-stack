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

## Current phase: 6 — A template that does not age badly (DONE)

> Status: ✅ the Dependabot ignore is no longer inverted, and the runtime pin is
> asserted equal in three places
> History: [0 Bootstrap](./history/phases/phase-0-bootstrap.md) ·
> [1 English](./history/phases/phase-1-english.md) ·
> [2 All stacks](./history/phases/phase-2-all-stacks.md) ·
> [3 Rules that work](./history/phases/phase-3-rules-that-work.md) ·
> [4 Site and responsive](./history/phases/phase-4-site-and-responsive.md) ·
> [5 First real publish](./history/phases/phase-5-first-real-publish.md) ·
> [6 A template that does not age badly](./history/phases/phase-6-no-age-badly.md)

> ⚠️ **This file is the template's own PLAN, not a fresh project.** A generated app
> gets a clean phase 0; this repository has five closed phases. Do not confuse the
> two — that mistake is exactly what `RULE_COPY_SKIP` in `lib/constants.mjs` exists
> to prevent in the other direction.

### Tasks

[x] - [PR #10](./history/phases/phase-3-rules-that-work.md) - Five real bugs, the dead
      example feature, gates that cannot be bypassed
[x] - [PR #15](./history/phases/phase-3-rules-that-work.md) - Thirteen findings from
      letting an agent follow the rules, and the check that catches them
[x] - [PR #18](./history/phases/phase-4-site-and-responsive.md) - The site, copy
      buttons, analytics, and a responsive rule with teeth
[x] - Publish 0.3.1 for real. The npm registry still served 0.1.17: every fix in
      phases 3 and 4 existed only on GitHub. The release workflow had never run
      with its three guards in place.
[x] - [PR #23](./history/phases/phase-5-first-real-publish.md) - The publish jobs
      ran on Node 22, below the coverage floor
[x] - [PR #24](./history/phases/phase-5-first-real-publish.md) - The GitHub
      Packages registry leaked into `prepublishOnly`
[x] - [PR #25](./history/phases/phase-5-first-real-publish.md) - The job
      invalidated its own gate by rescoping the name
[x] - [PR #26](./history/phases/phase-5-first-real-publish.md) - Removing the
      registry also removed the auth, and the dry run could not see it
[x] - [PR #27](./history/phases/phase-5-first-real-publish.md) - A half-succeeded
      release could not be resumed
[x] - [PR #29](./history/phases/phase-6-no-age-badly.md) - The documentation lied
      about four numbers it could have verified; `check:facts` makes prose falsifiable
[-] - [Phase 6](./history/phases/phase-6-no-age-badly.md) - Dependabot's
      `@types/node` ignore blocked the safe bumps and let every major through. The
      runtime pin lives in three files that must agree, and nothing enforced it.

### Phase exit criteria
- [x] Every task `[x]` with the test evidence pasted
- [x] `npm test && npm run check:coverage && npm run check:rules && npm run check:docs` green
- [x] template and site gates green
- [x] `docs/CHANGELOG.md` updated
- [x] `specs/history/phases/` written for every closed phase
- [x] `npm view create-sdd-ai-stack version` returns 0.3.1
- [x] SemVer tag pushed and the Release run concluded green

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
