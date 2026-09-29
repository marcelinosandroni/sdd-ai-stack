# 🧩 SKILL: install-submodule

> Installs the rules core (`SDD/`) into an **existing** project, creates the root
> shortcuts, and leaves the agent ready to work.

## 🎯 When to use it

- The project already exists and you **don't** want the Next.js template.
- You only want the rules + shortcuts, leaving the current code untouched.

## ▶️ Usage

```bash
# from inside the target project (or pass the path as the first argument)
node SDD/SKILLS/install-submodule/install-submodule.mjs

# install into another directory
node SDD/SKILLS/install-submodule/install-submodule.mjs ../my-project

# without git: a local copy
node SDD/SKILLS/install-submodule/install-submodule.mjs . --copy
```

## 📦 What it does

1. `git submodule add <repo> SDD` (or a copy with `--copy`)
2. Creates root shortcuts: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.cursorrules`,
   `.windsurfrules`, `.github/copilot-instructions.md`, `.clinerules`
   - tries a **symlink**; if the OS blocks it, writes a **stub** with the same rule text
3. Preserves any file that already exists (never overwrites)

## 🔄 Updating later

```bash
git submodule update --remote --merge SDD
git add SDD && git commit -m "chore(sdd): update core"
```

## ⚠️ Requirements

- The project must be a git repository (for submodule mode).
- `git` on the PATH.
