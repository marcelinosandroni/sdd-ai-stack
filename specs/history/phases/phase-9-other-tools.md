# Phase 9 — The rules in other tools (DONE)

> Seven shortcuts, generated blind. Nobody checked whether the tool still reads the
> file it writes.

## The gap

The template writes seven root shortcuts so that any agent starts in the right
place. The generation was correct — every one of them pointed at
`./SDD/AGENTS.md` — and the *wording* of six of them was wrong in the same way:
each was titled `AGENTS.md (pointer)`.

So an agent opening `CLAUDE.md` saw a heading naming a different file. It resolves,
and it is still wrong: the file says it is a pointer to something else, which is a
pointer wearing a disguise.

## The finding that mattered

`.cursorrules` loads in Cursor's **Chat** mode and is **silently ignored in Agent
mode** — the mode an SDD workflow depends on, because Agent mode is what reads
rules and edits files.

No error, no warning, no entry in any log. A user who followed the setup table,
saw the file created, and got a chat assistant that ignored the entire rule set.
Nothing in this repository could detect it: the file existed, it was not empty,
and it resolved.

## Delivered

- Each shortcut names **its own reader**. `CLAUDE.md` is titled for Claude Code,
  `GEMINI.md` for the Gemini CLI, `.github/copilot-instructions.md` for Copilot.
- `.cursorrules` says, **inside the file**, that it is Chat-only, and points at
  `AGENTS.md` for Agent mode. The limitation ships to the user instead of hiding
  until they wonder why nothing obeys the rules.
- The generated README carries the reader table and says to edit `SDD/`, never the
  pointer — a shortcut that looks editable is an edit that gets overwritten on the
  next `git submodule update`.

## Scope out

Duplicating the rules per tool. Seven copies of the law is seven copies to drift;
pointers keep one source of truth.

## Evidence

```
tests/agent-shortcuts.test.mjs   each shortcut names its own reader
                                .cursorrules states its Chat-only limitation
```