# 🚀 [YOUR APP NAME]

> ⚠️ **FOCUS HERE:** replace this block with the real description of the application.
> What does it do? What problem does it solve? Who is the end user? Straight to the
> point, no waffle.

## 🏗️ Stack and Architecture

This project follows **Spec-Driven Development** with **Next.js 16** and **vertical
slices**.

**Read this before touching a line of code:**

| Document | Scope |
| --- | --- |
| [🤖 AGENTS.md](./AGENTS.md) | **Agent laws + delivery flow (READ THIS FIRST)** |
| [🎯 specs/PLAN.md](./specs/PLAN.md) | The task being worked on RIGHT NOW |
| [🧠 APP-STACK.md](./APP-STACK.md) | Which stack this app uses (pointer) |
| [⚛️ stacks/next.md](./stacks/next.md) | Next.js 16 rules — **the default stack** |
| [🟢 stacks/node.md](./stacks/node.md) | Plain Node.js (workers, cron, queues) |
| [⚛️ stacks/react.md](./stacks/react.md) | React rules |
| [🗣 stacks/language.md](./stacks/language.md) | Output language — **English by default** |
| [🎨 DESIGN.md](./DESIGN.md) | Design system (tokens, typography, components) |
| [🏗️ ARCHITECTURE.md](./ARCHITECTURE.md) | Global architecture (vertical slices) |
| [🧱 stacks/](./stacks/README.md) | TypeScript, Tailwind, shadcn, tests, DB, AI, Git, CI |

## 🛠️ Main Stack

- **App (fullstack):** Next.js 16 (App Router, Server Actions, Route Handlers)
- **UI:** React 19.2 (Server Components by default) + Tailwind v4 + shadcn/ui
- **Data:** Prisma + [PostgreSQL / MySQL / SQLite]
- **Validation:** Zod
- **Tests:** Vitest (unit/integration) + Playwright (E2E)
- **Extra backend (if any):** plain Node.js for workers/cron/queues
- **Deploy:** [Vercel / Node VPS / Railway]

---

## 📝 App-Specific Details

*(Write HERE the business rules, integrations, and flows unique to this app. **Do not
leave it blank.**)*

- **Third-party integrations:** [e.g. OpenAI, Stripe, WhatsApp API]
- **Main features:**
  - [e.g. AI video generation]
  - [e.g. Executive metrics dashboard]
- **Critical business rules:**
  - [e.g. A free user can generate at most 5 videos per day]
- **Domain entities:** [list the main entities and their invariants]
- **Authorisation rules:** [e.g. an admin sees everything; a member only their own
  workspace]
