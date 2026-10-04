# 🎨 DESIGN SYSTEM — MATRIX

> **This is the visual law of the project.** If the UI doesn't follow this document, the
> UI is wrong.
> Theme: **DARK ONLY**. No light mode. No generic branding.
>
> **It describes surfaces, not products.** Every token, rule and primitive below is
> domain-neutral on purpose: reusing this system must never require editing it, and a
> rule that names a domain cannot be reused outside that domain.

---

## 🧭 0. ROUTER

| You are…                    | Read         |
| --------------------------- | ------------ |
| Picking a colour/space/font | §2 Tokens    |
| Writing/copying CSS         | §2 Tokens    |
| **Choosing a direction**    | **§1 Style & reference** |
| Building a layout/grid      | §4 Layout    |
| **Shipping anything UI**    | **§4b Responsive — required, and it has a test** |
| Button, card, badge, input  | §5 Components |
| Thinking about feedback/UX  | §6 UX        |

---

## 🎯 1. STYLE & REFERENCE

This system is **domain-neutral on purpose**. It describes how a surface looks, not
what it is about — the tokens below carry no industry, no domain vocabulary, and no
project-specific content. Reusing it must never require editing it.

- **Emotional tone:** calculated, calm, unshakeable. High-frequency execution balanced
  by institutional gravity.
- **Visual treatment:** austere and dense, yet impeccably readable.
- **Zero ornament.** More visual stimulus than necessary = failure.

### Reference matrix

The register is borrowed deliberately. Cite the reference when you need to justify a
decision; do not imitate the surface.

| Reference | What is borrowed from it | What is **not** borrowed |
| --- | --- | --- |
| **The Matrix (1999)** | The terminal register: obsidian ground, one acid accent used as *signal* rather than decoration, monospace as instrumentation, information density over whitespace. This is where lime-on-black comes from — it is a **status colour**, never an ornament. | The green-rain gimmick, the glitch effects, the costume. A blurred glowing circle is not a Matrix reference; a number that matters is. |
| Linear, Vercel | Precision of developer tooling: tight vertical rhythm, hairline borders, restraint in colour. | Their gradients and glass. Copy the discipline, not the varnish. |
| Swiss architectural publishing | Typographic rigour: a strict grid, one accent, generous whitespace as structure rather than decoration. | Posters. No display type at poster scale. |
| Stripe Press, financial whitepapers | Tabular restraint: dense data treated as a first-class citizen, annotated rather than decorated. | The brand. |

> **The test for the accent:** if lime is doing *work* — marking the primary action, a
> positive delta, a live status — keep it. If it is only making the screen feel
> technical, delete it.

---

## 🎨 2. TOKENS (SOURCE OF TRUTH)

> Tokens live in **`themes/matrix/tokens.css`** in the `@theme` block (Tailwind v4).
> In your app, that file is `src/app/theme.css`, which `src/app/globals.css`
> imports. Edit the tokens in **that** file and nowhere else.
> **Never** write a hex literal in a component.

The copy in your app is not the master: it is a verbatim copy of this package's
`themes/matrix/tokens.css`, written at scaffold time. The copy has to live inside
the app because Turbopack refuses an `@import` that leaves the project root — which is
a bundler constraint, not a design decision, and it is why a second stack imports this
design instead of reinventing it. `check-rules` RULE 7 compares this section against
the token file on every run and **fails if it reads zero tokens**, so the comparison
can never pass by finding nothing.

### Colours

A **surface ramp** and a **signal palette**. They do different jobs and must not be
mixed: surfaces establish depth, signals carry meaning. Accent colours are never
decoration, which is what §1's reference matrix means by "signal".

#### Surfaces — depth, never meaning

| Token | Hex | Use |
| --- | --- | --- |
| `surface` | `#111319` | base of panels/cards |
| `surface-base` | `#0A0D12` | root canvas (Tier 0) |
| `surface-raised` | `#11151C` | cards and containers (Tier 1) |
| `surface-overlay` | `#181E27` | modals, dropdowns, code headers (Tier 2) |
| `surface-container` | `#1D2025` | neutral containers |
| `surface-container-high` | `#272A30` | elevated containers |
| `surface-container-highest` | `#32353B` | maximum container contrast |
| `surface-bright` | `#36393F` | very elevated surfaces |
| `on-surface` | `#E1E2EA` | text/icons on a surface |
| `border-subtle` | `#1E2633` | card border (Tier 1) |
| `border-prominent` | `#2D384B` | overlay border (Tier 2) |
| `outline` | `#8D937B` | outline/focus |
| `outline-variant` | `#434935` | outline variant |

