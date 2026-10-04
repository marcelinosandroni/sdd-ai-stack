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

## Current phase: 12 — More than one template

> Status: ✅ closed — `--template` had a choice of one; it has two, and CI proves both
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
> [10 A template that does not lie](./history/phases/phase-10-a-template-that-does-not-lie.md) ·
> [11 The audit](./history/phases/phase-11-the-audit.md) ·
> [12 More than one template](./history/phases/phase-12-more-than-one-template.md) ·
> [13 A theme that is an asset](./history/phases/phase-13-a-theme-that-is-an-asset.md)

> ⚠️ **This file is the template's own PLAN, not a fresh project.** A generated app
> gets a clean phase 0; this repository has eleven phases. Do not confuse the
> two — that mistake is exactly what `RULE_COPY_SKIP` in `lib/constants.mjs` exists
> to prevent in the other direction.

asks

[x] - `template/spa`: Vite 7 + React 19 + TypeScript. No App Router, no server
      components, no `proxy.ts`, no `shadcn`. One vertical slice in
      domain/application/infrastructure/ui, unit tests, E2E against the production
      build, and the **same** `themes/matrix/tokens.css` byte for byte.
[x] - `create-feature` detects the app's stack instead of assuming Next. It emitted
      `import "server-only"`, `next/cache` and `@/shared/server/auth`
      unconditionally, so every slice it generated outside a Next app could not
      typecheck — and no gate could see it, because there was no second app.
[x] - `dogfood` walks N templates, reading that list from `TEMPLATES` rather than
      repeating it, and the hardcoded `next` is asserted against.
[x] - CI's template job became a matrix over `TEMPLATES`, and the release guard and
      its dry run loop over every template too.
[x] - The Biome configuration that made `npm run lint` impossible inside a template
      folder. It had been broken for months and CI never saw it, because CI lints the
      generated app. Both templates now lint in their own checkout.

> **Not in this phase, and recorded rather than dropped:** the backend stacks (Go,
> Python, Java, .NET) still ship rules with no `npx` path. A second template proves the
> seam is real; seven would prove the same thing more slowly.

### Phase exit criteria
- [x] Every task `[x]` with the test evidence pasted
- [x] `npm test && npm run check:coverage && npm run check:rules && npm run check:docs` green
- [x] `npm run check:facts` green
- [x] `node SKILLS/dogfood/dogfood.mjs` green across both templates
- [x] `specs/history/phases/phase-12-more-than-one-template.md` written
- [x] `docs/CHANGELOG.md` updated

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
