# ⚙️ CI / CD

## 🚨 Non-negotiable rules

1. **Minimum pipeline in every repo:** `lint` → `typecheck` → `test` → `build`, in
   that order.
2. **CI is the gate.** If it passed locally but fails in CI, CI is right.
3. **Node and the package manager are pinned** (Node 20.9+ for Next 16). No `latest` in
   CI.
4. **Deploy only from `main`.** A feature branch never deploys to production.
5. **Secrets only via repository secrets.** Never in the workflow file.
6. **A preview environment per PR is mandatory** (review quality).

## 🔧 Standard pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI
on:
  pull_request: { branches: [main] }
  push: { branches: [main] }

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm install
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test:unit -- --run
      - run: npm run build
```

> ⚠️ `cache: npm` in `setup-node` **requires a committed lockfile**. This repo is a
> zero-dependency CLI, so it has none — leave the cache off. See
> [../docs/RELEASE.md](../docs/RELEASE.md).

## 📦 DEPLOY (Vercel / Node)

- **Vercel:** connect the repo. PR previews are automatic. `SDD/` is ignored in the
  build.
- **Node (workers/CLI):** build in CI, artefact, deploy from `main` with manual
  approval.

## 🔒 PIPELINE SECURITY

- `npm audit --production` as a warning gate (it must not block on minors).
- Dependabot enabled.
- Never print `.env`/tokens in job output.

## 🏷️ RELEASE

1. Phase closed → SemVer tag (`vX.Y.Z`).
2. CI runs on the tag → release build.
3. Changelog updated ([../docs/CHANGELOG.md](../docs/CHANGELOG.md)).

## 🚫 Anti-patterns

| ❌ | ✅ |
| --- | --- |
| `continue-on-error: true` on everything | let the gate actually block |
| `npm install` (no lock) in CI | `npm ci` when a lock exists |
| Manual deploy with no approval | preview + approval on main |
| Building without typechecking | build always after typecheck |
