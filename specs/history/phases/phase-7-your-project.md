# Phase 7 — A project that belongs to you (DONE)

> A generated app shipped this repository's own documents. An agent opening
> `SDD/README.md` first read how to publish someone else's package.

## The measurement

```
41 references to `marcelinosandroni` / `create-sdd-ai-stack`
 9 dead relative links
 1 README of 400 lines teaching an agent to publish the template
```

## The README was the worst of it

The root README is copied into `SDD/` as **the index an agent opens first**. It
contained the CLI install command, the Trusted Publishing setup, the OIDC
dashboard URL, the owner's npm username, and the essential-file list for a package
the consumer does not own.

An agent in a brand-new app would read "how to release `create-sdd-ai-stack`" as
its own documentation.

## Five leaks, all now asserted

| Leak | Fix |
| --- | --- |
| `CHANGELOG`, `RELEASE`, `EVIDENCE` copied | `RULE_DOC_COPY_SKIP` — they describe publishing *this* template |
| root README copied into `SDD/` | removed from `RULE_FILES`; a generated index is written instead |
| `ROADMAP.md`'s "Closed" table linked six phases that are not copied | reset like `PLAN.md` |
| `AGENTS.md` said "consume it with `npx create-sdd-ai-stack`" | provenance rewritten; the install line removed |
| `check-docs` resolved `./SDD/…` from `.github/` | two-way resolution: from the document, and from the project root |

**Result.** 41 references → 1 (the provenance line, on purpose). 9 dead links → 0.
49 documents, all resolving, zero rules violations.

`PRODUCT.md` and `PLANNING.md` stay: they describe the *process*, which is what a
consumer needs.

## A decision I got wrong first

The phase I proposed was "give the generated app a release workflow, so the first
ten minutes are easier".

That contradicts `PRODUCT.md` §"what we deliberately do NOT deliver": this template
ships no turnkey CI. And the decision is **right**. A CI is a set of opinions about
your registry, your secrets and your branch protection, and every one of them
would be wrong on day one. Guessing produces a workflow you delete, which costs
more than writing the one you want.

The real gap was **invisibility**. The decision was documented here and absent
there, so to someone receiving the app it read as forgetting rather than choosing.

`check-rules` RULE 8 now asserts the generated app has `typecheck`, `lint`, `test`
and `build`, and that its README says the missing CI is a decision and points at
`SDD/stacks/ci.md`.

## A guard of mine that blocked the right thing

The PLAN test banned `Current phase: \d` in the generated PLAN. And
`Current phase: 0` is **correct** — a new app *is* at phase 0.

It now asserts the phase is `0` and that no phase is marked done.

> Fifth time in this repository that a guard blocked the right thing in order to
> catch the wrong one. The pattern, by then: I write the guard from my model of
> what should happen, and it is first executed after it is already wrong.

## A guard that hid its own regression

The first version of the README test only checked the *heading*. Putting the root
README back into `RULE_FILES` therefore **passed** — the scaffold overwrites it,
and the overwrite hid the regression the test existed to catch.

Only found because every correction was verified by reverting it:

```
empty RULE_DOC_COPY_SKIP        2 tests red
README.md back in RULE_FILES    1 test red
drop the ROADMAP reset          3 tests red
drop the AGENTS.md rewrite      2 tests red
```

## Evidence

```
npm test            99 passed (was 91)
check:coverage      line 98.77 / branch 90.09 / func 95.69
check:docs          56 documents, 0 broken links

generated app       49 documents, 0 broken links, 0 rules violations
                    41 references to this repo -> 1
```
