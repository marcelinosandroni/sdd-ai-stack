# Phase 12 — More than one template (CLOSED)

> The phase that was planned as "prove the pipeline is not hardcoded to Next.js" and
> delivered as **three defects nobody could see**, each of which needed the second
> template merely to become visible.

**Problem.** `--template <next|none>` accepted a list of one. `TEMPLATES` was
`["next"]`, and `none` is what `--rules-only` already did. A flag with one valid value
is a hardcoded decision wearing an option's clothing.

It was *proved* hardcoded in three places, and only one of them was allowed to change:

| Place | What it hardcoded |
| --- | --- |
| `SKILLS/dogfood/dogfood.mjs` | `template: "next"`, and a gate list and assertions written for Next |
| `.github/workflows/ci.yml` | a single job that generated `next` and ran its gates |
| `.github/workflows/release.yml` | the essential-files guard named `template/next/…` |

So "the pipeline is not hardcoded" was not a claim this repository could make. It could
only claim "Next works".

---

## 1. What shipped

`template/spa` — **Vite 7 + React 19 + TypeScript**. Not a smaller Next: no App Router,
no server components, no `proxy.ts`, no `shadcn`, no prerender pass. What is left is
the part that was always supposed to be framework-independent — the SDD rules, the
design tokens, and the gates.

One vertical slice in `domain / application / infrastructure / ui`, five unit tests,
five E2E tests against the **production** build, and the same
`themes/executive/tokens.css` byte for byte.

Gates, in the template's own checkout and in a generated app: `typecheck`, `lint`,
`test`, `build`, `test:e2e`. All green.

### Why a frontend template, and not a backend one

The phase noted a second problem: seven backend rule sets ship with no `npx` path, so
a Python or Go user gets rules and no project. This phase did not solve that, and the
reason is worth stating rather than hiding.

A second template exists to answer one question — *does the pipeline depend on the
framework?* A Vite SPA answers it sharply, because it shares almost nothing with Next
below the surface: a different bundler, a different module graph, no server at all.
And it is the only second template that could also close phase 13's loop, by being
able to **consume the same design tokens**. A FastAPI template would have answered the
framework question and left the design system still welded to one stack.

The backend gap is real and remains open. Two templates prove the seam; seven would
prove the same thing more slowly, and every one of them would need a different gate
matrix, a different install path, and a different set of questions about what "the
rules apply" even means for a server-rendered app. That is worth its own phase, with
its own decisions, rather than being appended here to make a number bigger.

---

## 2. Three defects the second template exposed

This is the part that justifies the phase. Adding a template was mechanical; **these
were not visible at all** with only one.

### 2.1 `create-feature` was a Next-only skill wearing a stack-agnostic name

It emitted, unconditionally, into every app it ran in:

```ts
import "server-only";
import { revalidatePath, updateTag } from "next/cache";
import { ForbiddenError, requireUser, UnauthorizedError } from "@/shared/server/auth";
```

`server-only` and `next/cache` are Next packages. `@/shared/server/auth` exists only in
the Next template. So **every slice the skill generated outside a Next app could not
typecheck** — and no gate could say so, because there was no second app to typecheck.

This is the same shape as the deleted `create-feature.sh`: a file with one tested path
and one documented path, where only one of them was ever exercised.

**Delivered.** `detectStack()` reads the app — `next.config.ts`, falling back to the
`next` dependency — and the Next-specific parts became precomputed constants
(`CACHE_IMPORTS`, `AUTH_IMPORT`, `AUTH_STEPS`, `CACHE_STEP`, `STACK_DOC`). The five
steps of a write are the same in both stacks; only the machinery around them differs,
so the differences are substituted rather than duplicated. Two near-identical
70-line templates would have drifted apart the first time somebody fixed a typo in
one of them.

`tests/templates.test.mjs` proves both directions: the SPA slice contains no
`next/`, no `@/shared/server/`, no `server-only` — **and** the Next slice still gets
`"use server"` and `next/cache`. A one-sided fix would have looked identical from one
side.

### 2.2 `npm run lint` had never worked inside a template folder

```
Biome couldn't find an ignore file in the following folder: …\template\next
```

The npm packer never includes a file literally named `.gitignore` — it is one of its
own default ignores. So each template stores it as `gitignore`, and `restoreGitignore()`
renames it in every generated app. Which means **the template's own working copy has
no `.gitignore`**, and Biome with `useIgnoreFile: true` refuses to start at all.

