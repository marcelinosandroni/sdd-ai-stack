# ✅ TASK [TASK NAME]

> 🛑 **FIXED RULE (AI agent, READ THIS):**
> 1. The dev has ADHD, time blindness, and zero patience for junk.
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

## 🧪 Acceptance criteria (BEHAVIOUR, not commands)

> Commands prove the code compiles. Criteria prove the code is right.
> Write these BEFORE writing the code. If you cannot state the behaviour, you
> do not understand the task yet.

- [ ] Given `[precondition]`, when `[user action]`, then `[observable result]`
- [ ] Invalid input `[x]` → `[specific error message on that field]`, and the
      submit button is disabled
- [ ] Unauthenticated request → `401`, and **no row is written**
- [ ] Authorised but forbidden role → `403`, and **no row is written**
- [ ] Downstream failure (repository throws) → the user sees `[message]`, the
      error is not swallowed, and the form stays usable
- [ ] Keyboard only: the flow completes with Tab/Enter, and the focused element
      has a visible ring
- [ ] Reloading the page after the write shows the new state
- [ ] Accessibility: every input has a `<label>`; errors are wired through
      `aria-describedby`; async results announce via `role="status"`/`role="alert"`

## 🔒 Security checklist (any action, query, route or proxy)

- [ ] A Server Action is a **public** HTTP endpoint: auth runs before validation
- [ ] Authorization is enforced in the data layer, not only in the UI
- [ ] A forged `x-middleware-subrequest` cannot bypass `proxy.ts` (CVE-2025-29927)
- [ ] No secret, token or `.env` value reaches the client bundle
- [ ] Inputs validated server-side with a schema; the client check is a courtesy

## 🏁 Definition of Done (success criteria)

- [ ] `npm run typecheck` → exit 0
- [ ] `npm run lint` → 0 errors, 0 warnings
- [ ] `npm run test` → all green
- [ ] `npm run test:e2e` → all green **against the production build**, not dev
- [ ] `npm run build` → ✓ Compiled successfully
- [ ] Every acceptance criterion above has a test that would fail without this change
- [ ] `npm run test:coverage` did not regress (or `npm run check:coverage` in this
      template repo — the generated app has no such script, `vitest run --coverage`
      is the equivalent)
- [ ] Zero `any` in the new code
- [ ] No dead code: every new export is imported somewhere (`grep` it)
- [ ] Colours/styles use the [DESIGN.md](../../DESIGN.md) tokens (if you touched UI)
- [ ] Green evidence pasted into the reply
- [ ] `specs/PLAN.md` updated to `[x]`
