# ⚖️ SKILL: check-rules

> Makes the written rules executable. The rules in `stacks/*.md` are prose, and
> prose is not a control: an agent reads `language.md`, writes Portuguese, and the
> CI is green anyway.

## ▶️ Usage

```bash
node SKILLS/check-rules/check-rules.mjs            # this repository
node SKILLS/check-rules/check-rules.mjs <appDir>   # a generated app
```

With an argument it checks a **generated app**: does the template obey the template's
own rules? Without one it checks the source that produces them.

## 📦 The rules it enforces

| Rule | From | What fails |
| --- | --- | --- |
| 1 | `language.md §1` | Portuguese in code, CSS, error strings |
| 2 | `git.md §1` | somebody else's identity in a `git commit` argument |
| 3 | `git.md §1` | the template author's name in the rules that ship |
| 4 | `AGENTS.md §4` | "never install at the root" inside a generated app |
| 5 | `testing.md` | the pyramid names a layer the app does not have |
| 6 | `AGENTS.md §4` | a doc runs `npm run x` and no `package.json` defines `x` |
| 7 | `DESIGN.md §2` | a token disagrees with the documented hex |
| 8 | `PRODUCT.md` | the app does not ship the gates it claims, or hides that it has no CI |

Every finding names the rule it comes from, so a failure is actionable without
opening the docs.

## 📌 Why RULE 1 is a word list and not a string

Its first version matched one remembered sentence — `"Não foi possível"` — plus a
few obvious words. It was green for months over a design system documented entirely
in Portuguese, and CI cited it as proof the repository obeyed its own language law.

**A guard that only catches what it was written against is worse than no guard**,
because it is quoted as evidence. The patterns are now high-signal Portuguese words
that never appear in English code, chosen so a false positive costs nothing. The
conservative bias is deliberate: a rule that cries wolf gets deleted, and deleting
it loses the guarantee entirely.

RULE 1 also walks `template/next/src` in **this** repository. It used to run only
when its argument was a generated app — and CI passes no argument — so the template
source, the code that actually ships, was the one place never checked.

## 🚫 Not for consumers

It reads this repository's `DESIGN.md` and token file. A consuming app has no such
pair, which is why it crashed with `ENOENT` in every generated app until phase 8.
See `RULE_SKILL_COPY_SKIP` in `lib/constants.mjs`.