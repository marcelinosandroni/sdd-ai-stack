import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { scaffold } from "../lib/scaffold.mjs";

const silent = () => {};
const SKILL = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "SKILLS",
  "create-task",
  "create-task.mjs",
);

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "sdd-task-test-"));
}

/** Generates an app and returns its root. */
function generatedApp() {
  const parent = tmp();
  const target = path.join(parent, "app");
  scaffold({ target, template: "next", log: silent, shortcutMode: "stub" });
  return target;
}

function runSkill(root, ...args) {
  return execFileSync(process.execPath, [SKILL, ...args], {
    cwd: root,
    encoding: "utf8",
  });
}

test("create-task: creates the file and registers it in PLAN.md", () => {
  const root = generatedApp();
  runSkill(root, "0", "1", "Add the billing portal");

  const file = path.join(root, "SDD", "specs", "tasks", "phase-0", "TASK-0-1.md");
  assert.ok(fs.existsSync(file), "the task file was not created");

  const body = fs.readFileSync(file, "utf8");
  assert.match(body, /^# ✅ TASK-0-1 — Add the billing portal$/m);
  // The template's sections must survive the copy.
  assert.match(body, /## 🧪 Acceptance criteria/);
  assert.match(body, /## 🔒 Security checklist/);

  const plan = fs.readFileSync(path.join(root, "SDD", "specs", "PLAN.md"), "utf8");
  assert.match(plan, /^- \[ \] \.\/tasks\/phase-0\/TASK-0-1\.md - Add the billing portal$/m);
});

test("create-task: the entry lands in the live list, not in the fenced example", () => {
  const root = generatedApp();
  runSkill(root, "0", "1", "Add the billing portal");

  const plan = fs.readFileSync(path.join(root, "SDD", "specs", "PLAN.md"), "utf8");

  const entryIndex = plan.indexOf("./tasks/phase-0/TASK-0-1.md");
  assert.ok(entryIndex > -1, "the entry is missing from PLAN.md");

  // The entry must sit under the live `### Tasks` heading, before the
  // `## 📋 Delivery checklist` block that owns the ``` fences.
  const tasksIndex = plan.indexOf("### Tasks");
  const checklistIndex = plan.indexOf("## 📋 Delivery checklist");
  assert.ok(tasksIndex < entryIndex, "the entry is above the live task list");
  assert.ok(entryIndex < checklistIndex, "the entry leaked into the checklist block");

  // The empty-list placeholder is replaced, not kept alongside the task.
  assert.doesNotMatch(plan, /^- \[ \] No tasks yet\./m);
});

test("create-task: the delivery-checklist example is never edited", () => {
  const root = generatedApp();
  const before = fs.readFileSync(path.join(root, "SDD", "specs", "PLAN.md"), "utf8");

  runSkill(root, "0", "1", "Add the billing portal");

  const after = fs.readFileSync(path.join(root, "SDD", "specs", "PLAN.md"), "utf8");
  // Everything from the checklist heading on must be byte-identical.
  const tail = (text) => text.slice(text.indexOf("## 📋 Delivery checklist"));
  assert.equal(tail(after), tail(before), "the fenced example was modified");
});

test("create-task: tasks keep insertion order", () => {
  const root = generatedApp();
  runSkill(root, "0", "1", "First");
  runSkill(root, "0", "2", "Second");
  runSkill(root, "0", "3", "Third");

  const plan = fs.readFileSync(path.join(root, "SDD", "specs", "PLAN.md"), "utf8");
  const order = [...plan.matchAll(/^- \[ \] \.\/tasks\/phase-0\/TASK-0-(\d)\.md - (\w+)$/gm)].map(
    (m) => Number(m[1]),
  );
  assert.deepEqual(order, [1, 2, 3], `expected 1,2,3 in order — got ${order.join(",")}`);
});

test("create-task: refuses a duplicate id instead of overwriting", () => {
  const root = generatedApp();
  runSkill(root, "0", "1", "First");

  assert.throws(
    () => runSkill(root, "0", "1", "Second"),
    (error) => {
      assert.ok(error.status > 0, "expected a non-zero exit");
      assert.match(String(error.stderr), /already exists/);
      return true;
    },
  );
});

test("create-task: rejects a non-numeric phase or task number", () => {
  const root = generatedApp();
  assert.throws(() => runSkill(root, "alpha", "1", "X"), /phase must be a number/);
  assert.throws(() => runSkill(root, "0", "one", "X"), /phase must be a number/);
});

test("create-task: rejects a missing title", () => {
  const root = generatedApp();
  assert.throws(() => runSkill(root, "0", "1"), /Usage:/);
});

test("a generated app starts with an EMPTY phase history", () => {
  const root = generatedApp();
  const phases = path.join(root, "SDD", "specs", "history", "phases");

  const files = fs.readdirSync(phases);
  assert.deepEqual(files, [], `the template's own history leaked into the app: ${files}`);

  // ...but the folder and an explanation exist, so the agent knows where to write.
  assert.ok(fs.existsSync(path.join(root, "SDD", "specs", "history", "README.md")));
});

test("this repository keeps its own phase history", () => {
  const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
  const phases = path.join(repoRoot, "specs", "history", "phases");
  const files = fs.readdirSync(phases).filter((f) => f.endsWith(".md"));
  assert.ok(files.length > 0, "the RULE_COPY_SKIP logic must not touch this repository");
});
