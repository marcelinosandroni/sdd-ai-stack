import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const WORKFLOW = path.join(REPO_ROOT, ".github", "workflows", "release.yml");

function jobBody(workflow, name) {
  const lines = workflow.split(/\r?\n/);
  const start = lines.findIndex((line) => new RegExp(`^  ${name}:$`).test(line));
  assert.notEqual(start, -1, `job "${name}" not found`);

  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^ {2}[a-z-]+:$/.test(lines[i])) {
      return lines.slice(start, i).join("\n");
    }
  }
  return lines.slice(start).join("\n");
}

test("the GitHub Packages publish does not repoint the whole job at its registry", () => {
  const workflow = fs.readFileSync(WORKFLOW, "utf8");
  const job = jobBody(workflow, "publish-github");

  // `prepublishOnly` runs the full gate suite, and those gates resolve npm
  // packages. With `scope: @marcelinosandroni` on setup-node, npm resolved the
  // repository's OWN dependencies from npm.pkg.github.com, which needs a token
  // it does not have at that point. The suite died 0.3s into the first test
  // file, and the error named neither the scope nor the registry.
  const setupNode = /- uses: actions\/setup-node@v\d+[\s\S]*?(?=\n {6}- name:|\n {2}\S|$)/.exec(job);
  assert.ok(setupNode, "could not find the setup-node step in publish-github");

  assert.doesNotMatch(
    setupNode[0],
    /registry-url:\s*https:\/\/npm\.pkg\.github\.com/,
    "publish-github must not set registry-url: it repoints every npm command in " +
      "the job, including prepublishOnly, at a registry that cannot serve the " +
      "project's own dependencies",
  );
  assert.doesNotMatch(
    setupNode[0],
    /scope:/,
    "publish-github must not set a scope on setup-node for the same reason",
  );
});

test("the GitHub Packages publish names its registry explicitly", () => {
  const workflow = fs.readFileSync(WORKFLOW, "utf8");
  const job = jobBody(workflow, "publish-github");

  // The token is how the job authenticates, and the flag is how it says where
  // to publish. Without the flag it would fall back to whatever registry the
  // job happens to have configured, which is the bug above.
  const publishes = [...job.matchAll(/run: (npm publish[^\n]*)/g)].map((m) => m[1]);
  assert.ok(publishes.length >= 2, "expected a real publish and a dry-run step");

  for (const command of publishes) {
    assert.match(
      command,
      /--registry=https:\/\/npm\.pkg\.github\.com/,
      `"${command}" does not name the GitHub Packages registry`,
    );
  }
});

test("the npm publish does not name the GitHub Packages registry", () => {
  const workflow = fs.readFileSync(WORKFLOW, "utf8");
  const job = jobBody(workflow, "publish");

  for (const command of [...job.matchAll(/run: (npm publish[^\n]*)/g)].map((m) => m[1])) {
    assert.doesNotMatch(
      command,
      /npm\.pkg\.github\.com/,
      `the npmjs publish must not target GitHub Packages: "${command}"`,
    );
  }
});

test("only the publish-github job knows about the GitHub Packages registry", () => {
  const workflow = fs.readFileSync(WORKFLOW, "utf8");
  const jobs = [...workflow.matchAll(/^ {2}([a-z-]+):$/gm)].map((m) => ({
    job: m[1],
    index: m.index,
  }));

  const mentions = jobs
    .filter((entry, i) => {
      const end = i + 1 < jobs.length ? jobs[i + 1].index : workflow.length;
      return workflow.slice(entry.index, end).includes("npm.pkg.github.com");
    })
    .map((entry) => entry.job);

  assert.deepEqual(
    mentions,
    ["publish-github"],
    `these jobs reference the GitHub Packages registry: ${mentions.join(", ")}. ` +
      `Only publish-github should; anywhere else it is a global rewrite waiting to ` +
      `break an unrelated npm command.`,
  );
});
