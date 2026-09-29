# 🧩 SKILL: check-docs

> Validates that **every relative link between documents** resolves. Run it in the
> commit hook and in CI so a rule never points at a dead file.

## ▶️ Usage

```bash
node SDD/SKILLS/check-docs/check-docs.mjs
node SDD/SKILLS/check-docs/check-docs.mjs ../other-project
```

## 📦 What it validates

- Collects every `.md` from the `SDD/` root
- Skips fenced code blocks (` ``` ` / `~~~ `) — an illustrative link inside an example
  does not count
- Skips `node_modules`, `.next`, `test-results`, `playwright-report` and `template`
  (the template's README points at `./SDD/…`, which only exists after scaffolding)
- Output: exit 1 with the list of broken links, or exit 0 with the document count

## ✅ When to run it

- Before committing a documentation change
- In CI, alongside the tests
- After renaming or moving any rule document
