# 🚀 RELEASE — publishing to npm and GitHub Packages

> **One tag, two registries.** A push of a `v*` tag publishes to **npm** *and*
> **GitHub Packages**, in parallel, from the same commit.
>
> **One path:** you version locally, GitHub Actions publishes. There is no manual
> `npm publish` in this project — on purpose, so there is never two ways to do it.

```text
npm run version:minor   →  0.1.19 → 0.2.0 (commits + creates tag v0.2.0)
git push origin main
git push origin --tags  →  fires Release  →  npm + GitHub Packages
```

| Registry | Package name | Auth | Public? |
| --- | --- | --- | --- |
| [npmjs.com](https://www.npmjs.com/package/create-sdd-ai-stack) | `create-sdd-ai-stack` | `NPM_TOKEN` or OIDC | public from the first publish |
| [GitHub Packages](https://github.com/users/marcelinosandroni/packages) | `@marcelinosandroni/create-sdd-ai-stack` | `GITHUB_TOKEN` (built in) | **private by default — one-time flip, see §1.4** |

---

## 0. How to version (we are on `0.x`)

The project is on **`0.1.x`** on purpose: the rules and the template will still change
with real usage. Reading the versions:

| Change | Bump | Example | Command |
| --- | --- | --- | --- |
| Bug fix, doc fix, one new rule | **patch** | `0.1.17 → 0.1.18` | `npm run version:patch` |
| New rule, new template feature, breaking config change | **minor** | `0.1.17 → 0.2.0` | `npm run version:minor` |
| Structural rewrite of the rules (e.g. Next 16 → 17) | **major** | `0.1.17 → 1.0.0` | `npm run version:major` |

> While on `0.x`, **the minor is the breaking change.** Changing the shape of the rules
> or the template bumps the minor, not the patch. `major` stays reserved for when the
> interface stabilises and we move to `1.0.0`.

---

## 1. Why two names for one package

**GitHub Packages only accepts scoped packages.** The name must be
`@NAMESPACE/PACKAGE-NAME`, where the namespace is the account that owns the repo.
An unscoped `create-sdd-ai-stack` is rejected with a `404`, and there is no flag to
work around it — the scope has to be in the name.

So the two registries get two names, and the release workflow rewrites the name
**only for the GitHub step**, in a disposable checkout. Our committed `package.json`
stays unscoped, because an npm scope would make npm publish it **private by default**.

### 1.1 What the GitHub job does differently

| | npm job | GitHub Packages job |
| --- | --- | --- |
| `name` in `package.json` | `create-sdd-ai-stack` | rewritten to `@marcelinosandroni/create-sdd-ai-stack` |
| `publishConfig` | `{ access: "public" }` | **deleted** |
| flags | `--access public --provenance` | `--provenance=false` |
| registry | registry.npmjs.org | npm.pkg.github.com |
| token | `NPM_TOKEN` or OIDC | `secrets.GITHUB_TOKEN` |
| permissions | `contents: read`, `id-token: write` | `contents: read`, `packages: write` |

Two flags are the trap, and both come from the precedence we already hit with
`publishConfig`:

- **`--access public` is rejected** by GitHub Packages for a private package.
- **`--provenance` is npm-only.** npm reads `publishConfig` **above** CLI flags, so a
  leftover `publishConfig.provenance` could not be overridden with `--no-provenance`
  either. The job therefore **deletes `publishConfig` entirely** rather than trying to
  out-flag it.

A test enforces all of this, including that `repository.url` points at
`marcelinosandroni` — GitHub Packages uses it to link the package to the repo, and a
mismatch between the scope and the repo owner is rejected.

### 1.2 Both jobs, same version

Both `publish` and `publish-github` `needs: verify`, so they run in parallel from the
same commit and read the same `package.json` version. A failure on one registry does
**not** cancel the other: npm can be down while GitHub Packages succeeds.

`concurrency: release-registry` still serialises *runs* — two publishes of the same
version must never race.

### 1.3 Scope mapping in `.npmrc`

```ini
@marcelinosandroni:registry=https://npm.pkg.github.com
```

This only routes `@marcelinosandroni/*` to GitHub Packages. The unscoped
`create-sdd-ai-stack` still goes to npmjs. It exists so `npm install
@marcelinosandroni/create-sdd-ai-stack` resolves for anyone cloning the repo.

> ⚠️ The `.npmrc` still must **not** declare `_authToken`. That line shadows the user's
> `~/.npmrc` and silently zeroes auth — see §7 below.

### 1.4 One-time: make the GitHub package public

GitHub Packages creates npm packages **private**. A private GitHub package needs
authentication to install, which defeats the purpose of a second registry.

After the first successful publish:

1. <https://github.com/users/marcelinosandroni/packages>
2. Open `@marcelinosandroni/create-sdd-ai-stack`
3. **Package settings → Change visibility → Public**
4. Confirm the package is linked to `sdd-ai-stack` and inherits its access

Only after that does anyone else need auth to install it.

### 1.5 Secrets

| Secret | Registry | How to set |
| --- | --- | --- |
| `NPM_TOKEN` | npm | `gh secret set NPM_TOKEN --repo marcelinosandroni/sdd-ai-stack` |
| `GITHUB_TOKEN` | GitHub Packages | **built in.** Nothing to create. Needs `permissions: packages: write`, which the workflow declares |

> On the npm side, the `NPM_TOKEN` secret is **optional**: on path A (OIDC) it must
> *not* exist, and on path B it must. See §2.

---

## 2. npm authentication — read this before creating any token

> 🚨 **With 2FA on the npm account, an ordinary token will NOT publish.**
> CI cannot type the authenticator code, so the publish fails with:
>
> ```
> npm error code EOTP
> npm error This operation requires a one-time password from your authenticator.
> ```
>
> This is **not a workflow bug** — npm is demanding human presence. There are three
> exits, and only one is good.

| Path | Effort | Status |
| --- | --- | --- |
| **A. Local bootstrap + OIDC** | ~5 min, once | ✅ **Recommended.** No token, ever again |
| **B. Token with "Bypass 2FA"** | ~2 min | ⚠️ Works today, **deprecated Jan 2027** |
| **C. Stage-only token** | ~10 min | 🛡️ Safest, requires approving each release |

### 2.0 The misleading `404 Not Found` on a first publish

> ```
> npm error code E404
> npm error 404 Not Found - PUT https://registry.npmjs.org/create-sdd-ai-stack - Not found
> ```

**You do not need to "create" the package first.** `npm publish` creates it by itself on
the first publish. This 404 on PUT means **the registry did not recognise you as
authorised** — npm will not confirm whether a name exists to someone without access.

The usual cause (and the one that happened here) is the **project `.npmrc`** declaring
an `_authToken` that shadows yours:

```text
project  >  ~/.npmrc (user)  >  npm global
```

With `//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}` in the project `.npmrc` and
the variable empty, the effective token is **empty** — and the symptom looks nothing
like "auth is broken":

| Command | Valid token | Zeroed token |
| --- | --- | --- |
| `npm whoami` | `your-username` | `401 Unauthorized` |
| `npm publish` (first time) | creates the package | `404 Not Found` (PUT) |

**Five-second diagnosis:**

```bash
npm whoami                                            # must print your username, not 401
npm config get "//registry.npmjs.org/:_authToken"    # must have length > 1
```

The fix is **not to declare `_authToken` in the project `.npmrc`** — only `registry=`.
Auth comes from `~/.npmrc` (local) or the `NODE_AUTH_TOKEN` environment variable (CI).
A test locks this in: `publish: the project .npmrc must not declare _authToken`.

### 2.1 Path A — Trusted Publishing (OIDC), the only path

> **There is no token in this repository.** `NPM_TOKEN` was deleted once OIDC
> worked, and it should not come back. A long-lived token plus mandatory 2FA is
> the exact combination that produces `EOTP` at 3am, and a token in a repo is a
> credential that can leak through a fork, a backup, or a collaborator.

One-time setup, in npmjs.com → `create-sdd-ai-stack` → Settings → Trusted
publishing:

| Field | Value |
| --- | --- |
| Provider | GitHub Actions |
| Organization / user | `marcelinosandroni` |
| Repository | `sdd-ai-stack` |
| Workflow filename | `release.yml` |
| Environment name | `npm` |

The environment name matters: the npm job declares `environment: { name: npm }`,
and a Trusted Publisher that names a different environment never matches. The
GitHub environment itself needs no protection rule — it exists to bind the
credential, not to gate a human.

Requirements:

- the package must already exist on npm (it does: `0.1.17`)
- the runner's npm must understand OIDC, so the job upgrades npm first
- **do not set `NODE_AUTH_TOKEN`** in the job: with it present the npm ignores
  the OIDC and the publish fails with an error that names neither cause

With this configured, the `Authenticate` step sees no `NPM_TOKEN`, writes
nothing, and `npm publish --provenance` picks up the OIDC identity.

OIDC is the durable answer: short-lived, GitHub-signed credentials, **no token at
all**. It has one limitation: **OIDC cannot publish a package's first version** — the
package must already exist on npm before you can configure the publisher.

Hence "publish once locally, then never again":

**Step 1 — publish the first version from your machine** (you have the authenticator):

```bash
npm publish --access public --provenance=false --otp=123456
#                                                    ↑ code from your authenticator app
```

> 🚨 **Never put `provenance` in the `package.json` `publishConfig`.**
> npm reads `publishConfig` **with higher precedence than CLI flags and than environment
> variables**. With `provenance: true` there, *any* publish outside a CI with OIDC fails:
>
> ```
> npm error code EUSAGE
> npm error Automatic provenance generation not supported for provider: null
> ```
>
> Passing `--provenance=false` and `NPM_CONFIG_PROVENANCE=false` do **not** help: the
> `publishConfig` beats both. Provenance is controlled **per invocation** — the release
> workflow passes `--provenance` explicitly, the local publish does not.

**Step 2 — configure the trusted publisher** at
<https://www.npmjs.com/package/create-sdd-ai-stack/settings/trusted-publishers>:

| Field | Value |
| --- | --- |
| Provider | GitHub Actions |
| Organization or user | `marcelinosandroni` |
| Repository | `sdd-ai-stack` |
| Workflow filename | `release.yml` (the name only, with `.yml`) |
| Allowed actions | `npm publish` |

> ⚠️ npm **does not validate** this configuration when you save it. Get the workflow or
> the owner wrong and the error only appears at publish time. Everything is
> **case-sensitive**.

**Step 3 — delete the secret** (let OIDC take over):

```bash
gh secret delete NPM_TOKEN --repo marcelinosandroni/sdd-ai-stack
```

From then on:

```bash
npm run version:patch && git push origin main && git push origin --tags
```

It publishes on its own, with provenance, **with no token at all**. You can even turn
off "Require two-factor authentication" for the package afterwards — OIDC does not
depend on it.

### 2.2 ⚠️ Path B — token with "Bypass 2FA" (the bridge this repo walked past)

This repository shipped `0.1.17` this way, and then deleted the token. Kept
because it is the fastest way to get a first publish done, not because it is a
place to stay.

At <https://www.npmjs.com/settings/access-tokens>, create a granular token with:

| Field | Value |
| --- | --- |
| Permissions | **Read and write** |
| Bypass 2FA | ✅ **checked** |
| Package | `create-sdd-ai-stack` |

```bash
gh secret set NPM_TOKEN --repo marcelinosandroni/sdd-ai-stack
```

> **Bridge only.** npm warns: *"the ability to publish new package versions directly
> with a granular access token will be removed in January 2027"*. And there is an open
> bug ([npm/cli#9268](https://github.com/npm/cli/issues/9268)) where "Bypass 2FA" is
> ignored by npm 11.x. Treat it as a deadline, not a solution.
>
> This is also what produced the `EOTP` that blocked every release before the
> OIDC path existed: a token without bypass, on an account with mandatory 2FA.

### 2.3 🛡️ Path C — stage-only (belt and braces)

A **Read and write (stage only)** token: CI uploads the version but it **does not go
live**. A maintainer has to approve it with 2FA:

```bash
npm stage publish          # in CI, with the stage-only token
npm stage list             # see what is pending
npm stage approve --otp=123456
```

Combine it with `Require two-factor authentication and disallow tokens` in
[package settings](https://www.npmjs.com/package/create-sdd-ai-stack/settings): a leaked
token then cannot publish anything on its own. Maximum security posture, at the price of
one manual approval per release.

---

## 3. How the workflow picks the mode

It doesn't need to: **npm picks by itself.** The `Authenticate` step only decides
whether to write anything at all.

| `NPM_TOKEN` in the repo | What the workflow does | How npm publishes |
| --- | --- | --- |
| **defined** | injects `NODE_AUTH_TOKEN` into the env | token mode |
| **absent** | writes **nothing** | **OIDC** |

> **This repository has no `NPM_TOKEN`.** It was deleted once the Trusted
> Publisher was configured, so the second row is the only one that happens.
> If a release suddenly fails on npm with an auth error, check `gh secret list`
> before anything else — someone re-added the token, and re-adding it is what
> re-enables the `EOTP` failure mode.

> ⚠️ **The `Publish` step deliberately does not define `NODE_AUTH_TOKEN`.** npm only
> engages OIDC when auth is **absent**. With the variable in the environment it ignores
> OIDC and tries a token — and fails again.

> ⚠️ **Version requirement:** OIDC needs **npm ≥ 11.5.1** and **Node ≥ 22.14.0**. The
> GitHub runner's Node 22 ships npm 10.x, so the workflow runs
> `npm install -g npm@latest` before publishing. Without it OIDC never engages.

> ⚠️ **Never** paste a token into a file, into the committed `.npmrc`, or into a commit.
> If it leaks: revoke at <https://www.npmjs.com/settings/access-tokens> immediately.

Verifying it is there:

```bash
gh secret list --repo marcelinosandroni/sdd-ai-stack
# should list: NPM_TOKEN   Updated: <date>
```

On path A (OIDC) the list must be **empty** — that is what makes npm use OIDC.

---

## 4. Testing without publishing (do this first)

Once the workflow is on `main`, validate without burning a version:

```bash
gh workflow run release.yml -f version=9.9.9 -f dry_run=true
gh run watch
```

This runs the tests, checks the links, verifies the tarball contents, and runs
`npm publish --dry-run`. **Nothing is published.**

---

## 5. Publishing for real

> 🛑 **A tag publishes.** `git push --tags` sends the package to both
> registries. This is not a local annotation.

```bash
# 1. main is up to date and CI is green
#    `main` is protected: quality, template, supply-chain and actions must pass.
git checkout main && git pull

# 2. bump the version (commits package.json and creates the tag)
npm run version:patch    # or version:minor / version:major

# 3. push code, WAIT for CI, then push the tag
git push origin main
gh run watch            # the release refuses to publish while CI is red
git push origin --tags
```

> ⚠️ `npm version` **requires a clean working tree** and refuses to bump a dirty
> one. If it errors with `Git working directory not clean`, you are standing on
> uncommitted work — commit or stash first. Bump the version on its own commit,
> never mixed with code.

The `guard` job in `release.yml` queries the CI conclusion for the tagged
commit and fails the whole release unless it is `success`. It also re-runs the
template gates (`typecheck`, `lint`, `test`, `build`) before anything is
published, so a release can never ship a template that does not build.

The workflow fires on the tag push. Watch it:

```bash
gh run list
gh run watch
```

If all goes well: <https://www.npmjs.com/package/create-sdd-ai-stack>

---

## 6. What the workflow checks before publishing

| Guard | Why |
| --- | --- |
| CI green on the tagged commit (`guard`) | never publish from a red main |
| template gates re-run (`typecheck`, `lint`, `test`, `build`) | never ship a template that does not build |
| `npm test` (52 tests) | never publish on a red test |
| `npm run check:coverage` (line 95 / branch 85 / func 90) | a careless commit cannot silently reduce coverage |
| `node SKILLS/check-docs/check-docs.mjs` | no rule pointing at a dead file |
| tag `vX.Y.Z` == `version` in `package.json` | avoids publishing 0.1.18 when the tag is 0.1.17 |
| 12 essential files present in the tarball | catches a misconfigured `files` array |
| `npm ≥ 11.5.1` in the publish job | otherwise OIDC never engages (Node 22 ships npm 10.x) |
| `concurrency: release-registry` | two publishes never run in parallel |
| `publishConfig.provenance` | the package is GitHub-signed — proof it came from this repo |

---

## 5.1 Why the template ships without a lockfile

`template/next/` has **no `package-lock.json`**, on purpose.

- A lockfile is ~1 MB of generated content. Committing one into a template
  means every generated app inherits a resolution made on someone else's
  machine, on someone else's day, and every Dependabot bump touches thousands
  of lines that nobody reads.
- The version ranges (`next: ^16.3.7`) are the contract. The consumer's first
  `npm install` resolves and **commits** their own lockfile, which is the one
  that matters for their reproducibility.

Consequences, stated plainly:

| Command | In this repo's template | In the generated app |
| --- | --- | --- |
| `npm install` | ✅ | ✅ |
| `npm ci` | ❌ needs a lockfile | ✅ once the app commits its own |

This is why the workflows use `npm install`, never `npm ci`. See
`stacks/ci.md` §install.

---

## 7. Common problems

| Symptom | Cause | Fix |
| --- | --- | --- |
| `EOTP` / "requires a one-time password" | **2FA on** and the token lacks "Bypass 2FA" | §1 — path A (OIDC) or B (bypass) |
| `E404` / "PUT ... Not Found" **on a first publish** | **not a missing package** — the project `.npmrc` shadowed your token and zeroed auth | §1.0 |
| `EUSAGE` / "Automatic provenance generation not supported for provider: null" | `publishConfig.provenance: true` outside a CI with OIDC | remove `provenance` from `publishConfig`; local uses `--provenance=false`, CI uses `--provenance` |
| `ENEEDAUTH` / "need auth" with OIDC configured | `NODE_AUTH_TOKEN` present in the env kills OIDC, **or** the workflow isn't `release.yml`, **or** the repo/owner is wrong | check the 3 fields on npmjs.com; they are case-sensitive |
| `ENOENT` / OIDC doesn't engage | npm < 11.5.1 or Node < 22.14.0 | the workflow already upgrades npm; if it persists, raise `node-version` |
| `E403 Forbidden` | token lacks write access to the package | recreate with Read and write on `create-sdd-ai-stack` |
| `E_STAGE_REQUIRED` | stage-only token and you called `npm publish` | use `npm stage publish` and approve with `npm stage approve --otp` |
| `401 Unauthorized` | token expired or revoked | recreate at npm and save it again |
| `cannot publish over previously published version` | that version exists | bump the version (`npm run version:patch`) |
| `tag 'v0.1.17' does not match package.json '0.1.18'` | forgot to commit the bump | `git add package.json && git commit -m "chore: v0.1.18"` |
| `missing from the tarball: X` | `files` in `package.json` is incomplete | add the path to `files` |
| `404` on GitHub Packages PUT | the name is unscoped. GitHub Packages **only** accepts `@owner/name` | check the "Scope the name" step ran; §1 |
| `403` on GitHub Packages | `GITHUB_TOKEN` lacks `packages: write` | the job declares it; if you forked, re-run in the origin repo |
| npm published but GitHub failed | the two jobs are independent by design | `gh run rerun <id> --failed` — the version is unchanged, so it re-publishes cleanly |
| GitHub package installs need a token | GitHub Packages defaults to **private** | one-time visibility flip, §1.4 |

> **Known npm bug:** a granular token with "Bypass 2FA" being ignored by npm 11.x
> ([npm/cli#9268](https://github.com/npm/cli/issues/9268)). If the bypass "doesn't work",
> path A (OIDC) is the way out — it depends on no token at all.

---

## 8. Publishing locally (escape hatch, not the default path)

```powershell
# the bootstrap path (with 2FA on)
npm publish --access public --provenance=false --otp=123456
```

Without 2FA, or with a bypass token:

```powershell
$env:NODE_AUTH_TOKEN = "<your token>"
npm publish --access public --provenance=false
```

> `--provenance=false` is mandatory for a local publish. Provenance can only be
> generated inside a CI with OIDC (GitHub Actions, GitLab CI, CircleCI).

Check before you go:

```bash
npm run check:pack   # shows exactly what will be uploaded
```

---

## 9. Checklist before you press the button

- [ ] `npm test` green
- [ ] `main` synced with `origin`
- [ ] `NPM_TOKEN` exists and has not expired (or you're on path A and it must NOT exist)
- [ ] `npm run check:pack` shows the expected files
- [ ] `version:patch|minor|major` chosen deliberately
- [ ] `git push origin main` and `git push origin --tags` done
- [ ] first publish only: flipped the GitHub package to public (§1.4)

> **Publishing is irreversible.** A published version cannot be removed (only
> unpublished), and npm never reuses a number. Don't delete the tag either.
