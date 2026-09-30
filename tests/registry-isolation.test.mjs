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

  // With `scope: @marcelinosandroni` on setup-node, npm resolved this
  // repository's OWN dependencies from npm.pkg.github.com, which needs a token
  // it does not have at that point. The suite died 0.3s into the first test
  // file, and the error named neither the scope nor the registry.
  const setupNode = /- uses: actions\/setup-node@v\d+[\s\S]*?(?=\n {6}- name:|\n {2}\S|$)/.exec(job);
  assert.ok(setupNode, "could not find the setup-node step in publish-github");

  assert.doesNotMatch(
    setupNode[0],
    /scope:/,
    "publish-github must not set a scope on setup-node: it repoints every npm " +
      "command in the job, including the gate suite, at a registry that cannot " +
      "serve the project's own dependencies",
  );
});

/**
 * The other half of the bug above, and the reason a dry run was not enough.
 *
 * `setup-node`'s `registry-url` is what writes the `.npmrc` line that makes
 * npm.pkg.github.com read NODE_AUTH_TOKEN. I removed it to stop the leak, the
 * dry run went green because `--dry-run` never authenticates, and the real
 * publish failed with ENEEDAUTH.
 *
 * A green dry run is evidence about exactly as much as the dry run exercised.
 */
test("the GitHub Packages publish can still authenticate", () => {
  const workflow = fs.readFileSync(WORKFLOW, "utf8");
  const job = jobBody(workflow, "publish-github");

  // `npm publish --dry-run` skips the registry entirely, so it cannot prove
  // auth works. Assert the token is wired instead of trusting the dry run.
  //
  // Anchored to the line's own indentation. The workflow comment above it
  // quotes this exact line to explain why it exists, and an unanchored match
  // reads the comment instead of the command — the same trap as `needs: verify`
  // below. Verified: with the `echo` deleted but the comment left in place, an
  // unanchored match still passed.
  assert.match(
    job,
    /^ {10}echo "\/\/npm\.pkg\.github\.com\/:_authToken=\$\{NODE_AUTH_TOKEN\}" >> ~\/\.npmrc$/m,
    "publish-github must write an auth line for npm.pkg.github.com. Without " +
      "registry-url on setup-node nothing provides it, and the real publish " +
      "fails with ENEEDAUTH while the dry run stays green.",
  );

  // The token belongs to the step that has it, not to a global rewrite.
  const setupNode = /- uses: actions\/setup-node@v\d+[\s\S]*?(?=\n {6}- name:|\n {2}\S|$)/.exec(job);
  assert.doesNotMatch(
    setupNode[0],
    /registry-url:\s*https:\/\/npm\.pkg\.github\.com/,
    "publish-github must not set registry-url: it adds a global auth line, and " +
      "the auth line is now written explicitly for the publish alone",
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

/**
 * The bug this file exists for.
 *
 * publish-github rewrites the name to a scope, because GitHub Packages only
 * accepts scoped names. `prepublishOnly` then runs the gate suite, and
 * tests/docs.test.mjs asserts the npm name stays unscoped. The job was
 * contradicting its own gate, and it died 0.3s into the first test file with an
 * error that named neither the job nor the cause.
 *
 * Both halves of that were correct on their own. Together they were a deadlock
 * that no unit test could see, because it only exists once a real publish runs
 * the rewrite and the real suite in that order.
 */
test("a job that rewrites package.json cannot also run the gates that read it", () => {
  const workflow = fs.readFileSync(WORKFLOW, "utf8");
  const job = jobBody(workflow, "publish-github");

  const rewritesName = /p\.name = '@' \+ owner \+ '\/' \+ p\.name/.test(job);
  assert.ok(rewritesName, "expected the scope rewrite in publish-github");

  // prepublishOnly runs `npm run test`, and the suite reads package.json. With
  // the name already scoped, `npm name must stay unscoped` fails. So the
  // publish must not run lifecycle scripts.
  for (const command of [...job.matchAll(/run: (npm publish[^\n]*)/g)].map((m) => m[1])) {
    assert.match(
      command,
      /--ignore-scripts/,
      `"${command}" runs the gate suite AFTER this job rescoped the name. ` +
        `tests/docs.test.mjs asserts the npm name stays unscoped, so the job ` +
        `fails on its own gate. The gates already ran in the verify job on the ` +
        `same SHA; pass --ignore-scripts.`,
    );
  }
});

test("the gates publish-github skips are actually run by the verify job", () => {
  const workflow = fs.readFileSync(WORKFLOW, "utf8");
  const job = jobBody(workflow, "publish-github");
  const verify = jobBody(workflow, "verify");

  // `--ignore-scripts` is only safe if the skipped work is done elsewhere. If
  // the dependency is ever removed, the release would ship unchecked.
  //
  // Anchored to the key, not the bare string. A workflow comment that says
  // "`needs: verify` is the guarantee" is prose; matching it would let the real
  // key be deleted and leave this test green. Verified: with `needs: []` an
  // unanchored match still passed, because the comment contains the text.
  assert.match(
    job,
    /^ {4}needs: verify$/m,
    "publish-github must depend on verify: that dependency is the only thing " +
      "making --ignore-scripts safe",
  );

  for (const gate of ["npm test", "check:coverage", "check-docs"]) {
    assert.ok(
      verify.includes(gate),
      `verify does not run "${gate}", so the publish would ship without it`,
    );
  }
});
