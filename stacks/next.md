# ⚛️ NEXT.JS — OFFICIAL RULES (DEFAULT STACK)

> **THE DEFAULT STACK OF THIS TEMPLATE.** Every new application ships on Next.js.
> Plain Node.js (workers, CLIs, cron, webhooks) is a **complement**, not the default —
> see [node.md](./node.md).
>> Target version: **Next.js 16** (App Router, React 19.2, Turbopack).
> Spine: [clean-code.md](./clean-code.md) + [architecture.md](./architecture.md).

---

## 🧭 1. ROUTER (read only what you need)

| You are…                                | Read                     |
| --------------------------------------- | ------------------------ |
| Creating a page/route                   | §2 Structure, §3 Server  |
| Fetching data                           | §4 Data                  |
| Writing a mutation (create/update/delete) | §5 Server Actions      |
| Touching cache                          | §6 Cache Components      |
| Auth / protected routes                 | §7 Security              |
| Building a third-party API              | §8 Route Handlers        |
| A form                                  | §9 Forms                 |
| Metadata / SEO                          | §10 Metadata             |
| Performance                             | §11 Performance          |
| Tests                                   | [testing.md](./testing.md) |

---

## 📂 2. FOLDER STRUCTURE

Lean, Next-first. **There is no separate `client/` or `server/`** — the App Router is
already the boundary.

```text
src/
├── app/                    # ROUTING (only this directory knows about "framework")
│   ├── (marketing)/        # Route groups (do not affect the URL)
│   ├── (app)/              # Authenticated area
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── loading.tsx     # Skeleton / Suspense fallback
│   │   ├── error.tsx       # Error Boundary (must be "use client")
│   │   └── not-found.tsx
│   ├── api/                # Route Handlers (exception, not the default)
│   ├── proxy.ts            # Network boundary (replaces middleware.ts)
│   ├── layout.tsx          # Root layout: <html>, fonts, base metadata
│   └── globals.css         # DESIGN.md tokens via @theme
│
├── features/               # 🌟 DOMAIN SLICES (one vertical slice)
│   └── billing/
│       ├── domain/         # Entities, value objects, contracts (I*.ts)
│       ├── application/    # Use cases, services, orchestration
│       ├── infrastructure/ # Prisma, HTTP clients, queues, storage
│       ├── actions.ts      # Server Actions (mutation entrypoint)
│       ├── queries.ts      # Reads (query entrypoint)
│       ├── schemas.ts      # Zod: input validation
│       └── ui/             # Domain components (client or server)
│
├── shared/                 # Generic, shared across features
│   ├── ui/                 # Design system (shadcn + custom)
│   ├── lib/                # Pure helpers (cn, formatters)
│   ├── server/             # server-only: db, auth, config, logger
│   └── types/              # GLOBAL infrastructure types (not domain)
│
├── proxy.ts                # OR at the root, if you prefer (one file only)
└── DI/
    └── container.ts        # Manual DI container (server-side)
```

### Golden rules of the structure
1. **`app/` only routes.** It delegates to `features/`. Zero business logic in
   `page.tsx`.
2. **A feature never imports another feature.** If you need it, promote it to
   `shared/`, or raise a domain event.
3. **The interface (`I*.ts`) lives inside the slice, next to the implementation.**
   A global `src/types/` for domain types is forbidden.
4. **Domain UI lives in `features/*/ui/`.** `shared/ui/` is for what is genuinely
   generic (Button, Modal, Input).
5. **Route Handlers are the exception.** Think 10x before creating `/api`. For
   mutating your own UI, a Server Action is the default.

---

## 🧊 3. SERVER-FIRST (the rule that saves the most bundle)

| Situation                                    | Directive        | Where it lives            |
| -------------------------------------------- | ---------------- | ------------------------- |
| Layout, page, list, static form              | (none)           | **Server Component**      |
| Data fetch during render                     | (none)           | **Server Component**      |
| Button with `onClick`, controlled input      | `"use client"`   | Client Component          |
| `useState`, `useEffect`, `useRef`            | `"use client"`   | Client Component          |
| Integration with a browser-only library      | `"use client"`   | Client Component          |

### Rules
1. **Server Component is the default.** `"use client"` is a deliberate decision,
   not an automatic one.
2. **`"use client"` may only live on the lowest leaf.** If it rises, it **drags the
   whole tree** into the client bundle. Wrong? Extract the interactive part into its
   own file.
3. **Client Components may pass to Server Components only:** `children`, an `action`
   (bound), and serialisable data. Never a plain function, never a DI object.
4. **`useEffect` must not fetch data.** If it needs to fetch, it is a Server
   Component or a Server Action.
5. **An event handler that is a server request → `<form action={serverAction}>`**,
   not `onClick` + `fetch`.

