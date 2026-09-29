# 🗣 LANGUAGE

> **Default: English. Everywhere. Always.**
> Write in the user's language **only** when they explicitly ask for it.
> This file is law — see [`AGENTS.md`](../AGENTS.md) §3.

---

## 🎯 The rule

| Surface | Default | Exception |
| --- | --- | --- |
| Commit messages | **English** | user says otherwise |
| PR titles and bodies | **English** | user says otherwise |
| Documentation (`.md`) | **English** | user says otherwise |
| Code comments | **English** | user says otherwise |
| Identifiers (`variable`, `type`, `function`, `branch`) | **English** | — (never translate a symbol) |
| Code, error strings, test names | **English** | — |
| Specs, tasks, plans, changelog | **English** | user says otherwise |
| **Conversation with the user** | user's language | — |

> The last row is the important one: **you still talk to the user in the language they
> use.** The rule is about what you *write into the repo*, not how you *talk to a human*.
> A Brazilian dev wants Portuguese chat and an English codebase.

---

## 🤔 Why English, when the user speaks another language

1. **Tokens.** English is roughly 15–25% cheaper in tokens than Portuguese or Spanish for
   the same content, because the model's tokenizer was trained mostly on English.
   Every rule file is loaded on every task — that cost is paid every single time.
2. **The ecosystem is English.** Every error message you will ever read, every Stack
   Overflow answer, every LLM's own vocabulary, every library's type names. Matching
   the ecosystem means fewer translation hops between the spec and the fix.
3. **It scales.** A rule file in English can be used by any agent, any teammate, any
   country. A rule file in Portuguese is a single-team artifact.
4. **It is the lingua franca of the tools.** Superpowers, spec-kit, caveman, shadcn,
   the Next.js docs — all English. Rules written in English compose with them directly.

---

## 🚨 What "explicitly" means

The user must **ask for it**. These do **not** count as asking:

| Situation | Do you write Portuguese? |
| --- | --- |
| User writes to you in Portuguese | ❌ No — chat in Portuguese, repo in English |
| The repo's code is in Portuguese (legacy) | ❌ No — new work is English; do not churn old files |
| A file name is Portuguese | ❌ No — new names in English |
| User says *"escreve em português"* / *"write in Spanish"* / *"alles auf Deutsch"* | ✅ **Yes** — and follow it for the rest of the session |

When a user asks for another language once:

- Apply it to **the current task**.
- Ask before extending it to **the whole repo** — flipping an entire rule set to another
  language is a big, hard-to-review change. Propose it, do not assume it.

> **Mixed-language repo is a bug, not a style.** If you find yourself adding a Portuguese
> comment to an English file, stop and follow this rule.

---

## 📝 Commit messages

Full format and examples in [`git.md`](./git.md). The language part, in short:

```text
✅ fix(auth): return 401 instead of leaking user existence
❌ fix(auth): retorna 401 em vez de vazar existência do usuário
```

## 🔤 Documentation

```text
✅ The use case receives plain data and returns plain data.
❌ O caso de uso recebe dados puros e retorna dados puros.
```

## 💬 Talking to the user

```text
User (pt-BR):  "deu erro no build, o que foi?"
You (pt-BR):   "Boa pergunta — foi o `error.tsx` sem `"use client"`. Corrigi aqui."
Repo:          "fix(release): add use client directive to error boundary"
```

That is the whole rule. The conversation matches the human; the repository stays
English so it stays cheap, portable, and tool-compatible.
