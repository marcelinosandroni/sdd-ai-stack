import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import {
  CROSSCUTTING_DOCS,
  STACK_DIR_STRUCTURE,
  STACK_DOCS,
} from "../lib/constants.mjs";

const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const STACKS_DIR = path.join(REPO_ROOT, "stacks");
const CONTENT = path.join(REPO_ROOT, "site", "src", "content.ts");

/**
 * "Across 12 stacks" is a claim, and it used to be a typed string.
 *
 * It was `12` written into a component, which means the only way to check it was to
 * open `stacks/`, decide which of the 25 documents are stacks, and see whether you
 * agreed. A published number nobody can reproduce is not a number, it is a vibe.
 *
 * So the classification is written down in `lib/constants.mjs` and these tests hold it
 * to the folder. The important one is the third: every file in `stacks/` must be
 * classified, which is what stops the count from rotting as the repository grows.
 */

/** What is actually in `stacks/`, as bare names without the extension. */
const onDisk = fs
  .readdirSync(STACKS_DIR)
  .filter((file) => file.endsWith(".md"))
  .map((file) => path.basename(file, ".md"))
  .sort();

test("the classification covers every file in stacks/, exactly once", () => {
  const classified = [...STACK_DOCS, ...CROSSCUTTING_DOCS, ...STACK_DIR_STRUCTURE].sort();

  assert.deepEqual(
    classified,
    onDisk,
    "the documents in stacks/ and the classification in lib/constants.mjs disagree.\n\n" +
      "A file was added or renamed and nobody decided what it is. Add it to STACK_DOCS " +
      "(a language or framework) or to CROSSCUTTING_DOCS (applies to all of them), and " +
      "run `npm run site:sync` — a rule file that is not a stack still has to be a " +
      "rule file, and this is where that decision gets recorded.",
  );
});

test("no document is both a stack and cross-cutting", () => {
  const overlap = STACK_DOCS.filter((name) => CROSSCUTTING_DOCS.includes(name));

  assert.deepEqual(
    overlap,
    [],
    `listed as both a stack and cross-cutting: ${overlap.join(", ")}. It would count ` +
      "twice and read as two rules that are one.",
  );
});

test("the spine and the index are structure, not stacks", () => {
  // `clean-code.md` is what every other file points at and `README.md` is the router an
  // agent reads first. Neither describes a language, and counting either would make the
  // number larger than the thing it claims to count.
  for (const name of STACK_DIR_STRUCTURE) {
    assert.ok(
      !STACK_DOCS.includes(name),
      `${name} is in STACK_DIR_STRUCTURE and in STACK_DOCS`,
    );
  }

  assert.ok(STACK_DIR_STRUCTURE.includes("clean-code"), "the spine must be structural");
  assert.ok(STACK_DIR_STRUCTURE.includes("README"), "the index must be structural");
});

test("the counts add up to the folder", () => {
  assert.equal(
    STACK_DOCS.length + CROSSCUTTING_DOCS.length + STACK_DIR_STRUCTURE.length,
    onDisk.length,
    `${STACK_DOCS.length} stacks + ${CROSSCUTTING_DOCS.length} cross-cutting + ` +
      `${STACK_DIR_STRUCTURE.length} structural should equal the ${onDisk.length} files in stacks/`,
  );
});

test("the site states the counted number, not a typed one", () => {
  const declared = /^export const STACK_COUNT = (\d+);$/m.exec(
    fs.readFileSync(CONTENT, "utf8"),
  )?.[1];

  assert.ok(
    declared,
    'site/src/content.ts has no `export const STACK_COUNT = …;` line. The sync script ' +
      "and this test both parse that exact shape.",
  );
  assert.equal(
    Number(declared),
    STACK_DOCS.length,
    `site/src/content.ts says ${declared} stacks and STACK_DOCS lists ${STACK_DOCS.length}. ` +
      "Run `npm run site:sync`.",
  );
});

test("the hero reads the count instead of typing it", () => {
  const hero = fs.readFileSync(path.join(REPO_ROOT, "site", "src", "components", "hero.tsx"), "utf8");

  // The regression this exists for: the number was correct, and correct for years,
  // because nobody had a reason to touch it. A guard on the value would have passed
  // forever. The guard has to be on the *mechanism*.
  assert.match(
    hero,
    /STACK_COUNT/,
    "hero.tsx does not use STACK_COUNT, so the count it shows cannot come from the list.",
  );
  assert.doesNotMatch(
    hero,
    /across \d+ stacks/,
    "hero.tsx types the stack count into a string. That is the bug: it cannot go stale " +
      "visibly, it just quietly stops being true.",
  );
});

test("STACK_DOCS is exactly what the router says is a stack", () => {
  // The authority is `stacks/README.md`, not this repository. The router is the file an
  // agent reads first and a visitor reads first, and it already draws the line: the
  // Backend and Frontend tables are headed "Stack", while Cross-cutting and Tooling are
  // headed "What".
  //
  // That is why the answer is 12 and not 13. `typescript.md` is a language, and it sits
  // under Tooling on purpose — the repo decided it is a tool you may use rather than a
  // platform you build on, so counting it would claim a stack the rules do not offer.
  // `tailwind` and `shadcn` are the same shape of decision, and `react` is counted even
  // though it is a library, because the repo groups it with the frontends.
  //
  // Asserted against the router so the published number and the document a reader opens
  // cannot disagree — the same failure as the version, one level down.
  const router = fs.readFileSync(path.join(STACKS_DIR, "README.md"), "utf8");

  const stacksInRouter = [...router.matchAll(/^\| \[([\w-]+)\.md\]\(\.\/[\w-]+\.md\)/gm)]
    .map((match) => match[1])
    .filter((name) => name !== "clean-code")
    .filter((name) => {
      // Tooling is headed "What", not "Stack". The two sections are separated by the
      // heading that introduces them, so each link is attributed to the section it sits
      // under rather than to the whole document.
      const heading = router.lastIndexOf("### ", router.indexOf(`[${name}.md]`));
      return router.slice(heading, router.indexOf(`[${name}.md]`)).includes("Backend") ||
        router.slice(heading, router.indexOf(`[${name}.md]`)).includes("Frontend");
    });

  assert.deepEqual(
    [...STACK_DOCS].sort(),
    stacksInRouter.sort(),
    "STACK_DOCS does not match the Backend and Frontend tables in stacks/README.md.\n\n" +
      "The router is what a reader opens first and what an agent reads first. If the " +
      "published count and the router disagree, one of them is wrong and nobody can tell " +
      "which. Change the router and STACK_DOCS together, or run `npm run site:sync`.",
  );
});

test("every stack in the list is a file that exists", () => {
  // The partition test covers the other direction. This one is here so that renaming a
  // stack doc says so plainly, instead of reporting a set difference three tests later.
  for (const name of STACK_DOCS) {
    assert.ok(
      fs.existsSync(path.join(STACKS_DIR, `${name}.md`)),
      `STACK_DOCS lists "${name}" and there is no stacks/${name}.md`,
    );
  }
});