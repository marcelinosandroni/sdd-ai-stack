# ✅ Phase 2 — Every stack, one spine (DONE)

> **Scope:** cover all the stacks, give them one shared discipline, compress every doc.
> **Version:** 0.1.19

---

## 🧭 What it was

- Rules for Next.js, React, Node and the tooling. No other stack covered.
- Per-language advice repeated, never generalised. Each doc invented its own SOLID wording.
- Docs written in full prose, so they reloaded a lot of tokens for little information.

## 🧭 What it became

| Before | After |
| --- | --- |
| No cross-language discipline | **`stacks/clean-code.md`** — the spine, mapped by every stack file |
| No language-agnostic architecture | **`stacks/architecture.md`** — dependency rule, composition root, folder table |
| Next / React / Node only | **+7 stacks**: Java, C#/.NET, Go, Python, Node frameworks, Angular, Vue, Svelte |
| Prose docs | **Every doc compressed**, with the rules written down in `language.md` §2 |
| 27 tests | **30 tests** — three new structural guards |

### The spine

`clean-code.md` is the shared discipline: SRP, SOLID (each with a *smell when broken*),
separation of concerns, hexagonal ports and adapters, design patterns paired with the pain
that justifies each, twelve code smells, and an eight-item review checklist to run before
marking a task done.

Every stack file starts by mapping it. A test enforces that, because nine docs drifted off
the spine before the test existed.

### The stacks added

| Stack | What is actually opinionated, not generic |
| --- | --- |
| **Java** | feature-first packages, records, `sealed` + pattern matching, constructor injection only, and the Quarkus native-image reflection rule |
| **C# / .NET** | records, nullable reference types, `async` all the way (no `.Result`), `sealed` default, EF Core confined to `Adapters/Outbound` |
| **Go** | `sqlc` over GORM, errors wrapped with `%w`, one goroutine owner, `context` first, `-race` in CI |
| **Python** | `Protocol` over `ABC`, no mutable defaults, and the two truth tables that matter — Django (queryset in `selectors.py`, signals are the anti-pattern) and FastAPI (a blocking DB call inside `async def` blocks the event loop) |
| **JS/TS** | value objects for money, dates and ids: integer minor units, injected clock, branded id types |
| **Node frameworks** | the Express 5 gotcha (it forwards rejected promises, so the `asyncHandler` in most tutorials is Express 4), and Nest's rule that using it without DI is worse than Express |
| **Angular** | `OnPush` everywhere, `asReadonly()` on every exposed signal, `track` mandatory, `HttpTestingController.verify()` |
| **Vue** | `ref` over `reactive` by default, `shallowRef` for lists, Pinia for client state and never as a server cache |
| **Svelte** | `$effect` only for real side effects **with a mandatory cleanup**, and the `+page.svelte` renders / `+page.server.ts` fetches split |

### Token economy

`language.md` §2 is now a law, not a preference. It states what to cut, what is never
compressed, and two rules that are easy to get wrong:

- **Never invent abbreviations.** `cfg`, `impl`, `req` cost the same as the full word under
  a modern tokenizer *and* still cost a decode.
- **Never grow output to sound compressed.** If a terse phrasing is not shorter than the
  plain one, use the plain one.

Plus the limit that makes it safe: **ambiguity wins over brevity**. And the exception that
already existed: evidence is never compressed.

## 🧪 Evidence

```text
npm test                             → tests 30 | pass 30 | fail 0
check-docs                           → ✓ 44 documents, all relative links resolve
npm pack --dry-run                   → 86 files, 106.4 kB
```

## 🐛 Caught by the new tests

All three guards found something real before they were trusted:

- the index never linked `node.md` or `svelte.md` — both existed, neither was reachable
- nine stack docs had drifted off the spine without declaring it
- the third guard's *first* version asserted the wrong link format (the index lives inside
  `stacks/`, so its links are sibling-relative). The test was wrong, not the doc.

> A guard that has never failed has not been tested. Each one of these was verified by
> watching it fail first.

## 🏷️ Release

```bash
git tag v0.1.19
```
