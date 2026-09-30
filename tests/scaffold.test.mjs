import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import {
  scaffold,
  installRules,
  installShortcuts,
  installTemplate,
  restoreGitignore,
} from "../lib/scaffold.mjs";
import { parseArgs } from "../src/cli.mjs";
import { DEFAULT_SUBMODULE_URL } from "../lib/constants.mjs";

const silent = () => {};

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "sdd-test-"));
}

/* ── parseArgs ───────────────────────────────────────────── */

test("parseArgs: lê nome e defaults", () => {
  const o = parseArgs(["meu-app"]);
  assert.equal(o.name, "meu-app");
  assert.equal(o.template, "next");
  assert.equal(o.install, false);
  assert.equal(o.git, false);
  assert.equal(o.submodule, null);
});

test("parseArgs: --rules-only desliga o template", () => {
  const o = parseArgs(["app", "--rules-only"]);
  assert.equal(o.template, "none");
});

test("parseArgs: --submodule sem url usa a oficial", () => {
  const o = parseArgs(["app", "--submodule"]);
  assert.equal(o.submodule, DEFAULT_SUBMODULE_URL);
});

test("parseArgs: --submodule com url usa a informada", () => {
  const o = parseArgs(["app", "--submodule", "https://exemplo.com/x.git"]);
  assert.equal(o.submodule, "https://exemplo.com/x.git");
});

test("parseArgs: rejects an invalid template", () => {
  assert.throws(() => parseArgs(["app", "--template", "angular"]), /Invalid template/);
});

test("parseArgs: rejects an unknown option", () => {
  assert.throws(() => parseArgs(["app", "--nao-existe"]), /Unknown option/);
});

test("parseArgs: rejects an invalid --shortcuts", () => {
  assert.throws(() => parseArgs(["app", "--shortcuts", "hardlink"]), /--shortcuts invalid/);
});

/* ── installRules ────────────────────────────────────────── */

test("scaffold: the generated app ships the files the rules depend on", () => {
  const parent = tmp();
  const target = path.join(parent, "app-files");
  scaffold({ target, template: "next", log: silent, shortcutMode: "stub" });

  // Each of these is referenced by a rule doc or by the E2E suite. Shipping the
  // template without one silently breaks the promise the docs make.
  for (const rel of [
    "src/proxy.ts",                          // next.md §8: renamed to proxy.ts
    "components.json",                       // shadcn.md: npx shadcn add
    "src/shared/ui/button.tsx",              // the real shadcn component
    "src/shared/ui/skeleton.tsx",            // used by loading.tsx
    "src/app/(app)/app/loading.tsx",         // next.md: loading state
    "src/app/(app)/app/example-board.tsx",   // the Suspense boundary
    "tests/e2e/example-flow.spec.ts",        // the auth + validation flow
    "tests/e2e/proxy.spec.ts",               // the security headers
    "playwright.config.ts",                  // the build-vs-dev switch
  ]) {
    assert.ok(fs.existsSync(path.join(target, rel)), `the generated app is missing ${rel}`);
  }
});

test("scaffold: the app ships the gates PREFLIGHT.md tells the agent to run", () => {
  const parent = tmp();
  const target = path.join(parent, "app-gates");
  scaffold({ target, template: "next", log: silent, shortcutMode: "stub" });

  // PREFLIGHT.md is a Tier 1 document: the agent reads it before writing code,
  // so every script it names must exist in the generated app.
  const preflight = path.join(target, "SDD", "PREFLIGHT.md");
  assert.ok(fs.existsSync(preflight), "the app has no PREFLIGHT.md");

  const scripts = JSON.parse(fs.readFileSync(path.join(target, "package.json"), "utf8")).scripts;

  // Everything ABOVE the "this template repository" section belongs to the app.
  // Everything below it belongs to the CLI repo and is labelled as such.
  const text = fs.readFileSync(preflight, "utf8");
  const cut = text.indexOf("## 🧠 In this template repository");
  assert.ok(cut > -1, "PREFLIGHT.md lost its section separating the app gate from the CLI gate");
  const forTheApp = text.slice(0, cut);

  const named = new Set([...forTheApp.matchAll(/npm run ([\w:-]+)/g)].map((m) => m[1]));
  assert.ok(named.size >= 5, "PREFLIGHT.md stopped naming the app's gates");
  for (const script of named) {
    assert.ok(
      scripts[script],
      `PREFLIGHT.md tells the agent to run "npm run ${script}" but it does not exist`,
    );
  }
});

