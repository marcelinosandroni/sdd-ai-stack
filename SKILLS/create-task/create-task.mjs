#!/usr/bin/env node
/**
 * SKILL: create-task
 * Usage: node SDD/SKILLS/create-task/create-task.mjs <phase> <number> "<title>"
 *
 * A task file with the right id, the right path and the current phase wired
 * into PLAN.md. Hand-writing it every time is how TASK-1.1 and TASK-1.7 end up
 * in the same file, or a task lands with no link from PLAN.md and the agent
 * never finds it.
 *
 * PLAN.md is edited ONLY inside the live task list. The file also carries a
 * fenced ```markdown example of the format; appending there would corrupt the
 * example and leave the real list untouched. So the live list is the first
 * heading that declares a phase, and the insert never crosses a ``` fence.
 */
import fs from "node:fs";
import path from "node:path";

const [phaseArg, numberArg, ...titleParts] = process.argv.slice(2);
const title = titleParts.join(" ").trim();

if (!phaseArg || !numberArg || !title) {
  console.error('Usage: node create-task.mjs <phase> <number> "<title>"');
  console.error('  e.g. node create-task.mjs 4 1 "Add the billing portal"');
  process.exit(1);
}

const phase = String(phaseArg).trim();
const number = String(numberArg).trim();
const id = `TASK-${phase}-${number}`;

if (!/^\d+$/.test(phase) || !/^\d+(\.\d+)*$/.test(number)) {
  console.error("✖ phase must be a number and the task number must be numeric (e.g. 4 and 1).");
  process.exit(1);
}

const root = process.cwd();
const sdd = path.join(root, "SDD");
if (!fs.existsSync(sdd)) {
  console.error("✖ SDD/ not found. Run this from the project root.");
  process.exit(1);
}

const phaseDir = path.join(sdd, "specs", "tasks", `phase-${phase}`);
fs.mkdirSync(phaseDir, { recursive: true });

const file = path.join(phaseDir, `${id}.md`);
if (fs.existsSync(file)) {
  console.error(`✖ ${id} already exists at ${path.relative(root, file)}`);
  process.exit(1);
}

const template = path.join(sdd, "specs", "tasks", "TASK_TEMPLATE.md");
if (!fs.existsSync(template)) {
  console.error("✖ SDD/specs/tasks/TASK_TEMPLATE.md not found.");
  process.exit(1);
}

const relLink = `./tasks/phase-${phase}/${id}.md`;
let body = fs.readFileSync(template, "utf8");
body = body.replace(/^# ✅ TASK \[TASK NAME\]$/m, `# ✅ ${id} — ${title}`);
fs.writeFileSync(file, body, "utf8");

// Register it in PLAN.md, inside the LIVE list only.
const planPath = path.join(sdd, "specs", "PLAN.md");
const lines = fs.readFileSync(planPath, "utf8").split("\n");

// The live list is the `### Tasks` block under the first real `## Current phase`
// heading. Track ``` fences: a task line inside a fence is the example, not the
// list. Anchoring on `### Tasks` (not on any `[TASK-` line) is what keeps the
// template's own phase from swallowing a new project's task.
let insideFence = false;
let phaseHeadingLine = -1;
let tasksHeadingLine = -1;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.trim().startsWith("```")) {
    insideFence = !insideFence;
    continue;
  }
  if (insideFence) continue;
  if (/^##\s+Current phase:/.test(line)) {
    phaseHeadingLine = i;
    continue;
  }
  if (phaseHeadingLine !== -1 && /^###\s+Tasks\s*$/.test(line)) {
    tasksHeadingLine = i;
    break;
  }
}

const entry = `- [ ] ${relLink} - ${title}`;
const placeholder = /^- \[ \] No tasks yet\..*$/m;

// The first task replaces the placeholder — a list that says "No tasks yet" and
// then lists one is a contradiction the agent has to resolve.
const hasPlaceholder = lines.some((line) => placeholder.test(line));

if (phaseHeadingLine === -1) {
  // No live phase at all: create one.
  const insertAt = lines.findIndex((l) => l.startsWith("---"));
  lines.splice(insertAt, 0, "", `## Current phase: ${phase} — New phase`, "", "### Tasks", "", entry, "");
} else if (tasksHeadingLine === -1) {
  // Phase exists but has no `### Tasks` block: add one under the heading.
  lines.splice(phaseHeadingLine + 1, 0, "", "### Tasks", "", entry);
} else {
  // Append at the bottom of the list: after the last task line, or at the top of
  // the block when it is still empty.
  let insertAt = tasksHeadingLine;
  let inFence = false;
  for (let i = tasksHeadingLine + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    if (/^#{2,3}\s+/.test(line)) break;
    if (/^\s*[-*]\s*\[( |x|-)\]\s/.test(line) && !placeholder.test(line)) insertAt = i;
  }

  if (hasPlaceholder) {
    // Replace the placeholder in place, so the new task lands exactly where the
    // agent was told to look.
    const at = lines.findIndex((line) => placeholder.test(line));
    lines[at] = entry;
  } else {
    lines.splice(insertAt + 1, 0, entry);
  }
}

fs.writeFileSync(planPath, lines.join("\n"), "utf8");

console.log(`✓ ${id} created at ${path.relative(root, file)}`);
console.log("✓ registered in SDD/specs/PLAN.md");
console.log("");
console.log("Next: mark it [-] in PLAN.md, fill the acceptance criteria, then implement.");
console.log("Do NOT mark it [x] until the evidence is pasted. See SDD/PREFLIGHT.md");
