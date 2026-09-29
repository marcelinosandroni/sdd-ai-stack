# 📦 PRODUCT

> **What this template delivers, to whom, and what it deliberately does NOT deliver.**
> Fill in the "Consuming project context" section when you use it for real.

---

## 🎯 The problem

AI agents (Claude Code, Cursor, Copilot…) fail on projects without explicit rules for
three predictable reasons:

1. **Too much context** — they read 40 files and conclude nothing.
2. **No stopping criterion** — they invent architecture and never stop.
3. **No process memory** — they don't know they are halfway through a task.

This is **Spec-Driven Development applied to agents**: the specification becomes the
nervous system, and the agent only needs to know *where to look right now*.

## 💡 The solution

A package with three parts:

| Part | Problem it solves |
| --- | --- |
| **Rule router** | The agent reads `AGENTS.md` → `PLAN.md` → the stack doc. Minimum context. |
| **Project template** | No need to invent a structure. Next.js 16 + design system, ready. |
| **CLI + submodule** | Installation in one command, updatable through git. |

## 👤 Who it's for

- Small and mid-size teams using AI as a pair programmer
- Devs who lose the thread halfway through a long refactor
- Teams that want to standardise delivery across humans *and* agents

## 🧭 Design principles

| Principle | Practical consequence |
| --- | --- |
| **Router in everything** | Every doc opens with "if you're doing X, read §Y" |
| **One task at a time** | `PLAN.md` allows exactly one task `[-]` |
| **Proof of life** | No task is marked `[x]` without pasted green terminal output |
| **Vertical slices** | One requirement = one folder |
| **Tokens in one place** | The design changes in `@theme`, never in a component |
| **English by default** | Cheaper in tokens, portable, and compatible with every tool |
| **Docs near what they edit** | `error.tsx` without `"use client"` is a broken build. Proximity pays. |

## 🚫 What we deliberately do NOT deliver

- An AI account, model prompts, or an LLM gateway
- Ready-made authentication (the extension point is `src/shared/server/auth.ts`)
- A configured database (the example slice uses an in-memory repository)
- A multi-package monorepo
- Turnkey CI/CD (the rules live in `stacks/ci.md`)

> What we don't deliver is **deliberate**: a template that solves one problem well is
> more useful than one that solves everything badly.

## 🧪 How we know it works

The template in `template/next/` passes `typecheck`, `lint`, `test`, `test:e2e` and
`build`. The CLI itself has 27 tests. Real bugs have already been found by that
validation — see [`CHANGELOG.md`](./CHANGELOG.md) § 🐛.

---

## 📝 Consuming project context

> Fill this in when you install this template for real.

**Name:** [YOUR APP]
**What it does:** [1 line]
**End user:** [who uses it]
**Active stack:** Next.js 16 · [others]
**Integrations:** [Stripe, OpenAI, …]
**Critical business rules:**
- [e.g. a free user generates at most 5 videos/day]
