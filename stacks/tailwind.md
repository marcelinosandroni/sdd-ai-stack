# 🎨 TAILWIND CSS (v4)

> The template's styling stack. **Dark mode only.** Full tokens in
> [../DESIGN.md](../DESIGN.md). Spine: [clean-code.md](./clean-code.md).

## 🚨 Non-negotiable rules

1. **Never write a literal colour or rgba in a class.** Use the tokens:
   `bg-surface`, `text-text-secondary`, `border-border-subtle`.
2. **Never use inline `style={{}}`** (except for a dynamic design value).
3. **Tokens live in `src/app/globals.css` in the `@theme` block.** To change the
   design, change it **there** — never in a component.
4. **Mobile-first.** The base style is mobile; breakpoints are the upgrade
   (`sm: md: lg:`).
5. **12-column grid, max-width 1320px, gutter 1.5rem/2rem.** Don't invent another grid.
6. **`<Image>` always with explicit `sizes`** in a grid/list (otherwise mobile
   downloads a 4k asset).
7. **Class order = mobile → state → breakpoint.** It makes the file readable and the
   diff sane.

## 🧱 COMPONENT CLASSES (via `@layer components`)

The template defines the primitives. **Don't repeat a long class string in 40 places**
— use the variant.

```tsx
<a className="btn-primary">Save</a>
<a className="btn-secondary">Cancel</a>
<span className="chip">React 19</span>          // inactive chip
<span className="chip chip-active">Active</span> // active chip (lime)
<div className="card">…</div>                   // default card
<div className="card-metric">…</div>            // KPI card
<label className="field-label">Email</label>
<input className="field" />
```

## 🎯 Usage patterns

```tsx
// ✅ responsive grid, 12 columns on desktop
<div className="mx-auto w-full max-w-[1320px] px-6 lg:px-8">
  <div className="grid grid-cols-4 gap-4 md:grid-cols-8 lg:grid-cols-12">
    <div className="col-span-4 lg:col-span-6">…</div>
  </div>
</div>

// ✅ glassmorphism (nav / status bar)
<header className="sticky top-0 z-50 border-b border-border-subtle bg-surface-raised/80 backdrop-blur-xl">

// ✅ lime glow on a KPI
<div className="card-metric hover:shadow-[0_0_24px_var(--kpi-accent-glow)]">

// ❌ forbidden
<div style={{ background: "#BAF336" }} />
<div className="bg-[#BAF336] text-[#0A0D12]" />
```

## 🚫 Forbidden

| Pattern | Why |
| --- | --- |
| Literal colour (`#hex`, `rgb()`) in a class | breaks the theme and dark mode |
| `!important` | hides specificity mistakes |
| Arbitrary values with no reason | untrackable CSS |
| A `tailwind.config.js` when Tailwind v4 uses `@theme` | two sources of truth |
| Custom animation without `prefers-reduced-motion` | accessibility |

## ✅ Accessibility (mandatory)

- Focus is **always visible**: use the token `focus-visible:ring-primary` in the
  input/button pattern.
- Minimum touch target **44px** on mobile.
- Contrast: secondary text (`#94A3B8`) on a surface (`#11151C`) passes; muted text
  (`#56657A`) only for decorative detail.
