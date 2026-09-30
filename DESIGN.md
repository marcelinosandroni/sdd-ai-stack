# 🎨 DESIGN SYSTEM — EXECUTIVE ENGINEERING

> **This is the visual law of the project.** If the UI doesn't follow this document, the
> UI is wrong.
> Theme: **DARK ONLY**. No light mode. No generic branding.

---

## 🧭 0. ROUTER

| You are…                    | Read         |
| --------------------------- | ------------ |
| Picking a colour/space/font | §2 Tokens    |
| Writing/copying CSS         | §2 Tokens    |
| Building a layout/grid      | §5 Layout    |
| Button, card, chip, input   | §6 Components |
| Thinking about feedback/UX  | §7 UX        |

---

## 🎯 1. BRAND & STYLE

The intersection of **high-tier distributed systems engineering** and **senior executive
fiscal stewardship**.

- **Aesthetic:** the precision of developer tooling (Linear, Vercel) plus the
  typographic discipline of Swiss architectural publishing and financial whitepapers
  (Stripe Press).
- **Emotional tone:** high-frequency execution balanced by institutional gravity.
  Calculated, calm, unshakeable.
- **Visual treatment:** austere and dense, yet impeccably readable.
- **Surfaces:** deep obsidian-tinted slates, never hollow absolute blacks, paired with
  crisp 1px micro-borders and deliberate accents in electric lime and mint.
- **Financial impact** (millions saved, sub-millisecond latencies, billions under
  control) and **architecture schematics** get museum-grade typographic treatment.
- **Zero ornament.** More visual stimulus than necessary = failure.

---

## 🎨 2. TOKENS (SOURCE OF TRUTH)

> Tokens live in `src/app/globals.css` in the `@theme` block (Tailwind v4).
> **Never** write a hex literal in a component.

### Colours

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
| `text-primary` | `#F4F1EA` | primary text (warm editorial off-white) |
| `text-secondary` | `#94A3B8` | secondary text |
| `text-muted` | `#56657A` | tertiary / decorative text |
| `border-subtle` | `#1E2633` | card border (Tier 1) |
| `border-prominent` | `#2D384B` | overlay border (Tier 2) |
| `primary` | `#BAF336` | 🟢 **Neon lime** — critical executive action, ROI, active state |
| `on-primary` | `#0A0D12` | text on lime |
| `primary-container` | `#BAF336` | lime as a container |
| `on-primary-container` | `#253600` | text on a lime container |
| `secondary` | `#45DFA4` | 🟢 **Mint** — stability, SLA up, positive delta |
| `on-secondary` | `#003825` | text on mint |
| `tertiary` | `#93C5FD` | 🔵 **Slate blue** — infra badges, pipeline stages, technical tags |
| `on-tertiary` | `#003257` | text on tertiary |
| `error` | `#FFB4AB` | error |
| `on-error` | `#690005` | text on error |
| `error-container` | `#93000A` | error as a container |
| `outline` | `#8D937B` | outline/focus |
| `outline-variant` | `#434935` | outline variant |
| `kpi-accent-glow` | `rgba(186,243,54,0.12)` | lime KPI glow |
| `mint-accent-glow` | `rgba(52,211,153,0.12)` | mint KPI glow |

> **Accent rule:** only **one** accent competes per screen. Lime (`primary`) is the
> executive action. Mint (`secondary`) is status/positive. Slate blue (`tertiary`) is
> taxonomy/infra. Never all three at once.

### Typography — a three-font matrix

| Family | Role | Rule |
| --- | --- | --- |
| **Manrope** | Structural geometric core: headlines, body, big numbers | weight 400–800 |
| **JetBrains Mono** | Technical instrumentation: tags, paths, step indexes, metadata | `letter-spacing: 0.06em` in CAPS |
| **Playfair Display** | Editorial financial nuance: quotes, strategic framing | Italic/medium only. Sparingly. |

All via `next/font/google` (zero layout shift, zero external request). See
[tailwind.md](./stacks/tailwind.md).

#### Type scale

| Token | Family | Size / Weight / Line | Letter | Use |
| --- | --- | --- | --- | --- |
| `display-hero` | Manrope | 64 / 800 / 72 | -0.035em | desktop hero |
| `display-hero-mobile` | Manrope | 38 / 800 / 44 | -0.025em | mobile hero |
| `metric-stat` | Manrope | 48 / 700 / 52 | -0.03em | desktop KPI |
| `metric-stat-mobile` | Manrope | 32 / 700 / 36 | -0.02em | mobile KPI |
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
> and no ugly wrapping.

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
- **Radial gradients:** `rgba(186,243,54,0.04)` and `rgba(52,211,153,0.03)` behind
  flagship architecture diagrams. Diffuse, never hurting readability.