#### Text — a contrast ramp, warm at the top

| Token | Hex | Use |
| --- | --- | --- |
| `text-primary` | `#F4F1EA` | primary text (warm editorial off-white) |
| `text-secondary` | `#94A3B8` | secondary text |
| `text-muted` | `#56657A` | tertiary / decorative text |

#### Signals — meaning, and only meaning

| Token | Hex | Means |
| --- | --- | --- |
| `primary` | `#BAF336` | **Neon lime** — the primary action, the selected state, the one thing that matters on this screen |
| `on-primary` | `#0A0D12` | text on lime |
| `primary-container` | `#BAF336` | lime as a container |
| `on-primary-container` | `#253600` | text on a lime container |
| `secondary` | `#45DFA4` | **Mint** — success, healthy delta, positive change |
| `on-secondary` | `#003825` | text on mint |
| `tertiary` | `#93C5FD` | **Slate blue** — taxonomy, categories, informational tags |
| `on-tertiary` | `#003257` | text on tertiary |
| `error` | `#FFB4AB` | failure |
| `on-error` | `#690005` | text on error |
| `error-container` | `#93000A` | error as a container |
| `kpi-accent-glow` | `rgba(186,243,54,0.12)` | lime accent glow |
| `mint-accent-glow` | `rgba(52,211,153,0.12)` | mint accent glow |

> **Accent rule:** only **one** signal colour competes per screen. Lime (`primary`) is
> the action. Mint (`secondary`) is status. Slate blue (`tertiary`) is taxonomy. Never
> all three at once — and if the screen has nothing to say, none of them.

### Typography — a three-font matrix

Three families, three jobs, no overlap. A font that could do another family's job is
one too many.

| Family | Role | Rule |
| --- | --- | --- |
| **Manrope** | Structural geometric core: headlines, body, large numbers | weight 400–800 |
| **JetBrains Mono** | Instrumentation: tags, paths, step indexes, ids, timestamps, metadata | `letter-spacing: 0.06em` in CAPS for chrome; normal tracking inline |
| **Playfair Display** | Editorial voice: pull quotes, asides, a moment of emphasis | Italic/medium only. Sparingly. Never for UI labels. |

All via `next/font/google` (zero layout shift, zero external request). See
[tailwind.md](./stacks/tailwind.md).

#### Type scale

| Token | Family | Size / Weight / Line | Letter | Use |
| --- | --- | --- | --- | --- |
| `display-hero` | Manrope | 64 / 800 / 72 | -0.035em | top-level display |
| `display-hero-mobile` | Manrope | 38 / 800 / 44 | -0.025em | the same, mobile |
| `metric-stat` | Manrope | 48 / 700 / 52 | -0.03em | a single dominant number, desktop |
| `metric-stat-mobile` | Manrope | 32 / 700 / 36 | -0.02em | the same, mobile |
| `headline-lg` | Manrope | 32 / 700 / 40 | -0.02em | section title |
| `headline-md` | Manrope | 24 / 600 / 32 | -0.015em | card title |
| `headline-sm` | Manrope | 18 / 600 / 26 | -0.01em | subtitle |
| `body-lg` | Manrope | 17 / 400 / 28 | — | main body |
| `body-md` | Manrope | 15 / 400 / 24 | — | default body |
| `body-sm` | Manrope | 13 / 400 / 20 | — | dense body |
| `editorial-quote` | Playfair | 26 / 500 / 36 | -0.01em | quote |
| `code-inline` | JetBrains Mono | 13 / 500 / 18 | -0.01em | inline code |
| `label-mono` | JetBrains Mono | 11 / 600 / 16 | +0.06em | technical label (CAPS) |

> The scale moves smoothly from monumental (desktop) to dense (mobile) with no clipping
> and no ugly wrapping. `metric-stat` is the only token above `headline-lg` that is not
> a heading — it exists so a number can dominate a card without the number becoming a
> headline.

### Radius (disciplined "soft" curvature)

| Token | Value | Use |
| --- | --- | --- |
| `sm` | `0.125rem` | micro-chip |
| `DEFAULT` | `0.25rem` | button, input (CAD/IDE aesthetic) |
| `md` | `0.375rem` | medium input, select |
| `lg` | `0.5rem` | card, data module |
| `xl` | `0.75rem` | large panel |
| `full` | `9999px` | **only** status/online badges |

