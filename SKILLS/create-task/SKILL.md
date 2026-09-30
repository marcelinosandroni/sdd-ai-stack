# 🧩 SKILL: create-task

> Creates a task file from the template, with the right id, the right path, and
> the entry registered in [`PLAN.md`](../../specs/PLAN.md).

## 🎯 When to use it

Every time you start a task. A task the agent cannot find from `PLAN.md` does
not exist as far as the delivery flow is concerned.

## ▶️ Usage

```bash
node SDD/SKILLS/create-task/create-task.mjs <phase> <number> "<title>"

# e.g.
node SDD/SKILLS/create-task/create-task.mjs 4 1 "Add the billing portal"
```

Creates `SDD/specs/tasks/phase-4/TASK-4-1.md` from `TASK_TEMPLATE.md`, fills
the title, and inserts a `[ ]` entry into the current phase list in `PLAN.md`.

## ✅ Checklist after running it

- [ ] Mark it `[-]` in `PLAN.md` before you write code
- [ ] Fill the **acceptance criteria** — behaviour, not commands
- [ ] Fill the security checklist if the task touches an action, query or route
- [ ] If the task is bigger than an hour, run this again and split it
- [ ] `npm run typecheck && npm run lint && npm run test` — see
      [`PREFLIGHT.md`](../../PREFLIGHT.md) for what each command proves
