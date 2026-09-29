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

## Current phase: 0 — Bootstrap

> Status: ✅ done (template + rules + CLI)
> History: [`history/phases/phase-0-bootstrap.md`](./history/phases/phase-0-bootstrap.md)

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
