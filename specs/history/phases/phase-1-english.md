# ✅ Phase 1 — English by default (DONE)

> **Scope:** move every stack document into `stacks/`, make English the default output
> language, and document the agent tooling worth adopting.
> **Version:** 0.1.18

---

## 🧭 What it was

- Stack rules split between the root (`NEXT.md`, `REACT.md`, `NODE.md`) and `stacks/`
  for the rest, so a reader had to know which was which before opening anything
- No language rule: docs, commits and code comments drifted between Portuguese and
  English depending on who wrote them
- No pointer to the ecosystem of tools that cut tokens and improve agent rules

## 🧭 What it became

| Before | After |
| --- | --- |
| `NEXT.md`, `REACT.md`, `NODE.md` at the root | **all inside `stacks/`** — `stacks/next.md`, `stacks/react.md`, `stacks/node.md` |
| English rule implied by some commit messages | **`stacks/language.md`** — a real law with the reasoning and the exceptions |
| No tooling guidance | **`stacks/agent-tooling.md`** — caveman, superpowers, spec-kit, BMAD, work-pattern skills, each with its trade-offs |
| Docs in Portuguese | **all docs in English** |
| 27 tests | **27 tests**, plus one guarding the new layout |

### The language rule, in one line

English for everything that lands in the repository. Talk to the user in their own
language. The only exception is an explicit request from the user.

## 🧪 Evidence

```text
npm test                             → tests 27 | pass 27 | fail 0
node SKILLS/check-docs/check-docs.mjs → ✓ 32 documents, all relative links resolve
npm pack --dry-run                   → 73 files
```

## 🐛 Caught by our own tests during the move

Moving the three files rewrote 15 files' worth of links. Two of them were wrong and
`check-docs` caught both:

- `stacks/next.md` kept root-relative links (`./DESIGN.md`, `./stacks/testing.md`)
  after the move, which is exactly the kind of silently-dead link that survives review
- `tests/scaffold.test.mjs` still asserted the old `SDD/NEXT.md` layout

One more was **not** caught by any test and would have shipped: the PowerShell
`Set-Content -Encoding utf8` used for the bulk rewrite **writes a BOM**, which corrupted
`package.json` (`\ufeff{`). Found by inspection, fixed, and every touched file was
re-normalised to UTF-8 without BOM.

> That is worth remembering: a bulk text rewrite on Windows is a code change, and it
> needs the same verification as any other.

## 🏷️ Release

```bash
git tag v0.1.18
```
