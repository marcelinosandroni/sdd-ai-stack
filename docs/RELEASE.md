# 🚀 RELEASE — publishing to npm

> **One path:** you version locally, GitHub Actions publishes.
> There is no manual `npm publish` in this project — on purpose, so there is never two
> ways to do it.

```text
npm run version:minor   →  0.1.17 → 0.2.0 (commits + creates tag v0.2.0)
git push origin main
git push origin --tags  →  fires the Release workflow  →  publishes
```

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

## 1. Authentication — read this before creating any token

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

### 1.0 The misleading `404 Not Found` on a first publish

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

### 1.1 🏆 Path A — local bootstrap + Trusted Publishing (OIDC)

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

### 1.2 ⚠️ Path B — token with "Bypass 2FA" (a bridge, not a destination)

If you want CI working **today** without touching your machine:

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

### 1.3 🛡️ Path C — stage-only (safest, most friction)

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

## 2. How the workflow picks the mode

It doesn't need to: **npm picks by itself.**

| `NPM_TOKEN` in the repo | What the workflow does | How npm publishes |
| --- | --- | --- |
| **defined** | injects `NODE_AUTH_TOKEN` into the env | token mode |
| **absent** | writes **nothing** | **OIDC** |

> ⚠️ **The `Publica` step deliberately does not define `NODE_AUTH_TOKEN`.** npm only
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

## 3. Testing without publishing (do this first)

Once the workflow is on `main`, validate without burning a version:

```bash
gh workflow run release.yml -f version=9.9.9 -f dry_run=true
gh run watch
```

This runs the tests, checks the links, verifies the tarball contents, and runs
`npm publish --dry-run`. **Nothing is published.**

---

## 4. Publishing for real

```bash
# 1. main is up to date and CI is green
git checkout main && git pull

# 2. bump the version (commits package.json and creates the tag)
npm run version:patch    # or version:minor / version:major

# 3. push code and tag
git push origin main
git push origin --tags
```

The workflow fires on the tag push. Watch it:

```bash
gh run list
gh run watch
```

If all goes well: <https://www.npmjs.com/package/create-sdd-ai-stack>

---

## 5. What the workflow checks before publishing

| Guard | Why |
| --- | --- |
| `npm test` (27 tests) | never publish on a red test |
| `node SKILLS/check-docs/check-docs.mjs` | no rule pointing at a dead file |
| tag `vX.Y.Z` == `version` in `package.json` | avoids publishing 0.1.18 when the tag is 0.1.17 |
| 10 essential files present in the tarball | catches a misconfigured `files` array |
| `npm ≥ 11.5.1` in the publish job | otherwise OIDC never engages (Node 22 ships npm 10.x) |
| `concurrency: release-npm` | two publishes never run in parallel |
| `publishConfig.provenance` | the package is GitHub-signed — proof it came from this repo |

---

## 6. Common problems

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

> **Known npm bug:** a granular token with "Bypass 2FA" being ignored by npm 11.x
> ([npm/cli#9268](https://github.com/npm/cli/issues/9268)). If the bypass "doesn't work",
> path A (OIDC) is the way out — it depends on no token at all.

---

## 7. Publishing locally (escape hatch, not the default path)

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

## 8. Checklist before you press the button

- [ ] `npm test` green
- [ ] `main` synced with `origin`
- [ ] `NPM_TOKEN` exists and has not expired (or you're on path A and it must NOT exist)
- [ ] `npm run check:pack` shows the expected files
- [ ] `version:patch|minor|major` chosen deliberately
- [ ] `git push origin main` and `git push origin --tags` done

> **Publishing is irreversible.** A published version cannot be removed (only
> unpublished), and npm never reuses a number. Don't delete the tag either.
