# 🧩 SKILL: check-context

> Holds the context budget `AGENTS.md` publishes honest. Run it before a documentation
> change and in CI, so the price the laws quote to every agent cannot drift from the
> files it prices.

## ▶️ Usage

```bash
node SDD/SKILLS/check-context/check-context.mjs
node SDD/SKILLS/check-context/check-context.mjs --report
CONTEXT_CHARS_PER_TOKEN=4.8 node SDD/SKILLS/check-context/check-context.mjs
```

## 📦 What it validates

- Measures every file in the three reading tiers `AGENTS.md` §1 defines, from the
  reading order stated in the skill (not parsed from the table — see below)
- Parses the two numbers the document publishes: the Tier 1 cost and the full-set cost
- Asserts both against the measured bytes, within 12%
- `--report` prints the per-tier table plus the constant in use and the one the document
  implies

**The constant is fixed, and that is the correction.** The first version solved for it
from the Tier 1 claim it was checking. Growing a Tier 1 file raised the implied constant,
the full-set check agreed with the new constant, and the drift passed. Planting the
failure is the only reason that was caught. `CONTEXT_CHARS_PER_TOKEN` exists so a change
of prose style is a documented edit rather than a mystery.

**The tier membership is stated here on purpose.** Parsing the table would make the
verifier downstream of the thing it verifies, so an edit that moved a file out of Tier 1
and forgot the number would make the document and the check agree on a lie. Two
independent sources that can disagree is the point; the claim is parsed, the membership
is declared.

## 📐 The constant

5.0 chars/token, empirical for this repository. Markdown is denser than prose because
tables and code fences pack sentences into few characters, and these documents are
table-heavy. It was derived by dividing the published Tier 1 claim by the measured size of
the three files that claim names, and it lands on almost exactly 5.0.

## ✅ When to run it

- After adding or removing any file in the reading order
- Before committing a change to `AGENTS.md` that touches a token number
- In CI, beside the other gates

## 🚨 When it fails

```
✖ AGENTS.md publishes a context budget that no longer holds: published 13.8k, measured 15.9k (15% off).
```

Decide which moved, because they mean different things:

- **The files grew.** Update the numbers in §1 — and treat it as a finding about the
  router, not as a chore. A rule file that grows past its share means `stacks/README.md`
  is routing worse than the design assumes.
- **The prose density moved.** Change `CHARS_PER_TOKEN` with the reason next to it.

Do not widen the tolerance to make it pass. That is how real drift gets laundered into a
green build, and the next person reads a green tick as a measured number.