### Spacing (8pt grid, vertical rhythm)

| Token | Value | Use |
| --- | --- | --- |
| `gutter` | `1.5rem` | mobile gutter |
| `gutter-desktop` | `2rem` | desktop gutter |
| `margin` | `1rem` | mobile margin |
| `margin-tablet` | `2rem` | tablet margin |
| `margin-desktop` | `3rem` | desktop margin |
| `space-xs` | `0.25rem` | micro gap |
| `space-sm` | `0.5rem` | tight gap (data grid) |
| `space-md` | `1rem` | default gap |
| `space-lg` | `1.5rem` | section gap |
| `space-xl` | `2.5rem` | wide gap |
| `space-2xl` | `4rem` | section breathing (mobile) |
| `space-3xl` | `6rem` | section breathing (desktop) |

---

## 🏔 3. ELEVATION & DEPTH

**No heavy drop shadows.** Depth = tiering + glass + micro-border.

- **Tier 0 (Canvas):** `#0A0D12` + a 1px micro-dot grid pattern
  (`rgba(255,255,255,0.03)`).
- **Tier 1 (Cards):** `#11151C` with a continuous `1px #1E2633` border.
- **Tier 2 (Overlay/Hover/Focus):** `#181E27` with a crisp `#2D384B` border and a
  localised micro-glow.
- **Radial gradients:** `rgba(186,243,54,0.04)` and `rgba(52,211,153,0.03)` behind a
  single focal element per screen — a diagram, a hero. Diffuse, never hurting
  readability, and never more than one.
- **Glassmorphism:** nav rails and persistent status bars use `backdrop-filter:
  blur(12px)` with a semi-transparent slate (`rgba(10,13,18,0.82)`) and a hairline
  bottom divider (`rgba(30,38,51,0.9)`).

---

## 📐 4. LAYOUT & SPACING

- **Grid:** a strict 12-column mathematical grid on an 8pt vertical baseline.
- **Max width:** `1320px`, centred, inside high-contrast technical gutters.
- **Section rhythm:** major sections breathe with `space-3xl` on desktop →
  `space-2xl` on mobile. Whitespace here is structure, not decoration: it is what makes
  a dense screen legible without adding a single border.
- **Density:** dense regions (data grids, metric clusters, tag lists) use tight
  internal padding (`space-sm`–`space-md`). Density is a property of the content, not
  a global setting — a reading view and a log view do not want the same rhythm.
- **Adaptive breakpoints:**
  - **Mobile (<768px):** 4-column reflow, stacked metrics, full-width border-separated
    tiers.
  - **Tablet (768–1024px):** 8-column layout, two-up cards, condensed sidebar.
  - **Desktop (>1024px):** full 12-column layout with side-by-side panes.

---

## 🧱 5. COMPONENTS

Primitives, named by **what they are** and not by what they were used for. A component
whose name contains a domain noun cannot be reused in a project without that domain.

### Buttons