test("scaffold: the template copies no build artefacts", () => {
  const parent = tmp();
  const target = path.join(parent, "app-clean");
  scaffold({ target, template: "next", log: silent, shortcutMode: "stub" });

  for (const junk of ["node_modules", ".next", "coverage", "test-results", "playwright-report"]) {
    assert.ok(!fs.existsSync(path.join(target, junk)), `the generated app shipped ${junk}`);
  }
  // A lockfile in the template would pin the consumer to a resolution made
  // elsewhere. See docs/RELEASE.md §5.1.
  assert.ok(!fs.existsSync(path.join(target, "package-lock.json")));
});

test("installRules: creates SDD/ with every document", () => {
  const root = tmp();
  installRules(root, { log: silent });
  const sdd = path.join(root, "SDD");

  for (const f of [
    "AGENTS.md", "APP.md", "APP-STACK.md", "ARCHITECTURE.md",
    "DESIGN.md", "README.md",
  ]) {
    assert.ok(fs.existsSync(path.join(sdd, f)), `missing SDD/${f}`);
  }

  for (const d of ["stacks", "specs", "docs", "SKILLS"]) {
    assert.ok(fs.statSync(path.join(sdd, d)).isDirectory(), `missing SDD/${d}/`);
  }

  assert.ok(fs.existsSync(path.join(sdd, "stacks", "README.md")));
  assert.ok(fs.existsSync(path.join(sdd, "stacks", "typescript.md")));
  assert.ok(fs.existsSync(path.join(sdd, "stacks", "next.md")));
  assert.ok(fs.existsSync(path.join(sdd, "stacks", "node.md")));
  assert.ok(fs.existsSync(path.join(sdd, "stacks", "react.md")));
  assert.ok(fs.existsSync(path.join(sdd, "specs", "PLAN.md")));

  // the stack files must not linger at the SDD root
  for (const moved of ["NEXT.md", "NODE.md", "REACT.md"]) {
    assert.ok(
      !fs.existsSync(path.join(sdd, moved)),
      `SDD/${moved} should have moved into stacks/`,
    );
  }
});

test("installRules: does NOT embed the library itself (bin/src/lib/template)", () => {
  const root = tmp();
  installRules(root, { log: silent });
  const sdd = path.join(root, "SDD");

  for (const leaked of ["bin", "src", "lib", "tests", "template", "node_modules"]) {
    assert.ok(!fs.existsSync(path.join(sdd, leaked)), `SDD/ should not contain ${leaked}`);
  }
});

test("installRules: the installed AGENTS.md points at SDD/, not the root", () => {
  const root = tmp();
  installRules(root, { log: silent });
  const text = fs.readFileSync(path.join(root, "SDD", "AGENTS.md"), "utf8");
  assert.match(text, /SDD\/AGENTS\.md/);
  assert.match(text, /Next\.js 16/);
});

/* ── installShortcuts ────────────────────────────────────── */

