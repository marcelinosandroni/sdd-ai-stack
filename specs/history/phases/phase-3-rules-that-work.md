# ✅ Phase 3 — Letting an agent use the rules (DONE)

> **Scope:** stop reading the rules and start obeying them. Every rule that survived
> this phase is one an agent can be held to.
> **Version:** 0.3.0
> **PR:** #15

---

## 🧭 What it was

A deep audit, not a code review. The question was narrow: *give an agent with no context a
generated app, tell it to follow `AGENTS.md` §1, and watch what happens.* Not "does this
read well" but "does this work".

The audit was run before it was written. Thirteen findings, three of which broke the flow
outright.

## 🧭 What it became

| Before | After |
| --- | --- |
| The `create-feature` SKILL generated code that did not compile | it compiles on the first run |
| The author's name shipped to every consumer | `--git` uses the developer's own `git config` |
| `AGENTS.md` §4 forbade `npm install` at the root, which is the whole app in a generated project | the rule names both cases |
| The template's phase history shipped to a new app | not copied; the app starts empty with a README saying so |
| The rules were prose | `SKILLS/check-rules` executes them |
| 8 documents mandatory before the first line of code (~16.5k tokens) | 4 tiers, ~5.8k mandatory |
| 34 tests | 63 |

### The three that broke the flow

**The SKILL that §5 tells the agent to run first, did not compile.** `z.flattenError`
returns `string[] | undefined` per field in Zod 4; the template was written for Zod 3. It
also passed `undefined as never` to the container and threw `new Error("not implemented")`
from the use case, so the generated slice was born broken and said nothing about it.

**The author's name went to everyone.** `PLAN.md` said "The developer (Marcelino) has ADHD",
`git.md` declared a fixed identity, and `--git` committed as
`Marcelino Sandroni <marcelino.sandroni@gmail.com>` in the user's repository. Somebody's
first commit was in a name they never chose. With no identity configured the scaffold now
says so and leaves the staging intact rather than inventing an author.

**§4 contradicted the generated app.** "NEVER run `npm install` at the root" is true in a
monorepo and false in a generated app, where the root *is* the project. The rule was
written from this repository's point of view.

## 🛡️ The rules became executable

`SKILLS/check-rules` turns the load-bearing prose into checks, and it runs against the
**generated app**, not only the source — the template has to obey the rules it ships.

| Rule | What it catches |
| --- | --- |
| `language.md §1` | Portuguese in code, comments, error strings, test names |
| `git.md §1` | a hardcoded identity passed to `git commit` |
| — | the author's own name inside the rules that ship to every user |
| `AGENTS.md §4` | the install rule contradicting the generated layout |
| `AGENTS.md §4` | a command a doc names that no `package.json` defines |
| `DESIGN.md §2` | a token hex that disagrees between the doc and the CSS |
| `testing.md` | a named test layer the template does not have |

**It found real violations the moment it was written** — Portuguese in
`lib/check-links.mjs` and `lib/scaffold.mjs`, which no review had caught. A guard is only
worth having once it has failed.

## 🧭 Context economy

`AGENTS.md` §1 was a flat list of eight mandatory documents, ~16.5k tokens before the first
line of code. It is now four tiers: three documents you cannot skip (`AGENTS.md`,
`PLAN.md`, `PREFLIGHT.md`), two once per session, and everything else behind a decision.
The rules that moved are still one `Read` away.

`PREFLIGHT.md` is new, and it states the thing that matters most:

> Commands 1 to 4 all pass on code that does the wrong thing. They prove the code is
> well-formed. Only 3 and 5 speak about behaviour, and only if the cases were written first.

## 🧪 Evidence

```text
npm test                → tests 63 | pass 63 | fail 0
check-coverage          → line 98.59% (floor 95) · branch 90.77% (floor 85) · func 95.28%
check-rules             → 0 violations, repo AND generated app
check-docs              → ✓ 51 documents, all relative links resolve
check-pack              → 102 files, 168.8 kB

template: typecheck 0 · lint 0/0 · unit 6/6 · build ✓ · e2e 20/20 · audit 0
```

## 🚨 What the audit found that a review had not

- **CI annotations were being ignored.** `actions/checkout@v4` and `setup-node@v4` run on
  the deprecated Node 20 runtime, and the job written to catch it only rejected `@v[0-3]`,
  so it approved the broken version. `ubuntu-latest` migrates to Ubuntu 26, which would
  change the OS under a green build.
- **The branch protection was blocking its own PR.** The contexts said `quality`; the jobs
  were named `Qualidade (testes da CLI + links da doc)`. Four green jobs, `BLOCKED`,
  correct refusal by GitHub and a self-inflicted wound.
- **The coverage floor read as zero on Node 22**, because the report only aggregates across
  the test runner's child processes from Node 24 on. A gate that fails for the wrong reason
  teaches people to ignore it.
- **The tarball held 16.803 files / 153 MB**, because `files` listed `template` as a
  directory and npm packed every developer's `node_modules`.

> A rule nobody checks is a rule nobody follows. Most of the rules in this repository were
> still prose when this phase started.

## 🏷️ Release

Not published. The tag for 0.3.0 is created in phase 4, when the history is complete.

```bash
git tag v0.3.0
```
