# PLANNING

> Space for **planning and refinement** before something becomes a task in
> [`../specs/PLAN.md`](../specs/PLAN.md). Here we think. In the PLAN we do.

## 🎯 How this flow works

```text
IDEA
  ↓
BACKLOG.md          captures it raw, no commitment
  ↓
REFINEMENT         here in PLANNING.md: problem, scope, decisions, risks
  ↓
PLAN.md             becomes a task, with micro-steps
  ↓
tasks/TASK-N.M.md   becomes an executable checklist
```

## 📄 Refinement template

Create `docs/planning/AAAA-MM-DD-<slug>.md` with:

```markdown
# Refinement: [Name]

## 🧠 Problem
Who suffers from what, today. No solution — just the problem.

## 🎯 Objective
One sentence. How we will know it worked (a metric).

## 🗺️ Scope
- [ ] Includes:
- [ ] Excludes: (the most valuable box to fill)

## 🧩 Entities and invariants
[the domain: what exists and what must never break]

## 🏗️ Architecture decisions
| Decision | Alternative | Why |
| --- | --- | --- |
| [e.g.] Server Action | Route Handler | no public URL, no boilerplate |

## ⚠️ Risks
| Risk | Mitigation |
| --- | --- |

## 🪓 Task breakdown
1. TASK-1.1 — …
2. TASK-1.2 — …

## ✅ Definition of Done
- [ ] measurable criteria
```

## 🎨 Visual artifacts

Anything that becomes an image (wireframe, flow, architecture diagram) goes in
`docs/planning/assets/` and is referenced from the markdown. No binaries committed in
`specs/` — the specs are text, so `git diff` stays meaningful.

## 📌 Rules

1. **Refinement never becomes code.** If it has a `diff` in the file, it became a task.
2. **Negative scope is mandatory.** "What will NOT go in" prevents half the rework.
3. **Every architecture decision becomes a line in `ARCHITECTURE.md`** once it stabilises.
4. **If a task grows past 1 hour, we split it before starting** (the `AGENTS.md` rule).
