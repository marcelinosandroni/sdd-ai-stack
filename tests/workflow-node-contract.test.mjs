import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * `check-coverage` refuses to run below Node 24: the test runner only
 * aggregates coverage across its child processes from 24 on, and on 22 the
 * summary is empty, which reads as zero coverage.
 *
 * `prepublishOnly` runs `check:coverage`, so **every job that publishes has to
 * be on 24 too**. The npm job shipped on 22 and died in its own gate before it
 * ever reached the registry. The GitHub Packages job had the same version for
 * the same reason.
 *
 * A version number in a workflow is not a preference; it is a contract with the
 * scripts that run under it. This test is that contract.
 */
const MIN_NODE = 24;

function jobBlocks(workflow) {
  const blocks = [];
  const pattern = /^ {2}([a-z-]+):$/gm;
  let match;
  const starts = [];
  while ((match = pattern.exec(workflow)) !== null) {
    starts.push({ name: match[1], index: match.index });
  }
  for (let i = 0; i < starts.length; i += 1) {
    const from = starts[i].index;
    const to = i + 1 < starts.length ? starts[i + 1].index : workflow.length;
    blocks.push({ name: starts[i].name, body: workflow.slice(from, to) });
  }
  return blocks;
}

function versionsIn(body) {
  return [...body.matchAll(/node-version:\s*"?(\d+)"?/g)].map((m) => Number(m[1]));
}

test("every job that runs prepublishOnly is on a Node the coverage gate accepts", () => {
  const workflow = fs.readFileSync(
    path.join(REPO_ROOT, ".github", "workflows", "release.yml"),
    "utf8",
  );

  // The two publish jobs, identified by the command they run. They differ in
  // flags — the GitHub Packages one passes `--provenance=false` and omits
  // `--access` — so matching the whole command would miss it.
  const publishers = jobBlocks(workflow).filter((job) =>
    /run:\s*npm publish\s+--/.test(job.body),
  );
  assert.ok(
    publishers.length >= 2,
    `expected the npm and GitHub Packages publish jobs, found ${publishers.length}`,
  );

  for (const job of publishers) {
    const versions = versionsIn(job.body);
    assert.ok(versions.length > 0, `${job.name} pins no node-version`);

    for (const version of versions) {
      assert.ok(
        version >= MIN_NODE,
        `${job.name} runs on Node ${version}, but prepublishOnly calls ` +
          `check:coverage, which needs Node >= ${MIN_NODE}. The publish would die ` +
          `in its own gate before reaching the registry.`,
      );
    }
  }
});

test("the coverage floor is the same in the script and in the CI step label", () => {
  const script = fs.readFileSync(
    path.join(REPO_ROOT, "SKILLS", "check-coverage", "check-coverage.mjs"),
    "utf8",
  );
  const ci = fs.readFileSync(path.join(REPO_ROOT, ".github", "workflows", "ci.yml"), "utf8");

  const floor = /FLOOR = \{ line: (\d+), branch: (\d+), func: (\d+) \}/.exec(script);
  assert.ok(floor, "could not read the coverage floor from the script");

  const [, line, branch, func] = floor;
  const label = new RegExp(
    `Coverage floor \\(line ${line}, branch ${branch}, func ${func}\\)`,
  );
  assert.ok(
    label.test(ci),
    `ci.yml does not say "Coverage floor (line ${line}, branch ${branch}, func ${func})". ` +
      `A job label that disagrees with the gate it names is a label nobody can trust.`,
  );
});
