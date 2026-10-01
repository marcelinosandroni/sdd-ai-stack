# 🧩 SKILL: dogfood

> Generate an app and walk the cycle the rules describe. The only check that runs
> the template against something the template did not produce.

## ❓ Why this exists

Everything else in this repository is validated against **this** repository. It
has `tests/cli-flags.test.mjs`, its own `package.json`, its own
`.github/workflows/release.yml`. A generated app has none of those three.

Phase 3 validated the rules by letting an agent follow them here. They were never
validated in a project the template *generated*, and the gap was not theoretical:

| Found by the dogfood | Why nothing else could see it |
| --- | --- |
| `check-rules` crashed with `ENOENT` | reads `SDD/package.json`, which only exists here |
| `check-coverage` crashed | looks for this repository's test files by name |
| `check-facts` crashed | reads `.github/workflows/release.yml` |
| `TASK_TEMPLATE.md` linked `../../DESIGN.md` | the file is three levels down, and no `phase-N/` ever existed here |
| `PREFLIGHT.md` said "6 passed" / "20 passed" | those are this repository's counts, shipped in someone else's project |
| `create-feature` generated no test | it compiled, which is all the old gate checked |

Every one of them was green on `main`. None of them can be found from inside this
repository — they exist only in a generated app.

## ▶️ Usage

```bash
node SDD/SKILLS/dogfood/dogfood.mjs          # ~1s, no install
node SDD/SKILLS/dogfood/dogfood.mjs --full   # ~80s, installs and runs every gate
node SDD/SKILLS/dogfood/dogfood.mjs --keep   # leave the app on disk to inspect
```

## 📦 What it walks

1. **generate** an app into a temp directory
2. **every gate `PREFLIGHT.md` names**, read from that file rather than a
   hardcoded list — a list here would drift from the document that tells an agent
   what to run, and that drift is the failure this catches
3. **`create-task`** and **`create-feature`** — the automations an agent calls
4. **the slice the skill promises compiles**, plus that it ships a test
5. **every shipped skill**, because a script that crashes where it lands is worse
   than one that was never shipped
6. **every relative link**, because a dead link in the document an agent reads
   first teaches it to distrust the rest

## ⏭️ What it skips, and why

`npm install` and the E2E suite are behind `--full`. Both run in `ci.yml` against
the template already; repeating them here would triple the job to re-prove what
the Template job proves. This script is about what a generated app has **that the
template does not** — the rules, the skills, the automations.

## 🛡️ Skipped is not passed

A gate that could not run is printed in its own column with the reason:

```
  ○ npm run test:e2e  — skipped: the host cannot start a Playwright browser
```

Firefox does not launch on the Windows sandbox this was written on, and CI runs
both browsers successfully against the same template. Reporting that as a failing
gate would be reporting the machine as the product — and a red suite that means
"the machine" is a red suite people learn to ignore.

## ✅ When to run it

- **In CI, on every PR.** It is the only job that tests what the template emits.
- After touching `lib/scaffold.mjs`, `lib/constants.mjs`, or any `SKILLS/*` that
  is copied into a generated app
- Before a release: `node SDD/SKILLS/dogfood/dogfood.mjs --full`
