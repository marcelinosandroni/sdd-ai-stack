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

## Current phase: 4 — Site and responsive (DONE)

> Status: ✅ shipped, pending the first real publish of 0.3.x
> History: [0 Bootstrap](./history/phases/phase-0-bootstrap.md) ·
> [1 English](./history/phases/phase-1-english.md) ·
> [2 All stacks](./history/phases/phase-2-all-stacks.md) ·
> [3 Rules that work](./history/phases/phase-3-rules-that-work.md) ·
> [4 Site and responsive](./history/phases/phase-4-site-and-responsive.md) — all ✅

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
[-] - Publish 0.3.1 for real. The npm registry still serves 0.1.17: every fix in
      phases 3 and 4 exists only on GitHub. The release workflow has never run with
      its three guards (CI green on the commit, template gates re-run, tarball
      contents) in place.

### Phase exit criteria
- [x] Every task `[x]` with the test evidence pasted
- [x] `npm test && npm run check:coverage && npm run check:rules && npm run check:docs` green
- [x] template and site gates green
- [x] `docs/CHANGELOG.md` updated
- [x] `specs/history/phases/` written for every closed phase
- [ ] `npm view create-sdd-ai-stack version` returns 0.3.1
- [ ] SemVer tag pushed and the Release run concluded green

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
