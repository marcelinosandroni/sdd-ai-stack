import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS = path.join(REPO_ROOT, "SKILLS");

/**
 * A skill had two implementations: `create-feature.mjs` and `create-feature.sh`.
 *
 * The `.mjs` was fixed in phase 8 — it now ships a test with the slice. The `.sh`
 * was not, and `SKILL.md` documented the `.sh` as a valid alternative. So every
 * agent on Linux or macOS, following the document, landed on the unfixed path and
 * got a slice with no test. CI was green the whole time, because the guard that
 * proves the skill ships a test only ever executed the `.mjs`.
 *
 * The general failure is worse than the bug: a guard that only exercises one
 * implementation certifies the other one too. These tests make "one entry point
 * per skill" a property of the repository rather than a habit.
 */

/**
 * Every script a skill ships, wherever it sits.
 *
 * The loose-file case matters: `create-feature.sh` lived directly in `SKILLS/`
 * rather than inside `SKILLS/create-feature/`, so a scan that only walks
 * directories does not see it — which is precisely how it stayed unfixed and
 * unmentioned. The first version of this guard had that hole and passed while the
 * bug was planted in front of it.
 */
function skillScripts() {
  const found = [];
  for (const entry of fs.readdirSync(SKILLS, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const dir = path.join(SKILLS, entry.name);
      for (const file of fs.readdirSync(dir)) {
        if (/\.(mjs|sh|js|ts)$/.test(file)) found.push({ skill: entry.name, file, dir });
      }
    } else if (entry.isFile() && /\.(mjs|sh|js|ts)$/.test(entry.name)) {
      // A loose script beside the folders: group it under the name it mirrors.
      const stem = entry.name.replace(/\.(mjs|sh|js|ts)$/, "");
      found.push({ skill: stem, file: entry.name, dir: SKILLS, loose: true });
    }
  }
  return found;
}

test("no skill ships a shell mirror of a script that already exists in node", () => {
  const scripts = skillScripts();
  const bySkill = new Map();
  for (const script of scripts) {
    // A loose `foo.sh` is its own group name already, so group by the *stem* to
    // pair it with the folder implementation it mirrors.
    const key = script.loose ? script.file.replace(/\.(mjs|sh|js|ts)$/, "") : script.skill;
    if (!bySkill.has(key)) bySkill.set(key, []);
    bySkill.get(key).push(script.file);
  }

  const duplicates = [];
  for (const [, files] of bySkill) {
    const node = files.filter((f) => f.endsWith(".mjs") || f.endsWith(".js"));
    const shell = files.filter((f) => f.endsWith(".sh"));
    if (node.length > 0 && shell.length > 0) duplicates.push(files.join(", "));
  }

  assert.deepEqual(
    duplicates,
    [],
    `a skill with both a node and a shell script has an implementation nothing validates:\n${duplicates.join("\n")}`,
  );
});

test("no script sits loose in SKILLS/ beside the folder that owns it", () => {
  const loose = fs
    .readdirSync(SKILLS, { withFileTypes: true })
    .filter((e) => e.isFile() && /\.(mjs|sh|js|ts)$/.test(e.name))
    .map((e) => e.name);

  assert.deepEqual(
    loose,
    [],
    `a script loose in SKILLS/ is outside every skill folder, so no SKILL.md documents it and no guard walks it: ${loose.join(", ")}`,
  );
});

test("no SKILL.md points an agent at a shell script", () => {
  const offenders = [];
  for (const entry of fs.readdirSync(SKILLS, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const doc = path.join(SKILLS, entry.name, "SKILL.md");
    if (!fs.existsSync(doc)) continue;
    const text = fs.readFileSync(doc, "utf8");
    // A `bash …` line in a SKILL.md is an entry point. It is the documented path
    // that bypasses whatever the node script is checked for.
    for (const match of text.matchAll(/^\s*(?:#\s*)?(?:bash|sh)\s+(\S+)/gm)) {
      offenders.push(`${entry.name}/SKILL.md -> ${match[1]}`);
    }
  }

  assert.deepEqual(
    offenders,
    [],
    `SKILL.md documents a shell entry point:\n${offenders.join("\n")}`,
  );
});

test("the create-feature mirror is gone, and stays gone", () => {
  assert.equal(
    fs.existsSync(path.join(SKILLS, "create-feature.sh")),
    false,
    "SKILLS/create-feature.sh is back. It generates no test, and nothing checks it. " +
      "If a second implementation is genuinely needed, it needs its own guard.",
  );
});

test("every skill that ships a script is documented in its own SKILL.md", () => {
  const missing = skillScripts()
    .filter((s) => s.file.endsWith(".mjs"))
    .filter((s) => !fs.existsSync(path.join(s.dir, "SKILL.md")))
    .map((s) => `${s.skill}/${s.file}`);

  assert.deepEqual(
    missing,
    [],
    `a skill with a script but no SKILL.md cannot be found by an agent that does not already know it exists:\n${missing.join("\n")}`,
  );
});