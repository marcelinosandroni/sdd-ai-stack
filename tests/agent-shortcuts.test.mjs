import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { installRules, installShortcuts } from "../lib/scaffold.mjs";

const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * The template promises, in its own words:
 *
 *   "AI agents (Claude Code, Cursor, Copilot…) fail on projects without explicit
 *    rules"  — docs/PRODUCT.md §the problem
 *
 * So it generates a shortcut per tool. It had never been checked whether each
 * tool still reads the file we generate for it, and one of them does not.
 *
 * What each tool actually loads, as of the tools' own documentation:
 *
 *   | tool     | reads our shortcut?                                    |
 *   | ---      | ---                                                    |
 *   | Claude   | `CLAUDE.md` yes                                        |
 *   | Gemini   | `GEMINI.md` yes, and `AGENTS.md` as fallback              |
 *   | Copilot  | `.github/copilot-instructions.md` yes, and `AGENTS.md`    |
 *   | Cline    | `.clinerules` yes                                      |
 *   | Windsurf | `.windsurfrules` yes, and `.windsurf/rules/`             |
 *   | Cursor   | **`.cursorrules` is legacy and is NOT loaded in Agent     |
 *              |  mode** — the current format is `.cursor/rules/*.mdc`     |
 *
 * `.cursorrules` is the one that fails. It loads in Cursor's Chat mode and is
 * silently ignored in Agent mode, which is the mode an SDD workflow depends on —
 * the whole point of the rules is that the agent acts autonomously. So the
 * project gets a file that teaches it nothing, and nothing says so.
 */
/**
 * A full generated project: the rules plus the root shortcuts. `installRules`
 * alone does not create them — that is `installShortcuts`, and testing the wrong
 * one is how this file's first version reported four failures that were its own.
 */
function generatedApp() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-tools-"));
  installRules(root, { log: () => {} });
  installShortcuts(root, { log: () => {}, mode: "stub" });
  return root;
}

const SHORTCUTS = [
  { file: "CLAUDE.md", tool: "Claude Code" },
  { file: "GEMINI.md", tool: "Gemini CLI" },
  { file: ".github/copilot-instructions.md", tool: "GitHub Copilot" },
  { file: ".clinerules", tool: "Cline" },
  { file: ".windsurfrules", tool: "Windsurf" },
  { file: "AGENTS.md", tool: "Codex, OpenCode, Copilot, Cursor" },
];

test("every tool the template claims to support gets a shortcut it reads", () => {
  const root = generatedApp();
  try {
    for (const { file, tool } of SHORTCUTS) {
      assert.ok(
        fs.existsSync(path.join(root, file)),
        `${tool} is named in PRODUCT.md but there is no ${file}`,
      );
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("the one shortcut its tool does not fully load says so in the file", () => {
  const root = generatedApp();
  try {
    const cursorRules = fs.readFileSync(path.join(root, ".cursorrules"), "utf8");

    // `.cursorrules` loads in Chat mode and is ignored in **Agent mode**. The
    // root `AGENTS.md` covers Agent mode natively, so the fix is not another
    // file — it is saying so where someone reads `.cursorrules` and assumes the
    // rules are active.
    //
    // An earlier version of this test demanded `.cursor/rules/*.mdc` as well. That
    // was wrong: AGENTS.md already covers Agent mode, and a third format
    // pointing at the same file is one more thing to drift.
    assert.match(
      cursorRules,
      /Agent mode/i,
      ".cursorrules does not mention that Cursor ignores it in Agent mode. A user " +
        "reading this file there would believe the rules were loaded when they were not.",
    );
    assert.match(
      cursorRules,
      /AGENTS\.md/,
      ".cursorrules does not say what to use in Agent mode instead",
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("a shortcut points at the real file and does not duplicate the rules", () => {
  const root = generatedApp();
  try {
    for (const { file } of SHORTCUTS) {
      const text = fs.readFileSync(path.join(root, file), "utf8");

      assert.match(
        text,
        /SDD\/AGENTS\.md/,
        `${file} does not point at SDD/AGENTS.md`,
      );

      // The rules live in one place. A shortcut that carries a copy of them
      // drifts the moment one is edited, and an agent reading a stale copy has
      // the old laws with none of the new ones.
      const lines = text.split("\n").length;
      assert.ok(
        lines < 60,
        `${file} is ${lines} lines. A shortcut that grows is a second copy of the ` +
          `rules, and a second copy is always the stale one.`,
      );
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("a shortcut names the tool that reads it", () => {
  const root = generatedApp();
  try {
    // Every shortcut was titled "AGENTS.md (pointer)", including `CLAUDE.md`. An
    // agent opening CLAUDE.md read a heading naming a different file and had to
    // work out why. It costs one line to say who reads this.
    for (const { file, tool } of SHORTCUTS) {
      const text = fs.readFileSync(path.join(root, file), "utf8");
      const heading = text.split("\n")[0];

      assert.doesNotMatch(
        heading,
        /AGENTS\.md/,
        `${file} is titled "${heading}" — it is opened by ${tool}, and a heading ` +
          `naming a different file sends the reader looking for the wrong one`,
      );
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("the generated app says which tools it supports and where to change them", () => {
  // The template's README, which becomes the project's README. The shortcuts are
  // invisible without a table: a user sees seven files at their root and no way
  // to know which one their tool reads, or that editing any of them is wrong.
  const readme = fs.readFileSync(path.join(REPO_ROOT, "template", "next", "README.md"), "utf8");

  for (const { file, tool } of SHORTCUTS) {
    const named = tool.split(",")[0].trim();
    assert.ok(
      readme.includes(named),
      `template/next/README.md never mentions ${named}, so the generated README ` +
        `cannot say which shortcut is theirs`,
    );
    assert.ok(
      readme.includes(`\`${file}\``),
      `template/next/README.md does not list ${file} in the shortcuts table`,
    );
  }

  assert.match(
    readme,
    /Edit `SDD\/`, never the pointer/,
    "the generated README does not say where the rules are edited",
  );
});
