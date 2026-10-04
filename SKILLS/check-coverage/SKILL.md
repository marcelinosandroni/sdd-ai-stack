# 📊 SKILL: check-coverage

> Fails when line, branch or function coverage drops below the floor. The numbers
> live in the script, not in someone's memory, so a careless commit cannot quietly
> reduce them.

## ▶️ Usage

```bash
node SKILLS/check-coverage/check-coverage.mjs
```

**Requires Node ≥ 24.** On Node 22 the test runner spawns each test file in its own
process and emits an *empty* coverage summary, so the gate would read "no data"
instead of "no coverage" — and report a number nobody measured. CI pins the job to
Node 24 for that reason.

## 📦 The floor

| Kind | Floor |
| --- | --- |
| line | 95% |
| branch | 85% |
| function | 90% |

Raise them when the tests get better. **Lower them only with the reason written
next to the change** — a lowered floor is the one edit to this file that no reviewer
can evaluate without running the whole suite.

## 📌 What it measures, and what it does not

It runs four test files by name, and excludes `bin/**`: that file is a top-level
script, so importing it executes it and the runner cannot instrument it without
running the whole CLI. It is covered by `tests/bin.test.mjs`, which spawns the real
binary. Excluding an unmeasurable file keeps the number honest — a file that drags
the total without being measurable teaches you to ignore the total.

The list of test files is **hardcoded on purpose**. Coverage is a claim about the
library, and the tests that make that claim are named, not globbed: `npm test`
grows, and a gate that silently widens its own denominator is a gate nobody can
reason about.

## 🚫 Not for consumers

This is the template's own gate and it is **not copied** into a generated app —
there is nothing there to measure. A consuming app uses the coverage its own test
runner reports. See `RULE_SKILL_COPY_SKIP` in `lib/constants.mjs`.