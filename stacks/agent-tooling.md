# 🤖 AGENT TOOLING

> Curated companions for this SDD core. Each entry was checked against its own README —
> the numbers below are the maintainers', not ours.
>
> **Nothing here is a dependency.** This core is a set of rules, and it stays a set of
> rules. These are add-ons you install if you want them.

---

## 🧭 Pick by problem, not by hype

| If your problem is… | Reach for |
| --- | --- |
| The agent talks too much, output is expensive | [caveman](#1-caveman) |
| The agent reads half the repo and your input bill is the problem | [caveman](#1-caveman) (proxy) |
| The agent invents instead of following a process | [superpowers](#2-superpowers) |
| You want a heavier spec-first methodology | [spec-kit](#3-spec-kit) |
| You want agents to challenge *you* | [grill-me](#4-grill-me) |
| The agent writes a lot of code for a small change | [lean-build](#5-lean-build) |
| You need tests before you need features | [superpowers TDD](#2-superpowers) |

---

## 1. caveman

> **Shrinks what the agent says — and what it reads.**

```bash
npx skills add JuliusBrussee/caveman -a claude
# or, for one of 30+ agents: cursor, windsurf, cline, codex, gemini, copilot, …
```

| | What it does |
| --- | --- |
| `/caveman` | Compress every reply. `lite` · `full` · `ultra` · `wenyan-*` |
| `caveman` (proxy) | Runs on your machine between the agent and the provider, shrinking **logs, test output, JSON, diffs, search results** before the model sees them |
| `/caveman-compress` | Rewrites a memory file (`AGENTS.md`, `CLAUDE.md`) into smaller prose. **This one targets this core directly.** |
| `/caveman-commit` | Conventional Commits, why-over-what |
| `/caveman-review` | One-line review findings: `L42: 🔴 bug: user null. Add guard.` |
| `cavecrew-*` | Compressed subagent presets (investigator, builder, reviewer) |
| `/caveman-stats` | Measured token usage in a Claude Code session |

**Their numbers:** 65% average output-token reduction across 10 prompts (range 22–87%).
The proxy benchmark: 33.2% fewer provider-reported input tokens over 54 Claude Code runs,
18/18 exact-answer checks still passing.

### ⚠️ Read the caveat before you install

Their own README is unusually honest, and you should read it too:

- It shrinks **output** only. Reasoning tokens are untouched.
- The skill itself costs ~1–1.5k **input** tokens on every turn, because prompt text is
  reloaded every call.
- On already-terse workloads it can go **net negative**. They ship
  `docs/HONEST-NUMBERS.md` with the cases where it loses.
- If you are billed **per request** rather than per token (GitHub Copilot premium
  requests, for example), a shorter answer is the same request — zero saving.

**Best fit:** you read more of the agent's output than you paste, you run long sessions
full of logs, or you pay per token. **Skip it** on pure code generation with almost no
prose to cut.

---

## 2. superpowers

> **A skills framework *and* a methodology that makes the agent use it.**

```bash
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```

Works in 30+ agents (Claude Code, Codex, Cursor, Gemini CLI, Copilot CLI, OpenCode, …).

### The parts that overlap us — and the parts that don't

| Superpowers skill | vs. this core |
| --- | --- |
| `test-driven-development` | [`testing.md`](./testing.md) states the *rules*. Superpowers states the *cycle*. Use both. |
| `writing-plans`, `executing-plans` | [`PLAN.md`](../specs/PLAN.md) is the storage. Superpowers is the choreography around it. |
| `systematic-debugging` | Complements the "investigate before you edit" rule in [`AGENTS.md`](../AGENTS.md). |
| `brainstorming` (Socratic) | Complements [`PLANNING.md`](../docs/PLANNING.md). |
| `code-review`, `receiving-code-review` | We have no review methodology. This fills that gap. |
| `using-git-worktrees` | Parallel branches. Useful for multi-task agents. |
| `subagent-driven-development` | Two-stage review: spec compliance, then code quality. |
| `writing-skills` | How to write a skill like the ones in `SKILLS/`. |

**Verdict:** the strongest complement. This core answers *what the rules are and where
they live*; superpowers answers *what the agent should be doing right now*. Install it
and keep both.

---

## 3. spec-kit

> **GitHub's own spec-driven development toolkit.**

```bash
uvx --from git+https://github.com/github/spec-kit.git specify init
```

A heavier, more ceremonious SDD than this core: `specify` → `plan` → `tasks` →
`implement`, plus `clarify`, `analyze`, `checklist`, `converge`. 30+ agents supported.

### When to choose spec-kit over this core

| | This core (`create-sdd-ai-stack`) | spec-kit |
| --- | --- | --- |
| Setup | one `npx`, no extra tooling | `uvx`/`uv`, `.specify/` tree, agent command files |
| Ceremony | light — one task `[-]` at a time | full spec → plan → task chain with gates |
| Ships a working app | ✅ (Next.js 16 template) | ❌ rules only |
| Design system | ✅ Matrix, pre-wired | ❌ you supply it |
| Language | English by default | preset-configurable (including localization) |
| Best for | a solo dev shipping a real product | a team that wants heavy, auditable gates |

They are **compatible**: you can run spec-kit inside a project scaffolded by this core.
Do not run both *routers* at once — two "here is what to do next" authorities will fight.
Pick one as the source of truth for the task queue.

---

## 4. grill-me

> **The agent challenges your plan before you build the wrong thing.**

```bash
npx skills add JuliusBrussee/skills -a claude
```

From the same author as caveman. Pairs well with a TDAH-scale workflow: it surfaces the
hole in the spec while the spec is still 20 lines, instead of after 400 lines of code.

Siblings in the same package: `interface-kit` (UI that looks right and loads fast),
`junior-to-senior` (adversarial review pass), `loop-factory` (spec-driven task loop:
inbox → active → archive, with a review gate between).

---

## 5. Work-pattern skills

`investigate-first` · `lean-build` · `surgical-patch` · `safe-refactor` · `migration` ·
`verify-and-stop`

These are not "tools" — they are *disciplines*, and they are the cheapest token saving
available because they **prevent work** instead of compressing it:

| Skill | Prevents |
| --- | --- |
| `investigate-first` | Editing code because you guessed the cause |
| `lean-build` | Building the 400-line version of a 40-line requirement |
| `surgical-patch` | A bug fix that refactors three other files |
| `verify-and-stop` | Continuing past a passing gate into unrelated work |
| `migration` | An irreversible data/schema change with no rollback proof |

They ship with caveman, but they are plain `SKILL.md` files — copy them into
`SDD/SKILLS/` and they work with any agent.

---

## 🧾 Our own rules for the tools you add

1. **Never let a tool become a second source of truth.** If caveman rewrites `AGENTS.md`,
   the rewrite must keep the rules. A compressor that drops a rule is a regression.
2. **Measure before you believe.** Every number above is the maintainer's. Run
   `/caveman-stats` or your own before/after and decide from *your* data.
3. **Keep the evidence chain.** [`AGENTS.md`](../AGENTS.md) §4 requires pasting green
   terminal output before marking a task done. A tool that makes output terse must not
   be allowed to make *evidence* terse. Evidence is never compressed.
4. **A skill that contradicts a rule here loses.** These docs are the law. Superpowers
   cannot tell your agent to skip [`testing.md`](./testing.md); if it suggests that,
   the rule wins and you raise it with the human.

---

## 🔍 Evaluating something you found yourself

Do not trust a README. Run this checklist:

- [ ] Does it have a benchmark I can **reproduce locally**?
- [ ] Does it state honestly **when it loses**?
- [ ] Does it touch the repo, or just the model's output?
- [ ] Is it reversible — one command to remove, no lock-in?
- [ ] Does it create a second "what to do next" authority? (If yes, it conflicts with us.)