### Example of the "client leaf" pattern
```tsx
// features/billing/ui/subscribe-button.tsx
"use client";
import { useFormStatus } from "react-dom";
import { subscribeAction } from "../actions";

// ✅ LEAF: only this file reaches the client bundle
export function SubscribeButton({ planId }: { planId: string }) {
  return (
    <form action={subscribeAction.bind(null, planId)}>
      <button type="submit" className="btn-primary">
        <SubmitLabel />
      </button>
    </form>
  );
}

function SubmitLabel() {
  const { pending } = useFormStatus();
  return <span>{pending ? "Processing..." : "Subscribe"}</span>;
}
```

```tsx
// app/(app)/billing/page.tsx  — STAYS A SERVER COMPONENT
import { SubscribeButton } from "@/features/billing/ui/subscribe-button";

export default async function BillingPage() {
  const subscription = await getSubscription(); // direct, no useEffect
  return (
    <main>
      <PlanList />
      <SubscribeButton planId={subscription.planId} />
    </main>
  );
}
```

---

## 📦 4. DATA LAYER

1. **Every read goes through `features/*/queries.ts`.** No `fetch`/Prisma directly in
   `page.tsx`.
2. **A query is a plain `async` function.** No react-query on the server. Cache is
   Next's job (§6).
3. **Client-side remote state that needs interactivity → TanStack Query.** But the
   source of truth is the server; if you don't need optimistic updates or background
   refetch, don't use it.
4. **`unstable_cache` / the old `revalidate` model = FORBIDDEN.** Use `'use cache'`.
5. **Type the boundary:** every repository/query return value is typed. `any` is
   forbidden at a boundary.

```ts
// features/billing/queries.ts
import "server-only";
import { db } from "@/shared/server/db";
import { cache } from "react";

export const getSubscription = cache(async (userId: string) => {
  return db.subscription.findUnique({ where: { userId } });
});
```

> React's `cache()` deduplicates identical calls within a single render. Use freely.

---

## ⚡ 5. SERVER ACTIONS

```ts
// features/billing/actions.ts
"use server";
import { z } from "zod";
import { requireUser } from "@/shared/server/auth";
import { db } from "@/shared/server/db";
import { updateTag } from "next/cache";
import { revalidatePath } from "next/cache";

const SubscribeSchema = z.object({
  planId: z.string().min(1),
  coupon: z.string().optional(),
});

export async function subscribeAction(_prev: State, formData: FormData) {
  // 1. AUTHENTICATION — always the first line
  const user = await requireUser();

  // 2. VALIDATION — Zod on the server is the ONLY source of truth
  const parsed = SubscribeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  // 3. AUTHORIZATION (role/object) — after auth, before touching data
  if (user.role === "banned") {
    return { ok: false, error: "Access denied" };
  }

  // 4. MUTATION via the application-layer use case (no rules live here)
  await new CreateSubscriptionUseCase(db).execute({ userId: user.id, ...parsed.data });

  // 5. CACHE — read-your-writes for interactive UI
  updateTag(`subscription-${user.id}`);
  revalidatePath("/billing");

  return { ok: true };
}
```

### Server Action rules
1. **They are public HTTP endpoints.** Any validation or auth that actually matters
   must live *inside* the action. Never trust the form.
2. **Fixed order:** `auth → validation → authorization → mutation → cache`.
3. **Input always through Zod.** `FormData`, `searchParams`, `params` and JSON bodies
   arrive raw.
4. **Never leak a DB object.** `select` exactly what the UI needs.
5. **Errors: return state, don't throw.** `throw` only for unexpected failures (those
   belong in `error.tsx`).
6. **`revalidateTag(tag)` (one argument) is DEPRECATED.** Use
   `revalidateTag(tag, 'max')` or `updateTag(tag)` in actions.
7. **An action may only import from `features/*` and `shared/`.** Never from `app/`.

---

## ⚡ 6. CACHE COMPONENTS (the Next 16 default)

Enable it in `next.config.ts`:
```ts
const nextConfig = { cacheComponents: true };
export default nextConfig;
```

| I want…                                        | Use                              |
| ---------------------------------------------- | -------------------------------- |
| Cache a read (into the HTML shell)             | `'use cache'` + `cacheLife('max')` |
| Tag cached data for invalidation               | `cacheTag('user-123')`           |
| Invalidate with read-in-the-same-request        | `updateTag('user-123')` (actions only) |
| SWR (user sees stale, revalidates in bg)        | `revalidateTag('tag', 'max')`    |
| Refresh NON-cached data (counters, etc.)        | `refresh()` (actions only)       |
| Time-varying values (`Date.now`, `Math.random`) | `connection()` + `<Suspense>`    |

**FORBIDDEN:** `export const dynamic`, `export const revalidate`,
`export const fetchCache`, `unstable_cache`, `fetch(..., { next: { revalidate } })`.
All replaced by the model above.

```ts
// ✅ Correct
export async function getBlogPosts() {
  "use cache";
  cacheLife("hours");
  cacheTag("blog-posts");
  return db.post.findMany();
}

// ❌ Forbidden
export const revalidate = 3600;
```

**Golden rule:** put `use cache` as close to the read as possible. Wrapping the whole
page is a last resort.

---

## 🔐 7. SECURITY

