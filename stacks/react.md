# ⚛️ REACT (complement)

> **React Client is NOT the default.** Next.js 16 uses **Server Components** by default.
> Read this doc only when the problem is **client component/state**, not the server.
> Next.js rules: [next.md](./next.md) §3 (Server-First).

## 🧭 Router

| Situation | Do |
| --- | --- |
| Data fetch during render | **Server Component.** You don't need this doc. |
| Mutation from a form | **Server Action** ([next.md](./next.md) §5) |
| Only the button has `onClick` | Isolated `"use client"` leaf (§3 of next.md) |
| State that must survive a route change | Cookie/DB, not context |
| Remote cache with optimistic updates | TanStack Query (`@tanstack/react-query`) |
| Zustand/Redux | **Avoid.** Use props, local context, or React's `cache()` |

## 🚨 Non-negotiable rules

1. **Server Component is the default.** `"use client"` is a deliberate exception —
   always on the lowest leaf (see [next.md](./next.md) §3).
2. **A Server Component may be async; a Client Component may not** (except with `use()`,
   inside Suspense).
3. **A Client Component can never import a `server-only` module.** That breaks the
   build — which is the point.
4. **Props from Server → Client must be serialisable.** Never a function, never a
   class; a `Date` arrives as a string.
5. **`useEffect` does not fetch data.** It syncs side effects. Fetching = Server
   Component or Server Action.
6. **State is as local as possible:** `useState` > context > global store.
7. **Lists get a stable key, never the index.**
8. **A client component is small and dumb.** The logic goes into the use case
   (`features/`).

## 🪝 HOOKS — the rules of React 19.2

```tsx
// ✅ Hooks before any conditional return
function Panel({ open }: { open: boolean }) {
  const [tab, setTab] = useState("overview");
  useEffect(() => { /* sync external system */ }, [open]);
  if (!open) return null;
  return <div>{tab}</div>;
}

// ✅ Non-reactive logic isolated in useEffectEvent
useEffectEvent(() => { onSubmitRef.current(value); });

// ✅ Background activity without unmounting state
<Activity mode="hidden">…</Activity>
```

| Hook | Use for | Do NOT use for |
| --- | --- | --- |
| `useState` | local UI state | derived state (compute during render) |
| `useReducer` | a complex state machine | two booleans |
| `useEffect` | syncing with an external system (DOM, socket, subscription) | fetching data, deriving state |
| `useMemo` | expensive computation | "just to be safe" performance |
| `useCallback` | hook dependency / stable reference | "just to be safe" performance |
| `useContext` | UI data shared in a subtree | global domain state |
| `useOptimistic` | optimistic UI with a Server Action | general caching |

> **React Compiler is enabled** in the template (`reactCompiler: true` in
> `next.config.ts`). Manual `useMemo`/`useCallback` are, most of the time, noise.

## 🧩 COMPOSITION

1. **Compound components** for complex UI (`<Select>`, `<SelectItem>`). Fewer props,
   better API.
2. **Composition over configuration.** 3 small components beat 1 with 15 boolean props.
3. **Server Components compose Client Components** (the "children pattern"):

```tsx
// ✅ Pass markup, not a function
<Shell sidebar={<ServerRenderedSidebar />}>
  <InteractiveChart />
</Shell>
```

## 📁 WHERE THINGS LIVE

| Type | Path |
| --- | --- |
| Generic UI primitive | `src/shared/ui/` |
| UI with business rules | `src/features/<x>/ui/` |
| Cross-cutting hook | `src/shared/hooks/` |
| Context provider | next to the hook that consumes it |

## 🚫 ANTI-PATTERNS

| ❌ | ✅ |
| --- | --- |
| `"use client"` at the top of the layout/page | isolated leaf |
| `useEffect` + `fetch` to get data | Server Component / Action |
| Zustand/Redux for server state | React `cache()` / Server |
| Prop drilling 5 levels deep | local context or composition |
| `key={index}` in a list | a stable id |
| `useMemo` on everything | let the Compiler do it |
| A context with a new object every render | separate value from actions |
