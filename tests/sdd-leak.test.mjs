import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { installRules } from "../lib/scaffold.mjs";

const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * A generated app used to receive this repository's own documents.
 *
 * Measured on the app before this file existed:
 *
 *   41 references to `marcelinosandroni` / `create-sdd-ai-stack`
 *   9 dead relative links, because `history/` is skipped but the files
 *     pointing at it are copied
 *   a 400-line README teaching an agent to publish the template, with the
 *     owner's npm username and the OIDC dashboard URL
 *
 * The cost is not untidiness. An agent opens `SDD/README.md` first, reads how to
 * release someone else's package, and concludes the project it is working on is
 * that package.
 *
 * Three leaks already had a mechanism — `RULE_COPY_SKIP` for `history/`, the
 * fresh `PLAN.md`, the fresh `ROADMAP.md`. This is the same failure a fourth
 * time, which is why these are assertions and not a note.
 */
function generatedApp() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-leak-"));
  installRules(root, { log: () => {} });
  return root;
}

function everyMarkdown(root) {
  const out = [];
  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".md")) out.push(full);
    }
  })(root);
  return out;
}

test("no document in a generated app names this repository's owner or package", () => {
  const root = generatedApp();
  try {
    const offenders = [];

    for (const file of everyMarkdown(root)) {
      const text = fs.readFileSync(file, "utf8");
      // "create-sdd-ai-stack" alone is fine in the provenance line — it says
      // where the rules came from. What must never appear is the owner's handle
      // or the instructions for releasing the template.
      for (const pattern of [/marcelinosandroni/, /npx create-sdd-ai-stack my-app/]) {
        if (pattern.test(text)) {
          offenders.push(`${path.relative(root, file)} — ${pattern}`);
        }
      }
    }

    assert.deepEqual(
      offenders,
      [],
      `these documents tell a consuming app about its template:\n${offenders.join("\n")}`,
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("the generated SDD/ index is written for the new project", () => {
  const root = generatedApp();
  try {
    const index = fs.readFileSync(path.join(root, "SDD", "README.md"), "utf8");

    assert.match(index, /# 🧠 SDD/, "SDD/README.md is not the generated index");
    assert.match(
      index,
      /where to look right now/,
      "SDD/README.md does not say what it is for",
    );

    // It must not be this repository's README with a new heading. The first
    // version of this test only checked the heading, so putting the root README
    // back into RULE_FILES passed — the scaffold overwrites it, and the
    // overwrite hid the regression it was supposed to catch.
    assert.doesNotMatch(
      index,
      /create-sdd-ai-stack \w* · Trusted Publishing|npmjs\.com \|/,
      "SDD/README.md is this repository's own README, which teaches a consuming " +
        "app to publish the template",
    );

    // The index must point at files that exist. A generated index full of dead
    // links is worse than no index: it is the first document an agent reads,
    // and the first broken thing it finds teaches it not to trust the rest.
    for (const [, target] of index.matchAll(/\]\((\.\/[^)#\s]+)\)/g)) {
      assert.ok(
        fs.existsSync(path.resolve(path.join(root, "SDD"), target)),
        `SDD/README.md links to ${target}, which does not exist`,
      );
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("this repository's README is not in the list of files copied to SDD/", () => {
  // The root README is 400 lines of how to publish this template. It must not be
  // on the copy list at all — relying on the scaffold to overwrite it afterwards
  // means the wrong text exists on disk for the length of a write, and any other
  // caller of installRules gets the template's README.
  const constants = fs.readFileSync(path.join(REPO_ROOT, "lib", "constants.mjs"), "utf8");
  const list = /export const RULE_FILES = \[([\s\S]*?)\];/.exec(constants);

  assert.ok(list, "could not read RULE_FILES");
  assert.doesNotMatch(
    list[1],
    /"README\.md"/,
    "RULE_FILES still copies the repository README into SDD/, where it is the " +
      "first document an agent opens",
  );
});

test("the generated PLAN and ROADMAP carry no phase from this repository", () => {
  const root = generatedApp();
  try {
    // `Current phase: 0` is correct — a new app IS at phase 0. What must not
    // survive is a phase this repository closed. The first version of this test
    // banned the string `Current phase: \d` and failed the file it was written
    // to protect: a guard that blocks the right thing to fix the wrong thing.
    const plan = fs.readFileSync(path.join(root, "SDD", "specs", "PLAN.md"), "utf8");
    const phase = /## Current phase: (\d+)/.exec(plan);
    assert.ok(phase, "the generated PLAN has no phase block at all");
    assert.equal(
      Number(phase[1]),
      0,
      `the generated PLAN starts at phase ${phase[1]}; a new project starts at 0`,
    );
    assert.doesNotMatch(
      plan,
      /(DONE|shipped|✅)\s*$/m,
      "the generated PLAN marks a phase as finished; nothing in a new app is",
    );

    const roadmap = fs.readFileSync(path.join(root, "SDD", "specs", "ROADMAP.md"), "utf8");
    assert.doesNotMatch(
      roadmap,
      /history\/phases/,
      "SDD/specs/ROADMAP.md links this repository's phases, which are not copied",
    );
    assert.doesNotMatch(
      roadmap,
      /\|\s*\[?(\d+|phase-\d)/i,
      "SDD/specs/ROADMAP.md has a closed-phase row; a new project has closed none",
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("this repository's release documents are not copied into a consuming app", () => {
  const root = generatedApp();
  try {
    const docs = path.join(root, "SDD", "docs");

    for (const file of ["CHANGELOG.md", "RELEASE.md", "EVIDENCE.md"]) {
      assert.ok(
        !fs.existsSync(path.join(docs, file)),
        `SDD/docs/${file} describes publishing this template — its versions, its ` +
          `registries, its coverage gate. A consumer has no use for it.`,
      );
    }

    // The ones that describe the *process* must survive: a consumer needs them.
    for (const file of ["PRODUCT.md", "PLANNING.md"]) {
      assert.ok(
        fs.existsSync(path.join(docs, file)),
        `SDD/docs/${file} was removed, but it describes how to work, not this ` +
          `repository's history`,
      );
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("every relative link in a generated app resolves", () => {
  const root = generatedApp();
  try {
    const broken = [];

    for (const file of everyMarkdown(root)) {
      const text = fs.readFileSync(file, "utf8");
      // Skip fenced code blocks — an illustrative path inside an example is not
      // a link, the same rule check-docs applies.
      const clean = text.replace(/```[\s\S]*?```/g, (b) => b.replace(/[^\n]/g, " "));
      for (const [, target] of clean.matchAll(/\]\((\.{0,2}\/[^)#\s]+)(?:#[^)]*)?\)/g)) {
        const resolved = path.resolve(path.dirname(file), target);
        if (!fs.existsSync(resolved)) {
          broken.push(`  ${path.relative(root, file)} -> ${target}`);
        }
      }
    }

    assert.deepEqual(broken, [], `a generated app shipped with dead links:\n${broken.join("\n")}`);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("the AGENTS.md in a generated app does not instruct it to install the template", () => {
  const root = generatedApp();
  try {
    const agents = fs.readFileSync(path.join(root, "SDD", "AGENTS.md"), "utf8");

    assert.doesNotMatch(
      agents,
      /Consume it with `npx create-sdd-ai-stack/,
      "SDD/AGENTS.md tells the generated app to install the template it already is",
    );
    assert.doesNotMatch(
      agents,
      /at the root of the `create-sdd-ai-stack` package/,
      "SDD/AGENTS.md describes where it lives in the package, not in this project",
    );

    // Provenance is worth keeping: an agent that knows where the laws came from
    // is less likely to "improve" them.
    assert.match(
      agents,
      /These rules came from/,
      "the provenance line was removed too; the rules should say where they come from",
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("this repository keeps its own documents, because there they are the real ones", () => {
  // The other direction, and the one that matters: a submodule install copies
  // nothing, and `installRules` on THIS repo must not blank its own history.
  for (const file of ["docs/CHANGELOG.md", "docs/RELEASE.md", "docs/EVIDENCE.md"]) {
    assert.ok(
      fs.existsSync(path.join(REPO_ROOT, file)),
      `${file} was deleted from the repository instead of from the copy`,
    );
  }

  const changelog = fs.readFileSync(path.join(REPO_ROOT, "docs", "CHANGELOG.md"), "utf8");
  assert.match(changelog, /## \[0\.3\.1\]/, "this repository's own changelog lost its entries");
});
