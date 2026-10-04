# Phase 13 — A theme that is an asset (CLOSED, delivered inside phase 11)

> This phase was planned, then delivered as a task inside phase 11 before it ever
> needed a PLAN block of its own. The archive exists because the ROADMAP records it
> as a closed phase, and a closed phase with no archive loses its reasoning the next
> time somebody edits the ROADMAP — which is defect 3 of phase 11, this very phase.

**Problem.** Every design token lived inside an `@theme` block in
`template/next/src/app/globals.css`. The design system was therefore inseparable from
one framework: "the design is mine" was a property of the Next template rather than of
this package. Seven backend rule sets ship here, and not one of them could reach a
single colour.

**Delivered.** `themes/executive/tokens.css` is the canonical source. It is in the
published tarball (`package.json` → `files`) and reachable at `./themes/*`, so the
theme is consumable by anything, not only by `npx create-sdd-ai-stack`.

## The decision that was forced, not chosen

The first attempt kept the canonical file above the template and imported it across
directories. Turbopack refused the build outright:

```
FileSystemPath("").join("../../themes/executive/tokens.css") leaves the filesystem root
```

So the tokens must physically live **inside** the app. That is a bundler constraint,
and it is worth recording because it dictates the whole shape: one source of truth, a
byte-identical copy per template, and a guard that fails when the copies differ.

## What makes the copies trustworthy

| Guard | Asserts |
| --- | --- |
| `tests/theme.test.mjs` | the canonical file exists, declares `@theme`, and declares at least one colour |
| `tests/theme.test.mjs` | every template's copy is byte-identical to the canonical file |
| `tests/theme.test.mjs` | every template's `globals.css` imports its copy |
| `tests/theme.test.mjs` | no template still declares `@theme` inline, so the import is not decorative |
| `tests/theme.test.mjs` | a generated app receives the canonical file, not the template's copy |
| `tests/theme.test.mjs` | `themes/` is in `package.json` → `files`, or the theme exists only in the repository |
| `check-rules` RULE 7 | `DESIGN.md` and the token file agree — **and it fails when it reads zero tokens** |

That last row is the one that matters. RULE 7 compares two files by looking for tokens
in one of them, so pointing it at a file that no longer holds any produces **zero
findings and a green run**. It would have kept passing while proving nothing. It now
prints how much it compared, so a pass is legible:

```
(RULE 7 compared 35 tokens against 27 documented)
```

A guard that cannot report "I checked nothing" is a guard that cannot lie by omission.

## Evidence the theme is really applied

Not assumed — built and inspected. `npm run build` in `template/next` succeeds with
`@theme` inside an imported file, and the emitted bundle contains:

```text
--color-primary:#baf336    FOUND
bg-surface-raised          FOUND
border-border-subtle       FOUND
bg-primary                 FOUND
text-text-secondary        FOUND
```

`bg-surface-raised` is the load-bearing probe: that utility **cannot** exist unless
`--color-surface-raised` was registered through `@theme` in the imported file. A green
build alone would only have proved the build survived; this proves the tokens landed.

## Scope out

A second theme. One portable theme proves the mechanism, and a second theme would test
the wrong thing — whether the mechanism survives being used twice, which only phase 12
can answer honestly.