test("installShortcuts: stub mode creates every shortcut with the pointer", () => {
  const root = tmp();
  installRules(root, { log: silent });
  installShortcuts(root, { log: silent, mode: "stub" });

  for (const rel of [
    "AGENTS.md", "CLAUDE.md", "GEMINI.md", ".cursorrules",
    ".windsurfrules", path.join(".github", "copilot-instructions.md"), ".clinerules",
  ]) {
    const p = path.join(root, rel);
    assert.ok(fs.existsSync(p), `missing shortcut ${rel}`);
    const text = fs.readFileSync(p, "utf8");
    assert.match(text, /SDD\/AGENTS\.md/, `shortcut ${rel} does not point at SDD/AGENTS.md`);
  }
});

test("installShortcuts: symlink mode creates a shortcut that resolves to the right content", () => {
  const root = tmp();
  installRules(root, { log: silent });
  const results = installShortcuts(root, { log: silent, mode: "symlink" });
  // compare against the real file instead of a literal: the rules get translated and
  // a hard-coded heading would break the suite for the wrong reason (it did, once)
  const rules = fs.readFileSync(path.join(root, "SDD", "AGENTS.md"), "utf8");

  for (const rel of ["AGENTS.md", "CLAUDE.md"]) {
    const p = path.join(root, rel);
    assert.ok(fs.existsSync(p), `shortcut ${rel} was not created (neither symlink nor stub)`);

    const text = fs.readFileSync(p, "utf8");
    const kind = results.find((r) => r.rel === rel).kind;

    // Guard for the relative-path bug: if it became a symlink it MUST read the rules.
    // existsSync() follows symlinks, so a broken link would not even get here.
    if (kind === "symlink") {
      assert.equal(
        text,
        rules,
        `symlink ${rel} does not resolve to SDD/AGENTS.md — wrong relative path?`,
      );
    } else {
      // fallback (Windows without dev mode): a stub with an explicit pointer
      assert.match(text, /SDD\/AGENTS\.md/, `stub ${rel} does not point at SDD/AGENTS.md`);
    }
  }
});

test("installShortcuts: does not overwrite an existing file", () => {
  const root = tmp();
  fs.writeFileSync(path.join(root, "AGENTS.md"), "meu conteudo", "utf8");
  const res = installShortcuts(root, { log: silent, mode: "stub" });
  const found = res.find((r) => r.rel === "AGENTS.md");
  assert.equal(found.kind, "skipped");
  assert.equal(fs.readFileSync(path.join(root, "AGENTS.md"), "utf8"), "meu conteudo");
});

/* ── scaffold ────────────────────────────────────────────── */

test("scaffold: creates a complete app (template + SDD + shortcuts)", () => {
  const parent = tmp();
  const target = path.join(parent, "meu-app");
  const s = scaffold({ target, template: "next", log: silent, shortcutMode: "stub" });

  assert.ok(s.rules);
  assert.ok(fs.existsSync(path.join(target, "package.json")));
  assert.ok(fs.existsSync(path.join(target, "next.config.ts")));
  assert.ok(fs.existsSync(path.join(target, "src", "app", "layout.tsx")));
  assert.ok(fs.existsSync(path.join(target, "src", "app", "globals.css")));
  assert.ok(fs.existsSync(path.join(target, "src", "proxy.ts")));
  assert.ok(fs.existsSync(path.join(target, "src", "features", "example")));
  assert.ok(fs.existsSync(path.join(target, "src", "app", "(marketing)", "page.tsx")));
  assert.ok(fs.existsSync(path.join(target, "src", "app", "(app)", "app", "page.tsx")));
  assert.ok(fs.existsSync(path.join(target, "tests", "e2e", "routes.spec.ts")));
  assert.ok(fs.existsSync(path.join(target, "tests", "unit", "create-example.test.ts")));
  assert.ok(!fs.existsSync(path.join(target, "src", "app", "page.tsx")));
  assert.ok(fs.existsSync(path.join(target, "SDD", "AGENTS.md")));
  assert.ok(fs.existsSync(path.join(target, "AGENTS.md")));
  assert.ok(fs.existsSync(path.join(target, "README.md")));
});

