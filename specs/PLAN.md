# 🎯 PLAN (the brain of the project)

> 🛑 **FIXED RULE (AI agent, READ THIS BEFORE YOU CODE):**
> The developer (Marcelino) has ADHD. The tasks HERE must be **microscopic**.
> If a task takes more than 1 hour, **SPLIT IT IN TWO**.
> Never skip a step. Never start step 2 without testing and committing step 1.
> Update statuses rigorously at the end of every prompt: `[ ]` (To Do), `[-]` (In
> Progress), `[x]` (Done).

> **There is exactly ONE task `[-]` at any moment.** If there are two, the agent stopped
> wrong.

---

## Current phase: 3 — Audit findings

> Status: 🚧 in progress (deep audit of the CLI, the template and the release)
> Previous: [0 Bootstrap](./history/phases/phase-0-bootstrap.md) ·
> [1 English](./history/phases/phase-1-english.md) ·
> [2 All stacks](./history/phases/phase-2-all-stacks.md) — all ✅

[x] - Wire the orphaned `CreateExampleForm` into `/app` behind real auth
[x] - E2E of the full form flow: unauthenticated, invalid, valid, banned
[x] - Boot-time env validation (`env.ts` was never imported)
[x] - `proxy.ts` exists + E2E of the security headers and the CVE-2025-29927 header
[x] - E2E against the production build, Chromium and Firefox
[x] - Real shadcn components (`components.json`, Button, Skeleton) and `loading.tsx`
[x] - `stacks/git.md`: tag examples match the `0.x` version in `package.json`

[-] - Release must not publish when CI is red
[ ] - Cover `scaffold --git` and `scaffold --submodule` with real git
[ ] - End-to-end test of `bin/create-sdd-ai-stack.mjs`
[ ] - Line coverage on the CLI library, with a threshold
[ ] - Branch protection, Dependabot and an `npm audit` gate
[ ] - Behavioural acceptance criteria in `specs/tasks/TASK_TEMPLATE.md`
[ ] - Document the lockfile decision; add the evidence index

### Phase exit criteria
- [ ] All tasks `[x]` with test evidence pasted
- [ ] `npm test` (library, with coverage) and the template gates green
- [ ] `docs/CHANGELOG.md` updated
- [ ] `specs/history/phases/phase-3-audit-findings.md` written
- [ ] SemVer tag created — **only after a green CI on `main`**

### How to use this file

1. Replace the block below with your project's current phase.
2. Name the task `TASK-<PHASE>-<NUMBER>` and create the file at
   `specs/tasks/TASK-<PHASE>-<NUMBER>.md` (start from
   [the template](./tasks/TASK_TEMPLATE.md)).
3. Mark `[-]` **before** you start coding. Mark `[x]` **after** you paste the green
   terminal output.
4. When the phase closes, archive it in `history/phases/` and create the SemVer tag.

---

```markdown
## Current phase: [N] — [PHASE NAME]

[ ] - [TASK-1.1](./tasks/TASK-1.1.md) - [to do]
[-] - [TASK-1.2](./tasks/TASK-1.2.md) - [in progress]   ← the only in-progress task
[ ] - [TASK-1.3](./tasks/TASK-1.3.md) - [to do]

### Phase exit criteria
- [ ] All tasks `[x]` with test evidence pasted
- [ ] `npm run typecheck && npm run lint && npm run test && npm run build` green
- [ ] `docs/CHANGELOG.md` updated
- [ ] `specs/history/phases/phase-N-finished.md` written
- [ ] SemVer tag created
```

---

## 📋 Delivery checklist (paste at the end of every task)

```markdown
**Evidence:**
- `npm run typecheck` → exit 0
- `npm run lint` → 0 errors
- `npm run test` → N passed
- `npm run test:e2e` → N passed
- `npm run build` → ✓ Compiled successfully

**Files touched:** (list them — max 5 per step)
**Commit:** `type(scope): description. (Agent: <Tool> - <Model>)`
```
