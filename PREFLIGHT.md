# 🧾 PREFLIGHT

> The five commands that turn "I believe it works" into evidence.
> Read this before you paste anything. A green build is not a correct change;
> the commands below each prove a different thing, and none of them substitutes
> for another.

---

## 🎯 The order

```bash
npm run typecheck    # 1. the types are consistent
npm run lint         # 2. the style and the imports are clean
npm run test         # 3. the business rules hold
npm run build        # 4. the production build works
npm run test:e2e     # 5. the real user flow works, in a real browser
```

Run them in that order. A failure in 1 means 2, 3 and 4 will produce noise; fix
and restart from 1.

---

## 🔍 What each command actually proves

| # | Command | Proves | Does NOT prove |
| --- | --- | --- | --- |
| 1 | `typecheck` | Every type is consistent. A missing prop, a wrong argument, a drifted interface. | That anything behaves correctly. |
| 2 | `lint` | No unused variable, no `any`, no dead import, formatting is canonical. | That the code is right, only that it is clean. |
| 3 | `test` | The business rules hold against the cases you wrote. | That you wrote the right cases. |
| 4 | `build` | Next can actually produce the artefact, with the real render path. | That the artefact is correct. |
| 5 | `test:e2e` | The flow works in a browser, against the production build. | That the third-party integrations work. |

> **Commands 1–4 all pass on code that does the wrong thing.** They prove the
> code is well-formed. Only 3 and 5 speak about behaviour, and only if the cases
> in them were written first.

---

## 🧪 Which layer proves which requirement

Not every change needs all five. Be honest about which one you need.

| You changed | Minimum |
| --- | --- |
| A comment or a doc | 2 |
| A pure function | 1, 2, 3 |
| A use case or a business rule | 1, 2, 3 |
| A Server Action, a query, a route | 1, 2, 3, 4, 5 |
| Anything the user sees | 1, 2, 3, 4, 5 |
| A dependency or a build config | 1, 2, 3, 4, 5 |

---

## 🖼️ Visual evidence

`test:e2e` against the **production build**, on Chromium and Firefox. Never
against `next dev`: dev does not minify and takes a different render path, so a
green suite there proves nothing about what you ship.

For a UI change, a Playwright trace is attached automatically on the first
retry. For a screenshot in the reply, save it under `test-results/` — which is
gitignored — and never commit it.

---

## 📋 The evidence block

Paste this at the end of every task. Full command, full result, real counts.

```markdown
**Evidence:**
- `npm run typecheck` → 0 errors
- `npm run lint` → 0 errors, 0 warnings
- `npm run test` → N passed (N)          ← your real count
- `npm run build` → ✓ Compiled successfully
- `npm run test:e2e` → N passed (N)      ← your real count
```

**Never** compress the evidence. A token-saving tool may shorten your prose; it
may never shorten the numbers. "Tests pass" is not evidence — a count with its
total beside it is.

> **The counts are yours to fill.** A template that shipped concrete numbers would
> be shipping *its* counts into your project, and they would be wrong from the
> first test you write. Read them off the run you just did.

---

## 🧩 Skills you can run

| Skill | Checks |
| --- | --- |
| [`SKILLS/check-docs`](./SKILLS/check-docs) | every relative link in your documentation resolves |
| [`SKILLS/create-task`](./SKILLS/create-task) | a task file, registered in the PLAN |
| [`SKILLS/create-feature`](./SKILLS/create-feature) | a compiling, tested vertical slice |

Coverage, rules and fact checks are **not** here — those verify the template
itself, against its own test files and its own release workflow. Your app has
neither, and a gate that reads files you do not have is a gate that crashes
where it lands.

---

## 🚫 The three ways to fake it

| Temptation | Why it fails |
| --- | --- |
| "should work" | It either works or it does not. Run it. |
| `test.skip` on the failing case | A skipped test is a lie of omission. File an issue. |
| Green typecheck as proof of behaviour | Types do not know what the code means. |

If a test is red, the task is not done. No exceptions, no "I will fix it next
task".

---

## 🧠 In this template repository (not in your app)

The paragraph above is about **your** app. This one is about the
`create-sdd-ai-stack` repository itself, and it is here only so you know where
the rules you are reading come from. Your generated app has none of these
scripts.

```bash
npm test              # the CLI and the scaffold
npm run check:coverage
npm run check:rules   # the rules are executable
npm run check:docs
npm run check:pack
```

`check:rules` is the interesting one: it verifies that the generated app obeys
the rules the template ships. A rule nobody checks is a rule nobody follows.