| Variant | Visual | Rule |
| --- | --- | --- |
| **Primary** (the page's one main action) | bg `#BAF336`, text `#0A0D12`, Manrope 600 | Hover: bg `#C8F75A` + `box-shadow 0 0 16px rgba(186,243,54,0.3)`. Active: `scale(0.98)`. |
| **Secondary** | bg `transparent`, `1px` border `#1E2633`, text `#F4F1EA` | Hover: border `#94A3B8` + bg `rgba(255,255,255,0.04)`. |
| **Ghost / copy action** | JetBrains Mono 11px CAPS, transparent, icon in a soft container | Instant confirmation tooltip on copy. |

> One primary per screen. Two primaries means no primary.

### Stat card (a number that matters)

The reusable form of "one dominant number plus its context". Shows **any** metric —
a count, a duration, a percentage, a delta.

- Two-part construction: a **mono header** (`label-mono`) with an optional status dot →
  the **number** (`metric-stat`) → an **annotated subtext** carrying the unit, the
  window, and the caveat that makes the number honest.
- Inner `1px solid #1E2633` highlight + a top-corner hover glow in `#BAF336`.
- **A bare number is not a stat card.** If there is no unit, no window and no caveat,
  the number is decoration — render it as `metric-stat` alone, not as a card.
- A delta uses mint for positive and `error` for negative. Never lime for a delta:
  lime means "this is the action", not "this went up".

### Node & link diagram

For any system map: dependencies, pipelines, topologies, state machines.

- Dark-slate node containers connected by 1px vectors.
- **Active/live** nodes: a pulsing lime or mint status ring. **Inactive/legacy** nodes:
  `#56657A`, and they stay grey — de-emphasis is the whole point.
- A tooltip drawer may slide in from the right edge with the node's detail.
- **Never hand-place a diagram's geometry.** Nodes are laid out from data; a diagram
  whose positions are hardcoded cannot survive its first content change.

### Badges & tags

- JetBrains Mono, 11px CAPS, padding `4px 8px`.
- **Neutral:** bg `#11151C`, border `#1E2633`, text `#94A3B8`.
- **Highlight:** bg `rgba(186,243,54,0.08)`, border `rgba(186,243,54,0.4)`, text
  `#BAF336`.
- A badge is a **closed set of categories** (state, type, tag). If it carries a value
  the reader must compare against other values, it is a number, not a badge — and it
  belongs in `body-md` where it can be read rather than scanned.

### Detail drawer / expandable row

- One pattern for "show me the whole thing later": a drawer from the right edge, or an
  inline expandable row. Pick by available depth — a drawer for depth, a row for depth
  that is short.
- Content order is fixed and content-neutral: **what it is**, **why it is that way**,
  **what it does**, **what was measured**.
- The collapsed state must be self-sufficient. A row that only makes sense once
  expanded is a row nobody opens.

### Inputs & terminal fields

- Minimalist container, bg `#0A0D12`, `1px` border `#1E2633`, placeholder `#56657A`.
- Focus: the hairline migrates to `#BAF336` (no thick outline).

---

## 📱 4b. RESPONSIVE IS NOT OPTIONAL

> **A layout that only works at 1440px is a broken layout.** The viewport is not a
> design decision the visitor makes for you. This section is the law; §4b.1 is
> how you prove you obeyed it.

### 4b.1 The three viewports, named

Not "responsive" in the abstract. Three widths, three contracts:

| Name | Width | Why this one |
| --- | --- | --- |
| `mobile` | **390px** | iPhone 14/15/16. The most common phone width there is. A phone narrower than this is a rarity, not a target. |
| `tablet` | **768px** | iPad portrait. The width where a two-column layout starts to hurt. |
| `desktop` | **1440px** | The width the design was drawn at. |

Testing 320px tests a device nobody buys. Testing 1920px tests a monitor. The
three above are where a real visitor actually is.

### 4b.2 The four hard rules

1. **No horizontal scroll, ever.** `document.documentElement.scrollWidth` must be
   ≤ the viewport width. A single overflowing element pushes the whole page
   sideways and there is no way to get back.
2. **No tap target below 44×44px.** Thumb, not mouse. A 32px row of links is
   unusable on a phone and perfectly fine on a desktop.
3. **No body text below 13px.** The body floor is `body-sm` (13px). A `label-mono`
   chrome (section eyebrows, table headers, tags) is 11px by design and is not
   body copy — the exception is deliberate and pre-existing. Anything that a
   reader has to *read as a sentence* is 13px or larger.
4. **No content that only exists above 768px.** A `hidden md:flex` hero is a
   blank screen on the majority of devices. Reflow it; do not hide it.

### 4b.3 Prove it, do not assume it

A responsive claim without evidence is a hope. For any UI change:

```bash
# the suite runs the three viewports, not one
npm run test:e2e
```

**Every one of these must pass at `mobile` before the task is `[x]`:**

| Check | Assertion |
| --- | --- |
| No horizontal overflow | `scrollWidth <= clientWidth` at 390px |
| Nav is reachable | every `href="#..."` target exists **and** is reachable at 390px |
| Tap targets | every `a` and `button` has a box ≥ 44×44 |
| Text floor | no rendered text node below 13px |
| Nothing hidden | no visible-on-desktop element with `display: none` at 390px |
| The primary action | the main CTA is visible and tappable without horizontal scroll |

The last one is the one people skip. A page can pass every geometric check and
still bury its only call to action below a fold that requires a scroll gesture
the visitor does not know to try.

### 4b.4 Playwright setup, copy-paste

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  // 390 is the iPhone width, not an arbitrary small number
  projects: [
    { name: "mobile", use: { ...devices["iPhone 14"] } },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
});
```

`devices["iPhone 14"]` sets the viewport **and** `hasTouch`, so the suite
exercises tap instead of click where the device would.

### 4b.5 The geometric audit, as code

Copy this into a spec. It catches the class of bug that screenshots hide.

```ts
test("has no horizontal scroll on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    // Which element is the culprit? A width alone is not a diagnosis.
    const offenders = [...document.querySelectorAll("*")]
      .filter((el) => el.getBoundingClientRect().right > doc.clientWidth + 1)
      .map((el) => `${el.tagName}.${el.className}`.slice(0, 80))
      .slice(0, 5);
    return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth, offenders };
  });

  expect(overflow.offenders, `overflowing: ${overflow.offenders.join(", ")}`).toHaveLength(0);
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
});

