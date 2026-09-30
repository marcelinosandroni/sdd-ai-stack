# 🗺️ ROADMAP

> The macro view. **Don't work from this** — use [`PLAN.md`](./PLAN.md) for the task at
> hand.

> ⚠️ **This roadmap describes the template, not a consuming product.** It used to list
> generic phases ("multi-tenant, billing, growth loop") that belong to a product built
> *with* this template, not to the template itself. That made it useless here: the rule
> below says no task may enter the PLAN without existing in the ROADMAP, and the real
> work — six phases of rules, site and release — was in none of them.

---

## ✅ Closed

| Phase | Name | What it changed |
| --- | --- | --- |
| [0](./history/phases/phase-0-bootstrap.md) | Bootstrap | Next.js 16 template, the SDD rules, the design system, the `npx create-sdd-ai-stack` CLI |
| [1](./history/phases/phase-1-english.md) | English | English by default, across code, docs and specs |
| [2](./history/phases/phase-2-all-stacks.md) | All stacks | 17 stack files behind a single router |
| [3](./history/phases/phase-3-rules-that-work.md) | Rules that work | 13 findings from letting an agent follow the rules, and the check that catches them |
| [4](./history/phases/phase-4-site-and-responsive.md) | Site and responsive | The site, copy buttons, analytics, and a responsive rule with teeth |
| [5](./history/phases/phase-5-first-real-publish.md) | First real publish | `0.3.1` live on npmjs and GitHub Packages, OIDC, and eight release bugs found by running the release |

---

## 🧭 Planned

Each phase below exists because something is **broken or false today**, not because
it sounds useful. The problem is named, not the solution.

### Phase 6 — A template that does not age badly

**Problem.** `template/next` pins `next: ^16.3.7`, and CI broke on its own when
`16.3.8` was unpublished from the registry mid-run. Dependabot covers the repository
root but not the template inside it, so the template's dependencies are never
updated, and when they break nothing is ready to fix them.

**Scope out.** A lockfile in the template — the consumer commits their own, and
shipping ours would fight them.

### Phase 7 — The first ten minutes

**Problem.** `npx create-sdd-ai-stack my-app` produces an app that compiles, but
nothing in it teaches the first release. The generated project inherits the rules
and not the ritual, so the user's first tag is still a manual guess.

**Scope out.** Making the template's release opinionated about the consumer's
registry or package name.

### Phase 8 — Proving the rules in a generated project

**Problem.** Phase 3 validated the rules by letting an agent follow them in *this*
repository. They have never been validated in a project the template *generated*.
The rules may depend on context this repository happens to have.

**Scope out.** Any change to the rules themselves — this phase measures, it does not
tune.

### Phase 9 — The rules in other tools

**Problem.** `PRODUCT.md` promises Claude Code, Cursor and Copilot. The rules live
in `AGENTS.md`; Claude Code natively reads `CLAUDE.md` and Copilot reads
`.github/copilot-instructions.md`. Either the bridge exists or the promise is
wrong.

**Scope out.** Duplicating the rules per tool — pointers only, or the rules drift.

### Phase 10 — A template that does not lie about itself

**Problem.** `docs/PRODUCT.md` claimed 27 tests while the suite had 79. A document
that misstates a verifiable fact teaches an agent to trust no document, which is
the exact failure mode this template exists to prevent.

**Scope out.** Checking prose quality, style, or grammar. Verifiable claims only.

---

## 🧭 How this roadmap talks to the PLAN

```text
ROADMAP.md   →  macro, the phases and their problems     (vision)
    ↓
PLAN.md      →  this week                 (one task at a time)
    ↓
tasks/       →  this task, in detail      (micro-steps)
    ↓
commit       →  this task, one step       (evidence)
```

> Rule: **no task enters the PLAN without existing in the ROADMAP** (even as a single
> line).