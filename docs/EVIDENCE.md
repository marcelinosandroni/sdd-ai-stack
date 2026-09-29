# 🧾 EVIDENCE INDEX

> What proves what, and where. When a claim in a doc or a PR needs backing, start
> here. A claim without a line in this file is a hope, not evidence.

## Commands that prove the package is sound

| Claim | Command | Floor |
| --- | --- | --- |
| The CLI works and the scaffold is correct | `npm test` | 46 tests, 0 failures |
| Coverage did not regress | `npm run check:coverage` | line 90 / branch 70 / func 80 |
| No rule points at a deleted file | `npm run check:docs` | 45 docs, 0 broken links |
| The tarball has everything | `npm run check:pack` | ≥ 12 essential files |

## Commands that prove the template is sound

Run from a generated app, or let CI do it (`.sandbox`).

| Claim | Command | Floor |
| --- | --- | --- |
| Types are sound | `npm run typecheck` | 0 errors |
| Style and imports are clean | `npm run lint` | 0 errors, 0 warnings |
| Business rules hold | `npm run test` | 6 tests |
| The app works in a real browser | `npm run test:e2e` | 20 tests, Chromium + Firefox |
| The production build works | `npm run build` | compiled successfully |
| No known high/critical CVE | `npm run audit --omit=dev --audit-level=high` | 0 high, 0 critical |

**The E2E runs against `next build && next start`, not `next dev`.** `next dev`
does not minify and takes a different render path, so a green E2E against dev
proves nothing about the build. Override with `E2E_TARGET=dev` only for the
inner loop.

## What each guard in CI actually prevents

| Job | Prevents |
| --- | --- |
| `quality` | a red test or a dead documentation link reaching the registry |
| `template` | shipping a template that does not typecheck, lint, build or run |
| `supply-chain` | a known high/critical vulnerability in the generated app |
| `actions` | an action stuck on the deprecated Node 20 runtime |

## What the release guard prevents

`release.yml` runs three gates nobody can skip:

1. **`guard`** — queries the CI conclusion for the tagged commit. A tag on a red
   `main` fails the release instead of publishing it.
2. **`verify`** — re-runs `typecheck`, `lint`, `test` and `build` on the template
   generated from the exact commit being released.
3. **pack check** — 12 essential files must exist in the tarball.

Together: a version can only reach npm after the code it contains has been
tested, built and audited in that same run.

## Historical record

| Release | What it shipped | Proved by |
| --- | --- | --- |
| 0.1.17 | first working package, 72 files | local bootstrap publish |
| 0.1.18 | OIDC support, `publishConfig.provenance` | npm rejected without it |
| 0.1.19 | dual registry, `.npmrc` shadowing fix | GitHub Packages requires a scope |
| 0.1.20 | vacuous release tests fixed | 2 tests were asserting against a newline |
| 0.2.0 | this audit: live example flow, real auth, proxy E2E, coverage floor, release guard | see the PR for 0.2.0 |

## Rules of evidence

- Green output, pasted, in the reply. Never "should work".
- A test that would still pass without the change is not a test. Break the code
  and watch it go red.
- A manual run in one terminal is evidence for that run, not for CI.
