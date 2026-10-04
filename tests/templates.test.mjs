import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { TEMPLATES } from "../lib/constants.mjs";
import { scaffold } from "../lib/scaffold.mjs";

const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * `--template` accepted a list of one, and nothing said so.
 *
 * The CLI validated against `TEMPLATES`, `SKILLS/dogfood` hardcoded `next` in its
 * generate call and its per-template expectations, and CI had a single job that
 * generated `next`. Three places knew the answer and only one of them was allowed to
 * change. The second template is what made the seam visible: `create-feature` was
 * emitting a Next Server Action into a Vite app, and nothing in the pipeline could
 * have said so.
 *
 * These tests keep the three in agreement.
 */

test("there is more than one template, and every name is a real directory", () => {
  // "A list of one" is not a bug on day one — it is the shape of a feature that was
  // scoped to one provider. It becomes a bug the moment the CLI advertises the flag.
  assert.ok(
    TEMPLATES.length >= 2,
    `TEMPLATES is ${JSON.stringify(TEMPLATES)}. Either there is one template, or the ` +
      `CLI should not offer --template as if there were a choice.`,
  );

  for (const template of TEMPLATES) {
    assert.match(template, /^[a-z][a-z0-9-]*$/, `"${template}" is not a usable directory name`);
    assert.ok(
      fs.existsSync(path.join(REPO_ROOT, "template", template)),
      `TEMPLATES names "${template}" and template/${template} does not exist.`,
    );
  }
});

test("every template can be generated, and lands the files a project needs", () => {
  for (const template of TEMPLATES) {
    const target = fs.mkdtempSync(path.join(os.tmpdir(), `sdd-tpl-${template}-`));
    try {
      scaffold({ target, template, install: false, git: false, log: () => {} });

      for (const rel of [
        "package.json",
        "src/app/theme.css",
        "src/app/globals.css",
        "tests/unit",
        "SDD/AGENTS.md",
        "SDD/PREFLIGHT.md",
      ]) {
        assert.ok(
          fs.existsSync(path.join(target, rel)),
          `template/${template} generated no ${rel}. Every template must produce the ` +
            `same shape, or the rules have no shared surface to describe.`,
        );
      }

      // `.gitignore`, and NOT `gitignore`. npm pack drops a literal `.gitignore`, so
      // the template stores it under another name and the scaffold renames it.
      // Asserting only that one of the two exists is how the rename silently stops
      // happening and a generated app ends up shipping `.env.local` to git.
      assert.ok(
        fs.existsSync(path.join(target, ".gitignore")),
        `template/${template} generated no .gitignore, so the app's secrets are one ` +
          `commit away from being published.`,
      );
      assert.ok(
        !fs.existsSync(path.join(target, "gitignore")),
        `template/${template} still has an unrenamed "gitignore" — restoreGitignore() ` +
          `did not run, so this app has no .gitignore.`,
      );

      // The gates PREFLIGHT.md names must exist as scripts, or the document is
      // instructing the agent to run commands this app does not have.
      const pkg = JSON.parse(fs.readFileSync(path.join(target, "package.json"), "utf8"));
      for (const gate of ["typecheck", "lint", "test", "build"]) {
        assert.ok(
          pkg.scripts?.[gate],
          `template/${template} defines no "${gate}" script, so PREFLIGHT.md names a ` +
            `command the generated app cannot run.`,
        );
      }
    } finally {
      fs.rmSync(target, { recursive: true, force: true });
    }
  }
});

test("every template is named in the README", () => {
  // The same drift the SKILLS table had: a template nobody can find is a template
  // nobody uses, and no fact checker sees an omission.
  const readme = fs.readFileSync(path.join(REPO_ROOT, "README.md"), "utf8");
  const missing = TEMPLATES.filter((t) => !readme.includes(`\`${t}\``));

  assert.deepEqual(
    missing,
    [],
    `the README never mentions: ${missing.join(", ")}. --template is a flag nobody can ` +
      `use without documentation.`,
  );
});

test("every template ships in the published package", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "package.json"), "utf8"));
  const files = pkg.files ?? [];

  for (const template of TEMPLATES) {
    assert.ok(
      files.some((glob) => glob === `template/${template}` || glob.startsWith(`template/${template}/`)),
      `package.json "files" does not include template/${template}. It would exist in the ` +
        `repository and not in the tarball — the same claim as before, with better formatting.`,
    );
  }
});

