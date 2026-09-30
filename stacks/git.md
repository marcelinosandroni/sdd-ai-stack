# 🌿 GIT

> Spine: [clean-code.md](./clean-code.md) §7 (naming) and §8 (errors).

> **Commit messages, PR titles and branch names are in English.** Always.
> See [language.md](./language.md) § Commit messages.

## 🚨 Non-negotiable rules

1. **Identity:** whatever the developer already configured. Never hardcode a name
   that is not the current user — a first commit in the wrong name is permanent.
   ```bash
   git config user.name  "Your Name"
   git config user.email "you@example.com"
   ```
   If `git config user.email` is empty, ask before committing. Do not guess.
2. **Conventional Commits are mandatory:**
   ```
   <type>(<scope>): <short imperative description>. (Agent: <Tool> - <Model>)
   ```
   Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `style`, `build`,
   `ci`.
3. **Scope = the area** (`feat(chat)`, `fix(auth)`, `docs(sdd)`). No scope: `feat:`.
4. **One task = one commit.** Never bundle another task's work in.
5. **Simplified Gitflow:** `main` = production; `feat/`, `fix/`, `chore/` for work in
   progress. PRs target `main`.
6. **Never commit:** `node_modules`, `.env`, `.env.local`, `.next`, build output,
   `*.log`, credentials.
7. **Before committing:** `git status`, `git diff`, `git log --oneline -10`. Stage only
   what belongs to the task.
8. **No `--force`, no `git config` hacks, no amending a pushed commit.**

### Good and bad messages

```
✅ fix(auth): return 401 instead of leaking user existence
✅ feat(billing): add subscription slice. (Agent: opencode - space-bunny)
❌ fix(auth): corrige o bug do login que estava quebrado
❌ update
❌ .
```

## 🏷️ VERSIONING (SemVer + tags)

- `MAJOR.MINOR.PATCH` — `feat`→MINOR, `fix`→PATCH, breaking→MAJOR.
- **Below 1.0.0 the minor is unstable**: `0.MINOR.PATCH`. Read `0.x` as "API may break".
- Tag on the phase merge, matching the version in `package.json`:
  `git tag v0.1.3` (annotated). Never invent a version: read it from `package.json`.
- Phase closed? Archive in `specs/history/phases/`, tag, one archiving commit.
- Tagging publishes. The `release` workflow runs on `v*` and the package goes to
  the registries — so a tag is not a local annotation, it is a release.

## 🧭 Daily flow

```bash
git checkout -b feat/billing          # 1. branch
# … code and test …
git add -A                             # 2. stage (only this task)
git commit -m "feat(billing): create subscription slice. (Agent: opencode - space-bunny)"
git push -u origin feat/billing        # 3. push
# 4. open the PR against main
```

## 🔁 Updating this core (submodule)

```bash
git submodule update --remote --merge SDD   # pull newer rules
git add SDD && git commit -m "chore(sdd): update core to vX.Y.Z"
```

## 🚫 Never

- A vague commit message ("update", "fix", ".").
- `git add -A` with unrelated junk in the working tree.
- Committing to `main` directly while work is in progress.
- Rewriting public history.
- Committing a secret, in any form, ever.
