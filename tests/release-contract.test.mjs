import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * The files the release workflow asserts are in the tarball.
 *
 * `release.yml` greps `npm pack --dry-run` output for each of these. That guard
 * shipped with a wrong path — `template/next/proxy.ts` instead of
 * `template/next/src/proxy.ts` — and could never have passed. It was only found
 * because the dry run was executed instead of assumed.
 *
 * So the list lives here, in a test, and the workflow reads it from the same
 * source of truth. A guard that has never gone green is not a guard.
 */
export const ESSENTIAL_FILES = [
  "bin/create-sdd-ai-stack.mjs",
  "lib/scaffold.mjs",
  "AGENTS.md",
  "PREFLIGHT.md",
  "DESIGN.md",
  "APP-STACK.md",
  "stacks/README.md",
  "stacks/clean-code.md",
  "stacks/language.md",
  "template/next/gitignore",
  "template/next/package.json",
  "template/next/src/proxy.ts",
  "template/next/components.json",
  "SKILLS/create-feature/SKILL.md",
  "SKILLS/create-task/SKILL.md",
  "SKILLS/check-rules/check-rules.mjs",
  "SKILLS/check-docs/SKILL.md",
];

/**
 * The list of files npm would pack, read from the actual tarball.
 *
 * `npm pack --dry-run` writes the listing to STDERR, and `shell: true` on
 * Windows re-serialises its JSON through cmd.exe. Both make the npm CLI a poor
 * source of truth for a test. So the test packs with Node's own tar writer and
 * reads the archive back — the same artefact the release guard protects, with no
 * shell in the path.
 */
function packedFiles() {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-pack-"));
  const tarball = path.join(work, "package.tgz");
  try {
    // Node 22+ refuses to spawn a `.cmd` without a shell (EINVAL), and a shell
    // rewrites the output we would then have to parse. So the CLI is invoked
    // through cmd.exe directly, with stdio discarded — nothing to parse.
    if (process.platform === "win32") {
      execFileSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", "npm", "pack", "--pack-destination", work], {
        cwd: REPO_ROOT,
        stdio: "ignore",
      });
    } else {
      execFileSync("npm", ["pack", "--pack-destination", work], {
        cwd: REPO_ROOT,
        stdio: "ignore",
      });
    }

    const produced = fs
      .readdirSync(work)
      .find((name) => name.endsWith(".tgz"));
    assert.ok(produced, "npm pack produced no tarball");
    fs.renameSync(path.join(work, produced), tarball);

    return execFileSync("tar", ["-tzf", tarball], { encoding: "utf8", shell: false });
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
}

test("every file the release guard requires really is in the tarball", () => {
  const listing = packedFiles();

  const missing = ESSENTIAL_FILES.filter(
    (file) => !listing.split(/\r?\n/).some((line) => line.replace(/^package\//, "") === file),
  );
  assert.deepEqual(
    missing,
    [],
    `the release guard greps for these and would fail on the missing ones: ${missing.join(", ")}`,
  );
});

test("the release workflow lists exactly the files this test requires", () => {
  // The workflow has its own copy, because a workflow cannot import from the
  // test suite. This test is what stops the two copies from drifting.
  const workflow = fs.readFileSync(
    path.join(REPO_ROOT, ".github", "workflows", "release.yml"),
    "utf8",
  );

  for (const file of ESSENTIAL_FILES) {
    assert.ok(
      workflow.includes(file),
      `release.yml does not assert ${file}, but the test requires it in the tarball`,
    );
  }
});

test("the essential files exist on disk, so the guard tests the real thing", () => {
  // A path that does not exist cannot appear in the pack, so the first test
  // would pass for the wrong reason if these were typo'd.
  const missing = ESSENTIAL_FILES.filter(
    (file) => !fs.existsSync(path.join(REPO_ROOT, file)),
  );
  assert.deepEqual(missing, [], `these do not exist: ${missing.join(", ")}`);
});
