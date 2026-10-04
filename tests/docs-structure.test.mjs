import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const README = path.join(REPO_ROOT, "README.md");
const ROADMAP = path.join(REPO_ROOT, "specs", "ROADMAP.md");
const PLAN = path.join(REPO_ROOT, "specs", "PLAN.md");

/**
 * `check:facts` made the *numbers* in prose falsifiable, and it was green over a
 * README that listed 3 of the 8 skills, a ROADMAP with two sections both titled
 * "Planned", and two closed phases that had never been archived.
 *
 * None of those is a number. They are **structure**, and a fact checker has no
 * opinion about structure — which is precisely how a document can pass every
 * guard and still be wrong in the way that misleads.
 *
 * So the structural claims live here instead. A fact check recomputes a number a
 * document states; a structural check asserts a property a document must have.
 * Putting both in one script would mean one exit code for two different kinds of
 * claim, and the failure messages would blur together.
 */

function skills() {
  return fs
    .readdirSync(path.join(REPO_ROOT, "SKILLS"), { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

test("the README's SKILLS table lists every skill that exists", () => {
  const readme = fs.readFileSync(README, "utf8");
  const table = readme.slice(readme.indexOf("## 📚 SKILLS"));

  const missing = skills().filter((skill) => !table.includes(`\`${skill}\``));
  assert.deepEqual(
    missing,
    [],
    `the README's SKILLS table does not mention: ${missing.join(", ")}. ` +
      `A skill nobody can find is a skill that does not exist.`,
  );
});

test("the README's SKILLS table does not list a skill that was deleted", () => {
  const readme = fs.readFileSync(README, "utf8");
  const table = readme.slice(readme.indexOf("## 📚 SKILLS"));

  const listed = [...table.matchAll(/^\| `([a-z-]+)`/gm)].map((m) => m[1]);
  const ghosts = listed.filter((name) => !skills().includes(name));

  assert.deepEqual(
    ghosts,
    [],
    `the README's SKILLS table lists skills that do not exist: ${ghosts.join(", ")}. ` +
      `This is what a deleted \`create-feature.sh\` looks like a month later.`,
  );
});

test("the ROADMAP has exactly one Planned section", () => {
  const roadmap = fs.readFileSync(ROADMAP, "utf8");
  const headings = [...roadmap.matchAll(/^## .*Planned.*$/gm)].map((m) => m[0].trim());

  assert.equal(
    headings.length,
    1,
    `the ROADMAP has ${headings.length} "Planned" headings (${headings.join(" | ")}). ` +
      `Two sections with the same name means a reader cannot tell open work from closed work, ` +
      `and a phase list that cannot be trusted is not a roadmap.`,
  );
});

test("every phase the ROADMAP marks done is archived, and every archived phase is in the ROADMAP", () => {
  const roadmap = fs.readFileSync(ROADMAP, "utf8");
  const historyDir = path.join(REPO_ROOT, "specs", "history", "phases");
  const archived = fs
    .readdirSync(historyDir)
    .map((f) => /^phase-(\d+)-/.exec(f)?.[1])
    .filter(Boolean)
    .map(Number)
    .sort((a, b) => a - b);

  // Only a CLOSED phase owes an archive. A planned phase has nothing to archive
  // yet, and demanding one would mean writing history before the work happens.
  const closed = [...roadmap.matchAll(/^### Phase (\d+)([^\n]*)$/gm)]
    .map((m) => ({ n: Number(m[1]), done: m[2].includes("✅") }))
    .filter((p) => p.done)
    .map((p) => p.n);

  assert.ok(closed.length > 0, "the ROADMAP marks no phase as done at all");

  const missingArchive = closed.filter((n) => !archived.includes(n));
  assert.deepEqual(
    missingArchive,
    [],
    `the ROADMAP closes phase(s) ${missingArchive.join(", ")} with no file in specs/history/phases/. ` +
      `A closed phase with no archive is a phase whose reasoning is lost the next time someone edits the ROADMAP.`,
  );

  // Every archived phase, mentioned somewhere in the ROADMAP.
  const orphans = archived.filter((n) => !roadmap.includes(`phase-${n}-`));
  assert.deepEqual(
    orphans,
    [],
    `specs/history/phases/ has phase(s) ${orphans.join(", ")} the ROADMAP never mentions.`,
  );
});

test("the PLAN works the lowest phase the ROADMAP has not closed", () => {
  const plan = fs.readFileSync(PLAN, "utf8");
  const roadmap = fs.readFileSync(ROADMAP, "utf8");

  const current = /^## Current phase: (\d+)/m.exec(plan);
  assert.ok(current, "the PLAN has no `## Current phase: N` heading");
  const phase = Number(current[1]);

  // A phase counts as done when its heading carries the check mark. The heading
  // tail is captured separately: a greedy `[^\n]*` before the mark would swallow
  // it and report every phase as open.
  const phases = [...roadmap.matchAll(/^### Phase (\d+)([^\n]*)$/gm)].map((m) => ({
    n: Number(m[1]),
    done: m[2].includes("✅"),
  }));
  assert.ok(phases.length > 0, "no phase headings found in the ROADMAP");

  const open = phases.filter((p) => !p.done).map((p) => p.n).sort((a, b) => a - b);
  assert.ok(open.length > 0, "the ROADMAP has no open phase, yet the PLAN claims to be in one");

  assert.equal(
    phase,
    open[0],
    `the PLAN works phase ${phase}, but the lowest open phase in the ROADMAP is ${open[0]}. ` +
      `The PLAN is the file an agent opens first; pointing it past the open work, or at a phase ` +
      `the ROADMAP already closed, is how work gets planned against a stale problem.`,
  );
});

test("the PLAN has at most one task in progress", () => {
  const plan = fs.readFileSync(PLAN, "utf8");
  const inProgress = [...plan.matchAll(/^\s*\[-\]\s/gm)];

  assert.ok(
    inProgress.length <= 1,
    `the PLAN has ${inProgress.length} tasks marked [-]. The rule in its own header says exactly one, ` +
      `because two means the agent stopped wrong — and a stale [-] from a closed phase means the file ` +
      `has been pointing at finished work.`,
  );
});