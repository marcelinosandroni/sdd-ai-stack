# Phase 10 — A template that does not lie about itself (DONE)

> Four numbers in prose, all stale, none reported. The number was never the cost.

## The problem

`docs/PRODUCT.md` claimed 27 tests while the suite ran 79. `README.md` claimed 52
tests and 33 documents. Four claims, every one of them wrong, and **nothing was
red** — because a number written in a document is not a check.

## The cost was never the wrong number

It is that **a document which misstates a fact it could have verified teaches an
agent to trust no document.** That is the exact failure this template exists to
prevent, committed by the template itself, in the file a new user reads first.

An agent that catches one false number in `PRODUCT.md` has learned that documents
here are worth verifying — and from that moment it either verifies everything,
which costs tokens this repository spends a whole rule file trying to save, or it
trusts nothing, which costs correctness.

## Delivered

`SKILLS/check-facts` recomputes every verifiable claim in `README.md` and
`docs/PRODUCT.md`, and fails naming **the file, the stale value and the real one**.
Wired into CI and into `prepublishOnly`, so a lie cannot ship.

## Three things I got wrong building it

All three are recorded in `SKILLS/check-facts/SKILL.md`, because each one is a trap
that looks like a solution:

1. **The test count does not belong in a document.** It went stale four times in
   one afternoon — every test added to the guard invalidated the claim the guard
   existed to protect. The guard was protecting a number it was itself changing.
   The tracked claim is now "17 essential files", which changes only when the
   package changes shape.
2. **`node --test` refuses to recurse inside a test file**, so the check cannot run
   the suite from a test that invokes it. The count became a static scan — which
   can drift silently, so the check now prints its own number beside `npm test`'s
   in the same log, where a disagreement is visible.
3. **The check had a degenerate state.** Correcting a document by *deleting* the
   number left it green with nothing left to verify — a guard that passes because
   its target no longer exists. It warns now, and a test asserts it always finds at
   least one claim.

## Scope out

Checking prose quality, style or grammar. Verifiable claims only — the moment a
checker grades writing, it becomes a style opinion with an exit code.

## Evidence

```
check:facts    1 claim verified (110 tests, 59 documents)
```

One claim, deliberately. Phase 11 added the structural claims; this phase taught
that **a checker with no target is not a passing checker.**