test("scaffold: the next template declares cacheComponents and reactCompiler", () => {
  const parent = tmp();
  const target = path.join(parent, "app-cfg");
  scaffold({ target, template: "next", log: silent, shortcutMode: "stub" });
  const cfg = fs.readFileSync(path.join(target, "next.config.ts"), "utf8");
  assert.match(cfg, /cacheComponents:\s*true/);
  assert.match(cfg, /reactCompiler:\s*true/);
});

test("scaffold: the template ships without node_modules or .next", () => {
  const parent = tmp();
  const target = path.join(parent, "app-limpo");
  scaffold({ target, template: "next", log: silent, shortcutMode: "stub" });
  assert.ok(!fs.existsSync(path.join(target, "node_modules")));
  assert.ok(!fs.existsSync(path.join(target, ".next")));
});

test("scaffold: --rules-only does not create src/", () => {
  const parent = tmp();
  const target = path.join(parent, "so-regras");
  scaffold({ target, template: "none", log: silent, shortcutMode: "stub" });
  assert.ok(!fs.existsSync(path.join(target, "src")));
  assert.ok(fs.existsSync(path.join(target, "SDD", "AGENTS.md")));
});

test("scaffold: the generated app HAS a .gitignore (npm never packs that file)", () => {
  const parent = tmp();
  const target = path.join(parent, "app-gitignore");
  scaffold({ target, template: "next", log: silent, shortcutMode: "stub" });

  const gi = path.join(target, ".gitignore");
  assert.ok(fs.existsSync(gi), "the generated app shipped without a .gitignore");
  const text = fs.readFileSync(gi, "utf8");
  for (const required of ["node_modules/", ".next/", ".env.local"]) {
    assert.ok(text.includes(required), `.gitignore does not protect ${required}`);
  }
  assert.ok(!fs.existsSync(path.join(target, "gitignore")), "the dotless gitignore must not linger");
});

test("scaffold: refuses a non-empty folder", () => {
  const target = tmp();
  fs.writeFileSync(path.join(target, "existe.txt"), "x", "utf8");
  assert.throws(() => scaffold({ target, log: silent }), /already exists and is not empty/);
});

test("installTemplate: a missing template fails loudly instead of writing half an app", () => {
  const target = tmp();
  assert.throws(
    () => installTemplate(target, "angular", { log: silent }),
    /Template "angular" not found/,
  );
});

test("installTemplate: a template without gitignore fails instead of shipping secrets", () => {
  // The npm packer renames .gitignore to gitignore, and restoreGitignore puts
  // it back. If that file is ever missing, the app would ship WITHOUT a
  // .gitignore — and .env.local and .next would go into the user's git.
  const target = tmp();
  assert.throws(() => restoreGitignore(target), /no gitignore/);
});

test("scaffold --install: skips npm when the template has no package.json", () => {
  const parent = tmp();
  const target = path.join(parent, "so-regras");
  const s = scaffold({ target, template: "none", install: true, log: silent, shortcutMode: "stub" });

  // There is nothing to install, so the flag is recorded as NOT done. Running
  // npm install in a rules-only folder would be a pointless network call.
  assert.equal(s.install, false);
  assert.ok(fs.existsSync(path.join(target, "SDD", "AGENTS.md")));
});

test("scaffold: the summary reports what actually happened", () => {
  const parent = tmp();
  const target = path.join(parent, "app");
  const s = scaffold({ target, template: "next", log: silent, shortcutMode: "stub" });

  assert.equal(s.rules, true);
  assert.equal(s.git, false, "git was not requested");
  assert.equal(s.install, false, "install was not requested");
  assert.equal(s.template, "next");
  assert.equal(s.target, path.resolve(target));
  // installShortcuts reports the outcome per file; scaffold does not echo it
  // into the summary, so assert the files themselves exist instead.
  assert.ok(fs.existsSync(path.join(target, "AGENTS.md")));
  assert.ok(fs.existsSync(path.join(target, "CLAUDE.md")));
});