- **Glassmorphism:** nav rails and persistent status bars use `backdrop-filter:
  blur(12px)` with a semi-transparent slate (`rgba(10,13,18,0.82)`) and a hairline
  bottom divider (`rgba(30,38,51,0.9)`).

---

## 📐 4. LAYOUT & SPACING

- **Grid:** a strict 12-column mathematical grid on an 8pt vertical baseline.
- **Max width:** `1320px`, centred, inside high-contrast technical gutters.
- **Section rhythm:** large modules (Hero, Metrics Matrix, Interactive Architecture,
  Case Studies) breathe with `space-3xl` on desktop → `space-2xl` on mobile. A
  museum-grade portfolio presence.
- **Density:** micro-components (data grids, metric clusters, tech stacks) use tight
  internal padding (`space-sm`–`space-md`): breathing room balanced against the
  information density that engineering leaders and recruiters appreciate.
- **Adaptive breakpoints:**
  - **Mobile (<768px):** 4-column reflow, stacked metrics, full-width border-separated
    architecture tiers.
  - **Tablet (768–1024px):** 8-column layout, two-up metric cards, condensed sidebar.
  - **Desktop (>1024px):** full 12-column asynchronous multi-tier architecture canvases
    and side-by-side technical deep dives.

---

## 🧱 5. COMPONENTS

### Buttons

| Variant | Visual | Rule |
| --- | --- | --- |
| **Primary (executive action / CTA)** | bg `#BAF336`, text `#0A0D12`, Manrope 600 | Hover: bg `#C8F75A` + `box-shadow 0 0 16px rgba(186,243,54,0.3)`. Active: `scale(0.98)`. |
| **Secondary (deep dive)** | bg `transparent`, `1px` border `#1E2633`, text `#F4F1EA` | Hover: border `#94A3B8` + bg `rgba(255,255,255,0.04)`. |
| **Ghost / code copy** | JetBrains Mono 11px CAPS, transparent, icon in a soft container | Instant confirmation tooltip on copy. |

### Executive KPI Metric Card

- Shows financial impact ("R$ 24M/year saved", "100M msgs/day", "R$ 100bn under
  custody").
- Two-part construction: a **mono header** (`label-mono`) with a pulsing status dot →
  a **monumental statistic** (`metric-stat`) → an **annotated subtext** with technical
  scope and business ROI.
- Inner `1px solid #1E2633` highlight + a top-corner hover glow in `#BAF336`.

### Architecture Diagrams & Interactive System Flow

- Clean dark-slate node containers connected by 1px vectors.
- **Active** nodes: pulsing lime/mint status ring. **Inactive/legacy** layers: `#56657A`.
- An interactive tooltip drawer slides in from the right edge with code snippets,
  latency benchmarks, and architectural decisions.

### Chips & Technology Taxonomy Badges

- JetBrains Mono, 11px CAPS, padding `4px 8px`.
- **Inactive:** bg `#11151C`, border `#1E2633`, text `#94A3B8`.
- **Active/highlight:** bg `rgba(186,243,54,0.08)`, border `rgba(186,243,54,0.4)`, text
  `#BAF336`.

### Project Showcase & Technical Recruiter Drawer

- Cards split: system metrics on the left, interactive architecture/stack on the right.
- A fast metadata scanning bar: Role, Team Size, Scale, Core Tech, Direct Fiscal Impact.
- Expandable drawer with bullets: **Problem**, **Scale & Complexity**, **Architectural
  Decision**, **Measured Outcome**.

### Inputs & Terminal Fields

- Minimalist container, bg `#0A0D12`, `1px` border `#1E2633`, placeholder `#56657A`.
- Focus: the hairline migrates to `#BAF336` (no thick outline).

---

## 🧠 6. UX (Interaction rules)

1. **Immediate feedback (dopamine):** clicked? loading IMMEDIATELY. Worked? success
   toast. Failed? red toast. **Zero actions without a response.**
2. **Single focus:** one screen = one goal. Never 50 forms. Complex → modal/wizard.
3. **Micro-interactions:** `hover:` on everything clickable. The user must feel the
   screen is alive.
4. **Real accessibility:** contrast that passes. Secondary text never disappears. What
   matters **shouts**.
5. **Animations** respect `prefers-reduced-motion`. Transitions ≤ 200ms for feedback,
   ≤ 400ms for a drawer/modal.

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
