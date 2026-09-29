# 🟠 SVELTE

> **Svelte compiles away. The cost is in the compile step, not the bundle.**
> Svelte 5 runes, or SvelteKit. Spine: [clean-code.md](./clean-code.md).
> Language: [javascript.md](./javascript.md).

---

## 🎯 Versions

| Piece | Version |
| --- | --- |
| Svelte | 5+ (runes: `$state`, `$derived`, `$effect`, `$props`) |
| SvelteKit | 2+ (SSR, routing, load functions) |
| Check | `svelte-check` — mandatory in CI |
| State | Runes + context. A store library only if you already have one |

---

## 🚨 Rules

1. **Runes, not stores, in new code.** `$state`, `$derived`, `$props`, `$effect`.
   `writable`/`readable` are the legacy API.
2. **SvelteKit for anything with routing.** Plain Svelte only for an embeddable widget.
3. **One component per file.** `InvoiceCard.svelte`.
4. **`$derived` for anything computed.** Never `$effect` that assigns state.
5. **`$effect` only for real side effects**: DOM, analytics, `setInterval`, sockets.
   Never for synchronisation between two pieces of state.
6. **`$props()` with types + `bindable()`** for two-way. No `export let` in new code.
7. **`{#each … (item.id)}` — key is mandatory.**
8. **`svelte-check` in CI.** Types in templates are real; verify them.
9. **`load` functions in `+page.ts` / `+page.server.ts`, not in the component.** The
   component renders, it does not fetch.
10. **Form actions over endpoints** (`+page.server.ts` actions). No manual `fetch` + POST.
11. **No `$:` reactive statements.** They are the Svelte 4 way and they hide ordering.
12. **`$app/state` over `$app/stores` in SvelteKit 2.12+.**
13. **Styles scoped by default.** `:global()` only where truly needed.
14. **Never `bind:` to a prop you did not declare `bindable()`.**

---

## 📂 Layout (SvelteKit)

```text
src/
├── lib/
│   ├── features/billing/
│   │   ├── components/InvoiceCard.svelte
│   │   ├── components/InvoiceList.svelte
│   │   ├── invoice.ts          # types + pure functions
│   │   └── api.ts              # fetch + mappers
│   └── shared/components/      # generic
├── routes/
│   ├── +layout.svelte
│   ├── +page.server.ts         # load
│   └── invoices/
│       ├── +page.svelte        # render only
│       └── +page.server.ts     # load + actions
├── params/                     # route params
└── hooks.server.ts             # auth, guards
```

**`+page.svelte` renders. `+page.server.ts` fetches and mutates.** That split is the
framework's main gift; blurring it gives up SSR, parallel loading and progressive
enhancement at once.

---

## 🎯 Runes

```svelte
<script lang="ts">
  import { api } from "$app/state";

  let { invoiceId, onselect }: {
    invoiceId: string;
    onselect?: (id: string) => void;
  } = $props();

  let notes = $state("");

  // derived, not an effect
  const canSubmit = $derived(notes.trim().length > 0 && !api.loading);

  // effect only for a real side effect
  $effect(() => {
    const timer = setInterval(() => api.refresh(), 30_000);
    return () => clearInterval(timer);        // cleanup is mandatory
  });

  function save() {
    if (!canSubmit) return;
    onselect?.(invoiceId);
  }
</script>

<input bind:value={notes} disabled={!canSubmit} />
<button onclick={save} disabled={!canSubmit}>Save</button>
```

**`$effect` must return its cleanup.** A `$effect` without cleanup that subscribes,
subscribes forever.

---

## 🔌 SvelteKit specifics

| Concern | Do | Never |
| --- | --- | --- |
| Data loading | `load` in `+page.ts` (universal) or `+page.server.ts` (server-only) | `onMount` + `fetch` |
| Mutations | form actions in `+page.server.ts` | `fetch('/api/…')` from the client |
| Secrets | `+page.server.ts` / `hooks.server.ts` | `PUBLIC_`-prefixed env |
| Auth | `hooks.server.ts`, `event.locals` | client-side route check only |
| SEO | `svelte:head` or a `+page.svelte` `<svelte:head>` block | mutating `document.title` in an effect |
| Streaming | `await` inside the template streams it | buffering the whole page |
| Errors | `+error.svelte` + `error()` helper | try/catch in the component |
| Client-only code | `browser` from `$app/environment`, or an effect | top-level `window` access |

---

## 🎨 Styling

| Concern | Do | Never |
| --- | --- | --- |
| Default | scoped `<style>` in the component | a global stylesheet for component styles |
| Tokens | CSS custom properties from the design system | hardcoded hex in a component |
| Dark mode | the `dark` class on `<html>`, tokens flip | a second stylesheet |
| Dynamic | `style:` directive | string-concatenated class names |
| Library | Tailwind or plain CSS. Pick one | mixing both in one component |
| Class toggling | `class:active={cond}` | string concatenation |

---

## 🧪 Testing

| Layer | Tool | Notes |
| --- | --- | --- |
| Components | Vitest | `@testing-library/svelte` for queries |
| Pure functions | Vitest | plain, no DOM needed |
| `load` / actions | Vitest calling the exported function directly | a full HTTP round trip |
| E2E | Playwright | `webServer` boots `vite preview` after `vite build` |

```ts
it("disables save until a note exists", async () => {
  const { getByRole } = render(InvoiceCard, { invoiceId: "id-1" });

  expect(getByRole("button", { name: /save/i })).toBeDisabled();

  await userEvent.type(screen.getByRole("textbox"), "called");
  expect(getByRole("button", { name: /save/i })).toBeEnabled();
});
```

Query by role, not by class. A refactor should not be able to break the suite.

---

## 🚫 Smells specific to Svelte

| Smell | Fix |
| --- | --- |
| `export let` in new code | `$props()` |
| `writable` stores | runes |
| `$:` reactive statements | `$derived` |
| `$effect` assigning state | `$derived` |
| `{#each}` without a key | `(item.id)` |
| Fetch in `onMount` | `load` |
| `fetch` POST from the client | form action |
| Global CSS for components | scoped `<style>` |
| A `+page.svelte` with 200 lines of fetch logic | move to `+page.server.ts` |
| Secret in a `PUBLIC_` var | server-only file |
| `$effect` with no cleanup | return the disposer |

---

## 📎 Commands

```bash
npm run build
npm run preview
npm run check        # svelte-check — must be in CI
npm run test
npm run lint
```
