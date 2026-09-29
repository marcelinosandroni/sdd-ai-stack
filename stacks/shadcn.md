# 🧩 SHADCN/UI

> Spine: [clean-code.md](./clean-code.md).

> **The template's OFFICIAL UI library.** Components live in `src/shared/ui/`.

## 🚨 Non-negotiable rules

1. **shadcn/ui is the only UI library.** MUI, AntD, Bootstrap, Chakra,
   styled-components are forbidden.
2. **A new component lands in the folder, not in the registry.**
   `npx shadcn@latest add <comp>` and the file is born in `src/shared/ui/`.
3. **After adding it, EDIT the local file.** It is yours now. Align it with
   [../DESIGN.md](../DESIGN.md) (tokens, radius, border).
4. **Every new component needs:** `aria-*` where it has a role, visible focus, and a
   real `disabled` state (not just visual).
5. **Variants via `cva` (class-variance-authority).** Never an `if/else` of
   classNames.
6. **Icons: `lucide-react`.** Default size 16, stroke 2. No hand-pasted SVG.

## 🧪 Flow to add a component

```bash
# 1. installs and creates the file
npx shadcn@latest add dialog

# 2. check where it landed: src/shared/ui/dialog.tsx

# 3. edit the file: swap the classes for the DESIGN tokens
```

## 🎨 Overlap with the DESIGN

shadcn ships a generic theme. **DESIGN.md wins.** Checklist when touching a component:

- [ ] Background/border/text using `globals.css` tokens
      (`bg-surface-container`, `border-border-prominent`)
- [ ] Radius: `rounded-md` (0.375rem) on inputs/buttons, `rounded-lg` (0.5rem) on cards
- [ ] Hairline `1px` border, **no heavy shadow**
- [ ] Primary button: `bg-primary text-on-primary hover:bg-primary/90` with a subtle
      lime glow
- [ ] Focus: `focus-visible:ring-2 focus-visible:ring-primary`

## 📂 Where each thing lives

| Type | Path |
| --- | --- |
| Generic primitive (Button, Dialog, Input) | `src/shared/ui/` |
| Domain component (UserCard, InvoiceRow) | `src/features/<x>/ui/` |
| Composition (form + action + validation) | `src/features/<x>/ui/` |
| UI hook (useToast, useMediaQuery) | `src/shared/hooks/` |

## 🚫 Anti-patterns

| ❌ Don't | ✅ Do |
| --- | --- |
| `<div onClick>` as a button | `<button type="button">` |
| Dialog wrapper with its own scattered state | state in the parent, or `useActionState` |
| Create a component that's 90% identical to shadcn's | edit the existing one |
| Custom props with 8 booleans | `variant` + `size` with cva |
| Accessibility ignored in a modal/drawer | `DialogTitle`, `DialogDescription`, trapped focus |
