# ✅ Phase 4 — The site, and making responsive a rule (DONE)

> **Scope:** a public page for the project, and the rule that was missing the whole time.
> **Version:** 0.3.1
> **PR:** #18

---

## 🧭 What it was

No public page. The README was the only description of the project, and a README is a
worse first impression than a site. `DESIGN.md` had breakpoints and no rule: it described
a mobile layout without ever saying *you must test one*.

## 🧭 What it became

### The site

`site/` is a static Next.js export for **sdd.marcelinosandroni.com**. Eight sections: what
SDD is, why it works, the six practices, how AI sits in the loop, how to install, the
recommended tooling, the author's track record, and how to contribute.

**Same design tokens as the portfolio and as `DESIGN.md`** — `#BAF336`, `#34D399`,
`#93C5FD`, Manrope / JetBrains Mono / Playfair Display, and the same dot-grid backdrop. One
palette across the resume, the site, and every app the template generates.

The author section is a pointer, not a second resume: a name, one paragraph, and four links
(resume, LinkedIn, GitHub, email). Duplicating the numbers would have made the page stale the
moment the portfolio changed, and a stale metric is worse than no metric — it reads as a
claim nobody checked.

### §4b — responsive, with teeth

`DESIGN.md` gained a section that is a law rather than an observation:

- **Three named viewports** — 390 (iPhone), 768 (iPad), 1440 (the width it was drawn at).
  Not "responsive" in the abstract.
- **Four hard rules** — no horizontal scroll, no tap target under 44×44, no body text under
  13px, and no content that exists only above 768px.
- **The assertions that prove them**, copy-paste ready, and the Playwright setup that runs
  two projects instead of one.

The suite now runs a **mobile** project, so a desktop-only green is no longer possible. That
is the actual change: before, a layout could pass at 1440px and ship broken.

## 🐛 The site was not responsive

Measured, not assumed: `scrollWidth` was **610 against a clientWidth of 390**. Every phone
visitor got a page they could pan sideways to read. Three causes, and all three were the
same mistake wearing different clothes:

| Cause | Why it broke | Fix |
| --- | --- | --- |
| A table with `min-w-[640px]` | a three-column comparison of prose in a sideways scroller is a table nobody reads on a phone | stacked cards below `md` |
| Header nav as a flex child | a flex/grid child defaults to `min-width: auto`, which resolves to min-content, and a command with no spaces is 594px wide | `min-w-0`, and a wrapped nav instead of a scroller |
| Two `lg:grid-cols-2` grids | same missing `min-w-0` | `[&>*]:min-w-0` |

**`overflow-x-auto` did not save it.** The scroll container never got small enough to
scroll, because the track refused to shrink below the content. That is the part worth
remembering: a scroller is not a layout strategy.

## 🔍 Two scripts, so the finding is repeatable

| Script | What it does |
| --- | --- |
| `npm run audit:layout` | checks all three viewports and names the offending element |
| `scripts/why-overflow.mjs` | walks to the shallowest offender and prints its ancestor chain |

The chain is the diagnosis. "Something is 534px wide" is a symptom;
`<html><body><main><section#contribute><div.grid><div>` is the cause.

**Both scripts had to be corrected to be worth trusting.** The first reported elements inside
working scroll containers as overflow; the second reported the whole wide subtree instead of
the cause. An audit that cries wolf gets ignored, and then it protects nothing.

## 🧭 Copy button and analytics

The install command is the whole pitch. Asking a visitor to select 31 characters out of a
`<pre>` and press Ctrl+C on a phone is the highest-friction thing this site could do, so
every code block has a copy button — with a selection-based fallback behind
`navigator.clipboard`, because a copy button that silently does nothing is worse than none.

Vercel Analytics is mounted. It renders a script and no markup, so a test asserts it does not
shift the header.

## 🧪 Evidence

```text
audit:layout   390/390 · 768/768 · 1440/1440
               no overflow, no tap target under 44px, no body text under 13px

e2e            42 passed (mobile + desktop projects)
typecheck      0 errors
lint           0 errors
unit           4 passed
build          ✓ compiled
```

21 new E2E: no horizontal scroll, 44px tap targets, the 13px body floor, the primary action
reachable without a gesture, the copy button, the analytics mount, and the author links.

## ✋ One rule softened, honestly

§4b.2 was written "no text below 13px", and the design system's own `label-mono` is 11px by
definition. Rather than shrink the design or pretend the rule held, it now says *body copy*
is 13px and *chrome* is 11px — and the audit knows the difference by walking the ancestor
chain, because font size is inherited.

A rule that cannot be obeyed is a rule that gets ignored, and once it is ignored it protects
nothing. The honest version of the rule is the one worth writing.

## 🏷️ Release

```bash
git tag v0.3.1
```