test("dogfood walks every template, and reads that list from TEMPLATES", () => {
  // The hardcoded `next` is the specific failure: dogfood reported a clean cycle for
  // a template nobody asked about, while the second template rotted in silence.
  const dogfood = fs.readFileSync(
    path.join(REPO_ROOT, "SKILLS", "dogfood", "dogfood.mjs"),
    "utf8",
  );

  assert.match(
    dogfood,
    /import\s*\{[^}]*TEMPLATES[^}]*\}\s*from\s*"\.\.\/\.\.\/lib\/constants\.mjs"/,
    "dogfood does not import TEMPLATES. It must read the list, not repeat it.",
  );

  for (const template of TEMPLATES) {
    assert.doesNotMatch(
      dogfood,
      new RegExp(`template:\\s*"${template}"`),
      `dogfood hardcodes template: "${template}". That is the exact line that made it a ` +
        `test of one template wearing the name of a test of all templates.`,
    );
  }
});

test("create-feature detects the app's stack instead of assuming Next", () => {
  // The skill emitted `import "server-only"`, `next/cache`, and
  // `@/shared/server/auth` unconditionally. In any non-Next template that is a slice
  // which cannot typecheck — and dogfood's typecheck check was the only thing that
  // would ever have said so.
  const skill = fs.readFileSync(
    path.join(REPO_ROOT, "SKILLS", "create-feature", "create-feature.mjs"),
    "utf8",
  );

  assert.match(
    skill,
    /function\s+detectStack/,
    "create-feature has no stack detection. It assumes Next, which is the bug the second " +
      "template exposed.",
  );

  // The Next-specific imports must be behind the flag, not merely mentioned nearby.
  assert.match(
    skill,
    /CACHE_IMPORTS\s*=\s*IS_NEXT\s*\?/,
    "the next/cache import is not conditional on the detected stack",
  );
  assert.match(
    skill,
    /AUTH_IMPORT\s*=\s*IS_NEXT\s*\?/,
    "the @/shared/server/auth import is not conditional on the detected stack",
  );
});

test("create-feature emits a slice that typechecks in a non-Next app", () => {
  // The real proof: run the skill in a generated SPA and assert the output has no
  // Next imports. A generated-app check, because the bug only ever existed there.
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-slice-"));
  try {
    scaffold({ target, template: "spa", install: false, git: false, log: () => {} });

    const skill = path.join(target, "SDD", "SKILLS", "create-feature", "create-feature.mjs");
    assert.ok(fs.existsSync(skill), "create-feature did not ship in the generated app");

    execFileSync(process.execPath, [skill, "dogfood-slice", "Dogfood slice"], {
      cwd: target,
      stdio: "pipe",
    });

    const sliceDir = path.join(target, "src", "features", "dogfood-slice");
    for (const rel of ["actions.ts", "queries.ts", "container.ts"]) {
      const body = fs.readFileSync(path.join(sliceDir, rel), "utf8");
      assert.doesNotMatch(
        body,
        /from ["']next\//,
        `${rel} imports Next in a Vite app. The skill must detect the stack.`,
      );
      assert.doesNotMatch(
        body,
        /from ["']@\/shared\/server\//,
        `${rel} imports the Next server auth module, which this template does not have.`,
      );
      assert.doesNotMatch(
        body,
        /import ["']server-only["']/,
        `${rel} imports server-only, a Next package this template does not depend on.`,
      );
    }

    // And the Next path must keep its Server Action, or the detection is one-sided.
    const nextTarget = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-slice-next-"));
    try {
      scaffold({ target: nextTarget, template: "next", install: false, git: false, log: () => {} });
      const nextSkill = path.join(
        nextTarget,
        "SDD",
        "SKILLS",
        "create-feature",
        "create-feature.mjs",
      );
      execFileSync(process.execPath, [nextSkill, "dogfood-slice", "Dogfood slice"], {
        cwd: nextTarget,
        stdio: "pipe",
      });
      const actions = fs.readFileSync(
        path.join(nextTarget, "src", "features", "dogfood-slice", "actions.ts"),
        "utf8",
      );
      assert.match(actions, /"use server"/, "the Next template must still get a Server Action");
      assert.match(actions, /next\/cache/, "the Next template must still get cache invalidation");
    } finally {
      fs.rmSync(nextTarget, { recursive: true, force: true });
    }
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
});