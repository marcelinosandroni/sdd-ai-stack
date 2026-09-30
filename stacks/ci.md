# ⚙️ CI / CD

> Spine: [clean-code.md](./clean-code.md).

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
> zero-dependency CLI, so it has none — leave the cache off.

> ⚠️ **`npm ci` requires a lockfile, and the Next template ships without one.**
> In this repo's CI use `npm install`. In a **generated app**, use `npm ci` after
> the consumer commits their own lockfile — and treat the first `npm ci` as the
> moment the cache becomes safe.

## 📦 DEPLOY (Vercel / Node)

- **Vercel:** connect the repo. PR previews are automatic. `SDD/` is ignored in the
  build.
- **Node (workers/CLI):** build in CI, artefact, deploy from `main` with manual
  approval.

## 🔒 PIPELINE SECURITY

- `npm audit --omit=dev --audit-level=high` as a gate. High and critical block;
  low and moderate do not.
- Dependabot enabled.
- Protect `main`: `required_status_checks` with `strict: true`, so a branch must
  be up to date before merging. Without this, a red main is invisible until the
  next release tries to ship it.
- A release workflow must **verify CI is green on the commit it is releasing**,
  and re-run the build gates itself. `on: push: tags` fires no matter what state
  the repository was in.
- Least privilege: `permissions: contents: read` at the top, and each job adds
  only what it needs (`id-token: write` for npm provenance, `packages: write`
  for GitHub Packages).
- Never print `.env`/tokens in job output.

## 🏷️ RELEASE

1. Phase closed → SemVer tag (`vX.Y.Z`).
2. CI runs on the tag → release build.
3. The tag must match the version in `package.json`, and the release must refuse
   to run if it does not. A tag and a version that disagree ship two different
   packages under one name.
4. The changelog entry lands **in the release PR**, not after the tag. After the
   tag it documents something that already happened.

> 📌 A generated app has no `docs/CHANGELOG.md` — the template's changelog is
> its own, and it is not copied. Create yours on the first release.

## 🚫 Anti-patterns

| ❌ | ✅ |
| --- | --- |
| `continue-on-error: true` on everything | let the gate actually block |
| `npm install` (no lock) in CI | `npm ci` when a lock exists |
| Manual deploy with no approval | preview + approval on main |
| Building without typechecking | build always after typecheck |
