# 🧩 SKILL: check-facts

> Validates that the **numbers this repository states about itself** are still true.
> Run it in the commit hook and in CI so a document cannot quietly go stale.

## ❓ Why this exists

`docs/PRODUCT.md` claimed the CLI had 27 tests while the suite had 79. `README.md`
claimed 52 tests and 33 documents. Every one of those was green, because a number
in prose is not a check.

The cost was never the wrong number. It is that a document which misstates a fact
it *could have verified* teaches an agent to trust no document — and an agent that
catches one bad number stops reading the rules. That is the exact failure this
template exists to prevent, committed by the template itself.

## ▶️ Usage

```bash
npm run check:facts
node SDD/SKILLS/check-facts/check-facts.mjs
```

## 📦 What it validates

- Counts `^test(` declarations across `tests/*.test.mjs`, and markdown files the
  way `check-docs` counts them
- Compares both against every `N tests` / `N documents` claim in `README.md` and
  `docs/PRODUCT.md`
- Exit 1 naming the file, the stale claim and the real value — or exit 0 with
  **both counts printed**, so a drift is visible in the CI log even before it
  fails someone

## 🚨 The zero-claim failure mode

`⚠ check-facts: nenhuma afirmação verificável encontrada para conferir.`

**This is not a pass. Treat it as a failure to fix.**

It means the documents no longer state a single number that this check can
verify — which happens the moment someone "fixes" a stale claim by deleting it
instead of correcting it. The check then has nothing to see and reports nothing,
and a reader sees green.

That happened here: correcting `README.md` by hand removed the last verifiable
claim, the check went quiet, and the only reason it was caught is that a test
asserts the check *finds something*:

```js
test("the check sees the claims it claims to see", ...)
```

**If you remove the numbers from the docs, remove that test too — and then the
check has no reason to exist.** Write the real number instead.

## 🛡️ Writing a document that quotes a stale number

The check cannot tell an **assertion** from a **quotation**. A document explaining
a stale number has to quote it, so three contexts are ignored:

| Context | Example |
| --- | --- |
| Fenced code blocks | a `bash` example showing output |
| Backticked spans | `` `27 tests` `` inside a sentence about the number |
| Explicit escape | `<!-- fact:off -->` … `<!-- fact:on -->` |

The escape hatch exists because `README.md` documents this very bug and has to say
"this README claimed 27 tests". Without a way to write that sentence honestly, the
sentence gets deleted and the check quietly stops being worth running.

**Rule: an assertion goes in prose without backticks. A quotation uses one of the
three.** If a real claim is hidden inside backticks, it is not checked — that is
the trade this design accepts, and it is better than a check nobody will run.

## ✅ When to run it

- Before committing a change to `README.md` or `docs/PRODUCT.md`
- In CI, alongside the tests
- After adding or removing tests — **the count moved and nothing else will notice**

## 🔢 Why counting is static

The count comes from scanning `^test(`, not from running the suite.

`node --test` **refuses to recurse inside a test file**:

```
Warning: node:test run() is being called recursively within a test file.
```

So a guard that invokes this script from a test cannot have this script call
`node --test` — and `tests/check-facts-contract.test.mjs` does exactly that. The
first two versions tried it, and both failed for this reason.

The scan is exact while the suite has one top-level `test()` per declaration and
no dynamic generation. If that changes, the count drifts — **quietly**, reporting
safety it does not have. The guard against that is visible rather than automatic:
the check prints its own count next to `npm test`'s, in the same CI log.

A cached count would hide the same drift, and would be wrong on exactly the day
it matters — the day someone adds a test.
