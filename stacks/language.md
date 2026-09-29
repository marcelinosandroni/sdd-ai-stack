# 🗣 LANGUAGE & TOKEN ECONOMY

> **Two laws. English everywhere in the repo, and every line earns its tokens.**

---

## 1. English by default

| Surface | Default | Exception |
| --- | --- | --- |
| Commit messages | **English** | user says otherwise |
| PR titles and bodies | **English** | user says otherwise |
| Documentation (`.md`) | **English** | user says otherwise |
| Code comments | **English** | user says otherwise |
| Identifiers | **English** | — (never translate a symbol) |
| Code, error strings, test names | **English** | — |
| Specs, tasks, plans, changelog | **English** | user says otherwise |
| **Conversation with the user** | user's language | — |

> **You still talk to the user in their language.** The rule is about what you *write
> into the repository*, not how you *talk to a human*. A Brazilian dev wants Portuguese
> chat and an English codebase.

### Why English

1. **Tokens.** English is ~15–25% cheaper than Portuguese or Spanish for the same content.
   Every rule file reloads on every task — that cost is paid every time.
2. **The ecosystem is English.** Every error message, every Stack Overflow answer, every
   model's vocabulary. Fewer translation hops between spec and fix.
3. **It scales.** An English rule file works for any agent, any teammate, any country.
4. **It composes.** superpowers, spec-kit, caveman, shadcn, the Next.js docs — all English.

### What "explicitly" means

The user must **ask**:

| Situation | Write Portuguese? |
| --- | --- |
| User writes to you in Portuguese | ❌ chat in Portuguese, repo in English |
| Legacy code is Portuguese | ❌ new work is English; do not churn old files |
| User says *"escreve em português"* | ✅ yes, for this task |

On one explicit ask, apply it to **the current task** and ask before extending it to the
whole repo — flipping a rule set is a big, hard-to-review change.

---

## 2. Token economy for what you write

**This is a documentation law, not a chat style.** The files in `stacks/` are written this
way on purpose. A rule nobody finishes reading is a rule nobody follows — and long rules
are reloaded on every single task.

### Compress

| Cut | Instead of |
| --- | --- |
| Filler words | "just", "really", "basically", "actually", "simply" — delete |
| Hedging | "should be", "might want to", "it's recommended that" — use imperative |
| Articles where meaning survives without | usually drop; keep where they carry case/role |
| Restating the obvious | "this is important to note that" — delete |
| Preamble | "In this document we will cover…" — start with the rule |
| Symmetry padding | "It is worth mentioning that" — delete |

### Keep — never compress these

| Keep | Why |
| --- | --- |
| `not`, `never`, `no`, `only`, `except` | dropping flips the meaning. Costs more than it saves |
| Numbers, units, versions | exact or useless |
| Error strings | quoted exactly, always |
| Code, commands, API names, commit keywords | never reworded |
| Standard acronyms | DB, API, HTTP — one token each |
| Noun clusters > 3 words | splitting them adds tokens and ambiguity |
| Correct verb forms | "when it is not" costs the same as "when not" — mangling buys nothing |

### Do not invent abbreviations

`cfg`, `impl`, `req`, `res`, `fn`, `auth` cost the same as the full word under a modern
tokenizer and still cost a decode. **The full word is cheaper *and* clearer.** Write
`configuration`, `implementation`, `request`, `function`.

Same for arrows: `X -> Y` costs its own token and saves nothing.

### Do not grow output to sound compressed

Never add a word to fake broken grammar. If a caveman phrasing is not shorter than the
plain phrasing, use the plain phrasing.

### Sentence shape

One idea per sentence. Target 20 words max. Active voice. Present tense when true.
Noun clusters 3 words max. Pronoun only with one clear referent, otherwise repeat the
noun. Instruction = imperative: "Run X", not "X should be run".

Conflict between compression and clarity → **clarity wins**.

### Apply it to

- Rules and docs: dense, imperative, no preamble
- Code comments: only the *why*. Never the what. Never commented-out code
- Test names: describe behaviour, no filler
- Commit messages: one line, imperative, scope in parens
- The chat reply: same compression, but **keep the evidence block uncompressed** — full
  command, full exit code, real counts

---

## 3. Examples

**Docs**

```
❌ In this document we will explain that you should not use the any type.
✅ `any` is forbidden. Use `unknown` + a guard.
```

**Code comments**

```
❌ // This loop iterates over the array of users and prints each name
✅ // exclude soft-deleted: cascade does not run on bulk delete
```

**Commits**

```
✅ fix(auth): return 401 instead of leaking user existence
❌ fix(auth): corrige o bug do login que estava quebrado
❌ update
```

**Chat with the user (Portuguese, compressed)**

```
User: "deu erro no build, o que foi?"
You:  "error.tsx sem `"use client"`. Corrigi. typecheck verde."
Repo: "fix(app): add use client directive to error boundary"
```

That is the whole law: the conversation matches the human, the repository stays English
and dense, and nothing that changes meaning gets shorter.