test("every tap target is at least 44px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const small = await page.evaluate(() =>
    [...document.querySelectorAll("a, button")]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && (r.width < 44 || r.height < 44);
      })
      .map((el) => `${el.tagName} "${(el.textContent ?? "").trim().slice(0, 30)}"`),
  );

  expect(small, `too small: ${small.join(", ")}`).toHaveLength(0);
});
```

### 4b.6 Responsive is a design constraint, not a post-process

- **Design mobile-first, widen second.** A desktop layout that "collapses" was
  not designed; it was truncated.
- **Content decides the breakpoint.** A 4-column stat grid becomes 2×2, not
  "3 and a widow". Check what the grid looks like at 390px before you ship it.
- **Never hide content to save space.** Reflow it. If it does not fit, the copy
  is too long, not the screen too small.
- **Decorative backdrops get `overflow-x-clip`.** A blurred circle anchored to a
  viewport edge lands at `25% + 384px` on a 390px phone and pushes the document
  92px wider than the screen. Clip rather than hide, so `position: sticky`
  keeps working.
- **Long unbroken strings get `overflow-wrap`.** A URL or an email in a flex row
  is the single most common cause of horizontal scroll on mobile.

---

## 🧠 6. UX (Interaction rules)

These are not stylistic preferences. Each one exists because its absence produces a
defect a user feels and cannot name.

1. **Immediate feedback:** clicked? loading IMMEDIATELY. Worked? success toast. Failed?
   red toast. **Zero actions without a response** — a control that does nothing is
   indistinguishable from a broken one.
2. **Single focus:** one screen = one goal. Never 50 forms. Complex → modal/wizard.
3. **Micro-interactions:** `hover:` on everything clickable. The user must feel the
   screen is alive.
4. **Real accessibility:** contrast that passes. Secondary text never disappears. What
   matters **shouts**.
5. **Animations** respect `prefers-reduced-motion`. Transitions ≤ 200ms for feedback,
   ≤ 400ms for a drawer/modal.
6. **Empty is a state, not a blank.** Every list, table and panel has a designed empty
   state. A screen with nothing in it and nothing to say is a bug with good typography.
7. **Destructive actions are reversible or confirmed.** Delete asks. Undo is better.
8. **Never trap the user in a loading state.** Anything over 1s gets progress; anything
   over 10s gets a way out.

---

## 🚫 FORBIDDEN (one line each)

- ❌ Literal colour/rgba in a component (use tokens).
- ❌ Light mode (it's dark only).
- ❌ Any UI library besides shadcn ([stacks/shadcn.md](./stacks/shadcn.md)).
- ❌ Heavy drop shadows.
- ❌ Pill shape outside status/online.
- ❌ More than one accent competing on the same screen.
- ❌ Missing `focus-visible` on anything interactive.
- ❌ Any grid that isn't 12 columns / 1320px max-width.
- ❌ A layout that was only checked at one width. See §4b.
- ❌ `display: none` to make a mobile layout "fit".
- ❌ A tap target under 44×44px.
- ❌ Text below 13px.

## 🚱 REUSABILITY (the meta-rule)

This section is the reason the rest of the document is worded the way it is.

- ❌ **A domain noun in a rule's name.** "KPI card", "case study drawer", "recruiter
  metadata bar" cannot be reused in a project that has no KPIs, case studies or
  recruiters. Name components by their shape: *stat card*, *detail drawer*.
- ❌ **A value from one project as an example.** `"4.2M records/day"` teaches an agent
  that impressive numbers belong in cards. Use the shape: *a count, a duration, a
  delta*. And do not reach for a real figure from whatever project you are in — that
  is how one project's numbers end up as another project's defaults.
- ❌ **Editing this document to describe a project.** If a change is only true of your
  app, it does not belong here. `APP.md` is where that goes.
- ❌ **A second source of truth for a token.** If a value is not in
  `themes/matrix/tokens.css` and documented in §2, it does not exist.
- ❌ **Treating §1's references as a surface to copy.** Borrow the discipline. The
  Matrix is about a number that matters on an obsidian ground, not about glowing green.
