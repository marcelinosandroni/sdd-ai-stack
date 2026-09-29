# 🧠 APP-STACK (which stack this app uses)

> **Stack pointer.** The agent reads this file and opens the matching rules document.
> Editing this file is **automatic** (it's project configuration). Editing the rules
> themselves is **not**.

---

## 🎯 Active stack

| Role | Stack | Rules document |
| --- | --- | --- |
| **App (frontend + backend)** | **Next.js 16** — App Router | [stacks/next.md](./stacks/next.md) ⭐ **DEFAULT STACK** |
| **UI library** | shadcn/ui + Tailwind CSS v4 | [stacks/shadcn.md](./stacks/shadcn.md) · [stacks/tailwind.md](./stacks/tailwind.md) |
| **Language** | TypeScript (strict) | [stacks/typescript.md](./stacks/typescript.md) |
| **Output language** | English | [stacks/language.md](./stacks/language.md) |
| **Extra backend** | Plain Node.js (workers, cron, queues) | [stacks/node.md](./stacks/node.md) |
| **Database** | Prisma ORM | [stacks/database.md](./stacks/database.md) |
| **Validation** | Zod | [stacks/typescript.md](./stacks/typescript.md) |
| **Tests** | Vitest + Playwright | [stacks/testing.md](./stacks/testing.md) |
| **AI / LLM** | (if the app uses it) | [stacks/ai.md](./stacks/ai.md) |
| **Deploy** | Vercel | [stacks/ci.md](./stacks/ci.md) |
| **Versioning** | Git + Conventional Commits | [stacks/git.md](./stacks/git.md) |

---

## 🔀 How to switch this app's stack

1. Edit the table above with the real stack for this project.
2. If you use a stack that has no document here, create `SDD/stacks/<stack>.md`
   following the pattern of the others.
3. **Do not** edit `AGENTS.md` §1 (which points at the default doc) without asking the
   human first.

> While `APP-STACK.md` points at `stacks/next.md`, the template's default stack is
> Next.js.
