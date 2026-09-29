# ✅ TASK [TASK NAME]

> 🛑 **FIXED RULE (AI agent, READ THIS):**
> 1. The dev (Marcelino) has ADHD, time blindness, and zero patience for junk.
> 2. If the whole task takes more than 1 hour, **SPLIT IT INTO TWO TASKS NOW.**
> 3. Deliver one step of code, wait for it to be tested, and **only then** move to the
>    next one.
> 4. The task filename is always `TASK-PHASE-TASK` (e.g. `TASK-1.1.md`).
> 5. Always keep it in `tasks/` and in the phase subfolder (`tasks/phase-1/`).
> 6. **EDITING ABOVE THE LINE IS FORBIDDEN.** You are only allowed to fill in the data
>    BELOW the `---` line.

---

## 🎯 Task objective

[1 line. What you want to do. E.g. "Create the AI video generation button in the video feature".]

## 📂 Where to touch

- [ ] `src/features/[x]/application/` — business rule
- [ ] `src/features/[x]/infrastructure/` — repository/adapter
- [ ] `src/features/[x]/actions.ts` — write entrypoint
- [ ] `src/features/[x]/ui/` — component
- [ ] `src/app/...` — route (routing only)
- [ ] `tests/` — tests

## 🛠️ Micro-steps (dopamine checklist)

*(RIDICULOUSLY small steps. Max 5 per task.)*

- [ ] Step 1: [e.g. Create the `IVideo.ts` interface in `domain/`]
- [ ] Step 2: [e.g. Build the dumb button layout]
- [ ] Step 3: [e.g. Wire the button to the action]
- [ ] Step 4: [e.g. Unit test for the use case]
- [ ] Step 5: [e.g. E2E for the flow]

## 🏁 Definition of Done (success criteria)

- [ ] `npm run typecheck` → exit 0
- [ ] `npm run lint` → 0 errors, 0 warnings
- [ ] `npm run test` → all green
- [ ] `npm run test:e2e` → all green
- [ ] `npm run build` → ✓ Compiled successfully
- [ ] Zero `any` in the new code
- [ ] Colours/styles use the [DESIGN.md](../../DESIGN.md) tokens (if you touched UI)
- [ ] Green evidence pasted into the reply
- [ ] `specs/PLAN.md` updated to `[x]`