It was invisible because CI lints the *generated* app, where `.gitignore` exists. The
failure was in the one place a developer reaches for first, and it was reported by
nobody, because nobody was running it there.

**Delivered.** `useIgnoreFile: false` in both templates, with `files.includes` as the
authoritative ignore list — which it effectively always was. Turning the flag off then
revealed **real lint errors nobody had ever seen**, and they are fixed:

- `radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)` — Biome's CSS parser
  read the function calls as selectors. Rewritten as `#ffffff08 1px, #0000 1px`,
  which is the same colour and parses.
- formatting across `biome.json`, `next-env.d.ts` (now excluded — Next generates it),
  and a multi-line gradient.
- **a genuine CSS bug I introduced myself**: while moving the theme out of
  `globals.css` in phase 13 I left the micro-dot grid's two declarations at the
  `@layer` root, outside any rule. Invalid CSS, silently dropped by the browser, and
  invisible to `next build`. Biome parsed the file and refused it the moment the
  linter was able to run at all.

### 2.3 `check-facts` read one loop out of two

`essentialCount()` matched the **first** `for f in …` loop in `release.yml`. Making
that guard per-template added two more loops, and the checker silently ignored them —
so the reported number went *down* while the actual requirement went *up*.

**Delivered.** It counts every loop now, and the reasoning is in the function: a
checker that reads part of the thing it checks reports a smaller number with exactly
the same confidence as a correct one.

This one needed no second template to be real — it needed only a change in the
neighbouring file. It was found anyway, by a guard this repository had already built.

---

## 3. One source of truth, three readers

The recurring shape of this phase: three places enumerated templates, and every one of
them would have to be remembered when a third template appears. So all three now read
the same constant.

| Reader | How |
| --- | --- |
| the CLI | `TEMPLATES` (it already did — validating against the list is why `--template` was always extensible) |
| `SKILLS/dogfood` | imports `TEMPLATES`; `--templates=next,spa` filters |
| the CI template job | a `templates` job emits the list, a matrix expands it |
| `release.yml` (tarball guard) | rebuilds the list from `lib/constants.mjs` and loops |
| `release.yml` (dry run) | loops, generating and gating each template |

`tests/templates.test.mjs` asserts the hardcoded `next` is **absent** from `dogfood`,
not merely that a loop exists. Asserting the presence of the fix would pass just as
well with `template: "next"` still written on the line below.

---

## 4. Evidence

```
npm test        → 146 tests, 146 pass, 0 fail          (was 110 before phase 11)
check:coverage  → line 98.49% (floor 95%), branch 89.24% (floor 85%), func 94.21% (floor 90%)
check:docs      → 65 documents, every relative link resolves
check:facts     → 1 claim(s) verified (146 tests, 65 documents)
check:rules     → (RULE 7 compared 35 tokens against 27 documented) — no violation
dogfood         → 12 checks passed across 2 templates (next, spa)

template/spa    typecheck → exit 0
                lint      → 1 info only (pre-existing Biome schema notice)
                test      → 5 passed
                build     → ✓ 137 modules transformed
                test:e2e  → 5 passed
template/next   lint      → clean, for the first time
                build     → ✓ Compiled successfully

npm pack        → template/spa/src/app/theme.css  and  themes/executive/tokens.css  both present
```

Coverage barely moved (98.48 → 98.49) because most of this phase is new files rather
than new branches in old ones — the honest reading is that the denominator grew.

---

## 5. The lesson

> **A pipeline validated against one option is not a pipeline. It is a script.**

Phase 11's lesson was that a guard can be green and prove nothing. This phase is the
same lesson from the other side: a *tool* can be correct and constrained to one
provider, and every test it runs will confirm the one thing that was never in question.
`dogfood` reported a clean cycle for years. It was walking the default.

The second template's real value was not the second template. It was that adding one
made three assumptions visible — in a skill, in a lint configuration, and in a fact
checker — and every one of them had been there the whole time, unremarked, because
there was only one way to be wrong.

## Carried forward

- The backend stacks still ship rules with no `npx` path.
- `docs/CHANGELOG.md` is still in Portuguese. `check-rules` does not scan `.md` in
  repository mode, so nothing catches it — the same blind spot as phase 11's RULE 1,
  one directory layer over.