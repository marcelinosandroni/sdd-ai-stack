#!/usr/bin/env node
/**
 * Fails when line, branch or function coverage drops below the floor.
 *
 * The numbers live in this file, not in someone's memory, so a careless commit
 * cannot silently reduce them. Raise them when the tests get better; lower them
 * only with a reason written next to the change.
 *
 * REQUIRES NODE >= 24. On Node 22 the test runner spawns each test file in its
 * own process and emits an EMPTY coverage summary — the gate would read "no
 * data" instead of "no coverage". CI therefore pins node 24 for this job.
 */
import { spawnSync } from "node:child_process";

const FLOOR = { line: 95, branch: 85, func: 90 };

const [major] = process.versions.node.split(".").map(Number);
if (major < 24) {
  console.error(
    `::error::check-coverage needs Node >= 24 (running ${process.versions.node}). ` +
      "Node 22 emits an empty coverage summary because the test runner isolates " +
      "each file in a child process.",
  );
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  [
    "--test",
    "--experimental-test-coverage",
    // bin/ is a top-level script: importing it executes it, so the test runner
    // cannot instrument it without running the whole CLI. It is covered instead
    // by tests/bin.test.mjs, which spawns the real binary. Excluding it here
    // keeps the number honest — an unmeasurable file must not drag the total.
    "--test-coverage-exclude=bin/**",
    "tests/cli-flags.test.mjs",
    "tests/scaffold.test.mjs",
    "tests/bin.test.mjs",
    "tests/docs.test.mjs",
  ],
  { encoding: "utf8", shell: false },
);

const output = `${result.stdout}${result.stderr}`;

if (result.status !== 0) {
  console.error(output);
  process.exit(result.status ?? 1);
}

const rows = [...output.matchAll(/^\S.*?\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|/gm)]
  .map((m) => ({
    file: m[0].split("|")[0].trim().replace(/^ℹ\s*/, ""),
    line: Number(m[1]),
    branch: Number(m[2]),
    func: Number(m[3]),
  }));

const total = rows.find((r) => r.file === "all files");
if (!total) {
  console.error("::error::could not read the coverage summary");
  console.error(output);
  process.exit(1);
}

const failures = [
  ["line", total.line, FLOOR.line],
  ["branch", total.branch, FLOOR.branch],
  ["func", total.func, FLOOR.func],
].filter(([, actual, floor]) => actual < floor);

for (const [kind, actual, floor] of failures) {
  console.error(`::error::coverage ${kind} ${actual}% is below the ${floor}% floor`);
}

console.log(
  `coverage: line ${total.line}% (floor ${FLOOR.line}%), ` +
    `branch ${total.branch}% (floor ${FLOOR.branch}%), ` +
    `func ${total.func}% (floor ${FLOOR.func}%)`,
);

process.exit(failures.length > 0 ? 1 : 0);
