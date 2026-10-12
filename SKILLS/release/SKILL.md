# 🧩 SKILL: release

> The local half of a release, as one command. Bump, sync the site, open the changelog
> section, run the gate, commit, tag. It stops at the tag — the publish is CI's.

## ▶️ Usage

```bash
node SDD/SKILLS/release/release.mjs <patch|minor|major> [--dry-run]
node SDD/SKILLS/release/release.mjs verify <version>
```

## 📦 What it does

1. `npm version <bump> --no-git-tag-version` — writes both manifests, refuses a dirty tree
2. `scripts/sync-site-facts.mjs` — the site commits the version, so a bump that skips
   this ships a page naming the version it replaces
3. Opens `## [Unreleased]` as the new version's section. **It opens, it does not write.**
   What goes in a release note is a judgement, and a script that invents one produces
   prose nobody would have written
4. Verifies both manifests landed on the new version
5. One commit and the tag, **local only**

## 🛑 It does not push the tag, on purpose

`release.yml` refuses to publish while CI on the tagged commit is red. That guard runs on
the runner, against the real commit, with the real workflow — better than anything this
file could reimplement.

A tag pushed before that guard runs is a publish the guard cannot stop. So the chain
ends at the tag and prints the next two commands.

## 🔍 `verify`

Reads what `npm pack` would actually publish and holds it to the packaging contract:

- ships `bin/`, `lib/`, `themes/`, both templates, `AGENTS.md`
- ships **neither** `site/` nor `scripts/`

It is **not** "every script target ships". That was tried, shipped as 0.7.1, and was
wrong: `scripts/sync-site-facts.mjs` reads `site/`, which is deliberately not shipped, so
the command existed in the install and died with `ENOENT` when run. Repository tooling
does not ship. `tests/package-scripts.test.mjs` holds the same two rules in CI.

## 🚨 When it stops

Every abort names the step and the remedy, because a half-finished release is
recoverable and a half-finished release nobody can describe is not.

```
✖ release: stopped at "changelog" — no `## [Unreleased]` section to open
  add one, or write the section by hand
```

## ⚠️ SemVer has to be earned

A patch that adds a file a consumer can call is a **minor**. 0.7.1 is the receipt: it
added `scripts/` and fixed a bug — two different kinds of change wearing one number. The
script will happily apply `patch`; the judgement is yours and it is the only thing here
it cannot check.

## ✅ When to run it

- Instead of the manual chain, every time
- `--dry-run` first if the change is larger than a fix
- `verify <version>` after a publish, from the registry, not from the working tree