1. **`proxy.ts` is NOT a security boundary.** It is a UX optimisation (fast redirect).
   Because of CVE-2025-29927, the internal `x-middleware-subrequest` header is not
   trustworthy by default — **never** trust it.
2. **Authorization lives in the data layer.** `requireUser()` / `requireRole()` inside
   every action/query, as close to the database as possible.
3. **Zero validation on the client only.** Client-side Zod is UX. Server-side Zod is
   security.
4. **Env:** `NEXT_PUBLIC_*` ships in the browser bundle. Never put a secret there.
   Validate env with Zod at boot in `shared/server/env.ts`.
5. **Remote images:** only `images.remotePatterns` in `next.config.ts`.
   `images.domains` is deprecated.
6. **server-only:** add `import "server-only"` at the top of every module holding a
   credential or a DB client.
7. **`next/image` with a local `src` + query string** requires `images.localPatterns`.
   Without it, it breaks.

---

## 🔌 8. ROUTE HANDLERS (`app/api/*/route.ts`)

Use them **only** for: third-party webhooks, a public API for third parties, or file
downloads. For everything else: Server Actions.

```ts
// app/api/webhooks/stripe/route.ts
import { z } from "zod";
import { headers } from "next/headers";

const StripeEvent = z.object({ id: z.string(), type: z.string() });

export async function POST(request: Request) {
  const raw = await request.text();                    // ← signature needs the raw body
  const parsed = StripeEvent.safeParse(JSON.parse(raw));
  if (!parsed.success) return Response.json({ error: "invalid" }, { status: 400 });

  await new ProcessStripeEventUseCase(db).execute(parsed.data);
  return Response.json({ received: true });
}
```

Rules: validate **everything** (including the raw body), always answer with
`Response.json`, `await` `headers()`/`cookies()`, and never leak a stack trace.

---

## 📝 9. FORMS

1. **Default:** `<form action={serverAction}>` with `useFormStatus` for loading. Zero
   state JS.
2. **Need a controlled input or live validation?** → isolated Client Component with
   `useActionState`.
3. **Field errors render next to the field**, with `aria-invalid` and
   `aria-describedby`.
4. **Disable the button while `pending`.** No double submit.
5. **Success:** toast (shadcn `sonner`) + `updateTag`/`revalidatePath`. Error: red
   toast + a message in the form.

---

## 🔍 10. METADATA & SEO

```ts
// app/(marketing)/page.tsx
export const metadata: Metadata = {
  title: { default: "Brand", template: "%s | Brand" },
  description: "...",
};
export async function generateMetadata({ params }): Promise<Metadata> { /* per route */ }
```
- `metadata` is **always static** when possible. `generateMetadata` only when the data
  *is* the route.
- `params` and `searchParams` are **Promises** in Next 16: `const { slug } = await params;`
- Cache what you can: `async function getMetadata(){ "use cache"; cacheLife('hours'); ... }`
- `viewport` and `themeColor` go in the `viewport` export, not `metadata`.
- Generate `sitemap.ts` and `robots.ts` in `app/`.

---

## ⚡ 11. PERFORMANCE

| Rule | How |
| --- | --- |
| Always `next/image`, with explicit `sizes` in grids/lists | `<Image src fill sizes="(max-width:768px) 100vw, 33vw" />` |
| `next/font` for everything (zero layout shift, zero external request) | `import { Manrope, JetBrains_Mono } from "next/font/google"` |
| `next/link` for internal navigation | `<Link href>` |
| `Suspense` at the boundary, not the whole page | streamed shell |
| `use cache` on anything that reads the DB on a stable route | §6 |
| Minimal client bundle | `"use client"` on the leaf (§3) |
| Measure before optimising | `next build` shows the cost of each route |

---

## 🚨 NEXT 16 TRAPS (do not fall into them)

1. `params`/`searchParams` are **async**. `const { id } = params` → silent `undefined`.
2. `cookies()`, `headers()`, `draftMode()` are **async**.
3. `middleware.ts` was **renamed to `proxy.ts`** (exported function `proxy`).
   `middleware.ts` is ignored at build time, silently.
4. `revalidateTag(tag)` with one argument is **deprecated**.
5. `next lint` was **removed**. Use Biome/ESLint directly.
6. Turbopack is the **default**. `--webpack` only as an emergency exit.
7. Parallel routes require an explicit `default.js`, otherwise **the build fails**.
8. Route segment configs (`dynamic`, `revalidate`, `fetchCache`) **do not exist** with
   `cacheComponents`.
9. `images.domains` → `images.remotePatterns`.
10. AMP removed. `next/legacy/image` removed.

---

## 📎 COMPLEMENTARY RULES

- **Plain Node.js (workers, cron, queues, heavy webhooks):** [node.md](./node.md)
- **React (when the logic is purely a component):** [react.md](./react.md)
- **Design/UI:** [../DESIGN.md](../DESIGN.md)
- **TypeScript, Tailwind, shadcn, tests:** [./README.md](./README.md)
