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
  const unfinished = [...plan.matchAll(/^\s*\[( |-)\]\s/gm)];

  // Nothing open at all. That is a real state — the ROADMAP can be fully delivered —
  // and the first version of this rule compared the PLAN against `undefined` here,
  // which reads like a bug in the ROADMAP rather than like completion. In this state
  // the PLAN may name the last closed phase, provided that phase is actually
  // finished.
  if (open.length === 0) {
    assert.deepEqual(
      unfinished,
      [],
      `every phase in the ROADMAP is closed, but the PLAN still has ${unfinished.length} ` +
        `task(s) not marked [x]. Either the ROADMAP is out of date or the work is not done.`,
    );
    assert.ok(
      phases.some((p) => p.n === phase),
      `the PLAN works phase ${phase}, which the ROADMAP does not describe at all`,
    );
    return;
  }

  if (!open.includes(phase)) {
    // A closed phase is allowed in the PLAN only while it is being archived: every
    // one of its tasks `[x]`. The rule is not "never a closed phase" — it is "never
    // pointing at finished work while there is still work to do". Without this
    // exception, closing a phase and writing its archive would make the test fail
    // for the duration of a task that is required to happen.
    assert.deepEqual(
      unfinished,
      [],
      `the PLAN sits on phase ${phase}, which the ROADMAP closed, with ${unfinished.length} ` +
        `task(s) not marked [x]. The lowest open phase is ${open[0]}. Either finish the phase or ` +
        `point the PLAN at ${open[0]}.`,
    );
    return;
  }

  assert.equal(
    phase,
    open[0],
    `the PLAN works phase ${phase}, but the lowest open phase in the ROADMAP is ${open[0]}. ` +
      `The PLAN is the file an agent opens first; pointing it past the open work is how work ` +
      `gets planned against a stale problem.`,
  );
});

test("every file the stacks router names exists", () => {
  // A router's entire value is that its entries resolve. An agent that follows one
  // to a missing file learns to stop following the router, and it costs the same as
  // a false claim anywhere else.
  //
  // This test exists because phase 11 filed a finding against this router that was
  // false: it reported five missing stack documents that the router never promised,
  // and the only evidence for the claim was the sentence writing it. So the router's
  // promise surface is now asserted rather than trusted — and the lesson generalises
  // past this file: prove the absence with a command before filing it as a defect.
  const router = fs.readFileSync(path.join(REPO_ROOT, "stacks", "README.md"), "utf8");
  const named = [...router.matchAll(/\]\(\.\/([a-z0-9-]+\.md)\)/g)].map((m) => m[1]);

  assert.ok(named.length > 8, `the router names only ${named.length} files; it was probably restructured`);

  const missing = named.filter((file) => !fs.existsSync(path.join(REPO_ROOT, "stacks", file)));
  assert.deepEqual(
    missing,
    [],
    `stacks/README.md names ${missing.join(", ")}, which do not exist. ` +
      `Either write them or stop promising them — a dead entry in a router is a lie ` +
      `with a table around it.`,
  );
});

test("every stack file on disk is reachable from the stacks router", () => {
  // The other direction, and the one that bit: a file that exists but is never named
  // is a rule no agent will ever open. Both directions have to hold for the router to
  // be a map rather than a list.
  const router = fs.readFileSync(path.join(REPO_ROOT, "stacks", "README.md"), "utf8");
  const named = new Set([...router.matchAll(/\]\(\.\/([a-z0-9-]+\.md)\)/g)].map((m) => m[1]));

  const orphans = fs
    .readdirSync(path.join(REPO_ROOT, "stacks"))
    // The router does not link to itself; that is what a router is.
    .filter((f) => f.endsWith(".md") && f !== "README.md" && !named.has(f))
    .sort();

  assert.deepEqual(
    orphans,
    [],
    `stacks/ has ${orphans.join(", ")}, which the router never names. ` +
      `An unlinked rule file is a rule no agent opens.`,
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