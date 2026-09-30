import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import {
  COPY_IGNORE,
  PKG_ROOT,
  RULE_COPY_SKIP,
  RULE_DIRS,
  RULE_FILES,
  SDD_DIR,
  SHORTCUTS,
  TEMPLATE_IGNORE,
} from "./constants.mjs";

/* ────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────── */

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

export function copyDir(from, to, { ignore = new Set() } = {}) {
  ensureDir(to);
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (ignore.has(entry.name)) continue;
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) {
      copyDir(src, dest, { ignore });
    } else if (entry.isFile()) {
      ensureDir(path.dirname(dest));
      fs.copyFileSync(src, dest);
    }
  }
}

/** Cria symlink relativo. Retorna "symlink" ou null se o SO não permitir. */
function trySymlink(targetAbs, linkPath) {
  const rel = path.relative(path.dirname(linkPath), targetAbs).split(path.sep).join("/");
  try {
    fs.symlinkSync(rel, linkPath, "file");
    return "symlink";
  } catch {
    return null;
  }
}

const STUB_BODY = `# 🤖 AGENTS.md (pointer)

> This file is a **shortcut** to the project rules.
> The source of truth lives in **[SDD/AGENTS.md](./SDD/AGENTS.md)**.

## 🚨 READ THIS NOW

\`\`\`bash
cat SDD/AGENTS.md
\`\`\`

**Minimum reading to start any task:**

1. \`SDD/AGENTS.md\` — agent laws and delivery flow
2. \`SDD/specs/PLAN.md\` — the task being worked on RIGHT NOW
3. \`SDD/APP.md\` + \`SDD/APP-STACK.md\` — what this app is and which stack it uses
4. The stack rules: \`SDD/stacks/next.md\` (default), \`SDD/stacks/node.md\`, \`SDD/stacks/react.md\`
5. \`SDD/DESIGN.md\` — only when touching UI
6. \`SDD/stacks/README.md\` — the per-tool rules index
7. \`SDD/stacks/language.md\` — output language (English by default)

> **Do not edit the files in \`SDD/\`** without asking the human. They are the law of
> the template.
> To update: \`git submodule update --remote --merge SDD\` (submodule mode) or
> \`npm run sdd:sync\`.
`;

function writeShortcut(root, relPath, mode) {
  const linkPath = path.join(root, relPath);
  // the target must be ABSOLUTE — path.relative() requires it, otherwise the
  // second argument resolves against process.cwd() and the link is born broken
  const targetAbs = path.join(root, SDD_DIR, "AGENTS.md");
  ensureDir(path.dirname(linkPath));

  if (fs.existsSync(linkPath)) return "skipped";
  if (mode === "stub") return writeStub(linkPath);

  return trySymlink(targetAbs, linkPath) ?? writeStub(linkPath);
}

function writeStub(linkPath) {
  fs.writeFileSync(linkPath, STUB_BODY, "utf8");
  return "stub";
}

/**
 * `shell: true` is required on Windows (npm/git shims are `.cmd`), but it also
 * means Node joins the arguments with plain spaces and NEVER quotes them. An
 * argument containing a space — `user.name=Marcelino Sandroni` — is silently
 * split into two, and git reports "Sandroni is not a git command".
 *
 * So on Windows every argument is quoted before it reaches the shell.
 */
function quoteForShell(args) {
  if (process.platform !== "win32") return args;
  return args.map((arg) => `"${String(arg).replaceAll('"', '\\"')}"`);
}

function run(cmd, args, cwd) {
  const useShell = process.platform === "win32";
  execFileSync(cmd, useShell ? quoteForShell(args) : args, {
    cwd,
    stdio: "inherit",
    shell: useShell,
  });
}

function has(cmd) {
  try {
    execFileSync(cmd, ["--version"], {
      stdio: "ignore",
      shell: process.platform === "win32",
    });
    return true;
  } catch {
    return false;
  }
}

/* ────────────────────────────────────────────────────────────
   Installers
   ──────────────────────────────────────────────────────────── */

/** Copies the rule files into <target>/SDD/. */
export function installRules(target, { log = () => {} } = {}) {
  const dest = path.join(target, SDD_DIR);
  ensureDir(dest);

  for (const file of RULE_FILES) {
    const src = path.join(PKG_ROOT, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(dest, file));
      log(`  ✓ SDD/${file}`);
    }
  }

  for (const dir of RULE_DIRS) {
    const src = path.join(PKG_ROOT, dir);
    if (!fs.existsSync(src)) continue;
    // The union matters: COPY_IGNORE keeps the library itself out of SDD/,
    // RULE_COPY_SKIP keeps this repository's phase history out of a new app.
    copyDir(src, path.join(dest, dir), {
      ignore: new Set([...COPY_IGNORE, ...RULE_COPY_SKIP]),
    });
    log(`  ✓ SDD/${dir}/`);
  }

  ensureDir(path.join(dest, "specs", "history", "phases"));
  fs.writeFileSync(
    path.join(dest, "specs", "history", "README.md"),
    [
      "# Phase history",
      "",
      "> One file per closed phase: `phase-N-<name>.md`.",
      "> A brand-new project starts empty. This file is not a phase.",
      "> See `../PLAN.md` for the phase in flight.",
      "",
    ].join("\n"),
    "utf8",
  );

  // PLAN.md is the second place this repository's own state could leak. The
  // copied file names the phase this repo is on and links its own history; an
  // agent in a brand-new app would read that as "this project is already built".
  // RULE_COPY_SKIP handles the history folder; this handles the file that points
  // at it. A submodule keeps the real PLAN, because there it IS the real one.
  const plan = path.join(dest, "specs", "PLAN.md");
  if (fs.existsSync(plan)) {
    fs.writeFileSync(plan, FRESH_PLAN, "utf8");
    log("  ✓ SDD/specs/PLAN.md (reset for a new project)");
  }

  return dest;
}

/** The PLAN a brand-new project starts with. Never this repository's own. */
const FRESH_PLAN = `# 🎯 PLAN (the brain of the project)

> 🛑 **FIXED RULE (AI agent, READ THIS BEFORE YOU CODE):**
> The developer has ADHD, time blindness, and zero patience for junk.
> The tasks HERE must be **microscopic**.
> If a task takes more than 1 hour, **SPLIT IT IN TWO**.
> Never skip a step. Never start step 2 without testing and committing step 1.
> Update statuses rigorously at the end of every prompt: \`[ ]\` (To Do), \`[-]\` (In
> Progress), \`[x]\` (Done).

> **There is exactly ONE task \`[-]\` at any moment.** If there are two, the agent stopped
> wrong.

> **The first task is not a feature.** It is replacing the placeholders with the real
> product: \`APP.md\`, the \`DESIGN.md\` tokens, and the first vertical slice. A scaffold
> with \`[YOUR APP NAME]\` still in it is a placeholder with a build script.

---

## Current phase: 0 — Bootstrap

> Status: 🔲 not started. A brand-new project: the phase history is empty (see
> \`history/README.md\`).

### Tasks

- [ ] No tasks yet. Create the first one:
      \`node SDD/SKILLS/create-task/create-task.mjs 0 1 "<what you are building>"\`

### Phase exit criteria
- [ ] Every task \`[x]\` with the test evidence pasted
- [ ] \`npm run typecheck && npm run lint && npm run test && npm run build\` green
- [ ] \`npm run test:e2e\` green against the production build
- [ ] \`docs/CHANGELOG.md\` updated
- [ ] \`specs/history/phases/phase-0-<name>.md\` written
- [ ] SemVer tag created

### How to use this file

1. Create the phase block when the phase changes: \`## Current phase: N — NAME\`.
2. Tasks live under \`### Tasks\`, one per line, \`[ ]\` / \`[-]\` / \`[x]\`.
3. Mark \`[-]\` **before** starting. Mark \`[x]\` **after** you paste the green output.
4. When the phase closes, archive it in \`history/phases/\`, delete the finished task
   files, and tag the release.

---

## 📋 Delivery checklist (paste at the end of every task)

\`\`\`markdown
**Evidence:**
- \`npm run typecheck\` → exit 0
- \`npm run lint\` → 0 errors
- \`npm run test\` → N passed
- \`npm run build\` → ✓ Compiled successfully
- \`npm run test:e2e\` → N passed

**Files touched:** (list them — max 5 per step)
**Commit:** \`type(scope): description. (Agent: <Tool> - <Model>)\`
\`\`\`

Full gate and what each command proves: [\`PREFLIGHT.md\`](../PREFLIGHT.md).
`;

/**
 * Instala a pasta SDD/ como git submodule apontando para o repo remoto.
 *
 * `git submodule add` exige um repositório JÁ inicializado. O scaffold roda
 * esta função antes do passo de `git init`, então sem este `init` o comando
 * falha com "fatal: not a git repository".
 */
export function installSubmodule(target, url, { log = () => {} } = {}) {
  const dest = path.join(target, SDD_DIR);
  if (!has("git")) {
    log("  ! git not found. Copying the rules locally.");
    return installRules(target, { log });
  }
  ensureDir(target);
  if (!fs.existsSync(path.join(target, ".git"))) {
    log("  → initialising a git repository (required by `git submodule add`)");
    run("git", ["init"], target);
  }
  run("git", ["submodule", "add", url, SDD_DIR], target);
  installShortcuts(target, { log });
  return dest;
}

/** Creates the root shortcuts pointing at ./SDD/AGENTS.md */
export function installShortcuts(target, { log = () => {}, mode = "auto" } = {}) {
  const results = SHORTCUTS.map((rel) => ({ rel, kind: writeShortcut(target, rel, mode) }));
  for (const { rel, kind } of results) {
    log(`  ✓ ${rel} (${kind})`);
  }
  return results;
}

/** Copies the project template (Next.js) into the target. */
export function installTemplate(target, template, { log = () => {} } = {}) {
  const src = path.join(PKG_ROOT, "template", template);
  if (!fs.existsSync(src)) {
    throw new Error(`Template "${template}" not found at ${src}`);
  }
  copyDir(src, target, { ignore: TEMPLATE_IGNORE });
  restoreGitignore(target);
  log(`  ✓ template/${template} → ${target}`);
  return target;
}

/**
 * The npm packer NEVER includes a file literally named `.gitignore` — it is one
 * of its own default ignores. Storing it as `gitignore` and renaming it here
 * guarantees the generated app ALWAYS has a .gitignore. Without one,
 * `.env.local` and `.next` end up in the user's git.
 */
export function restoreGitignore(target) {
  const from = path.join(target, "gitignore");
  const to = path.join(target, ".gitignore");
  if (fs.existsSync(from)) {
    fs.renameSync(from, to);
    return;
  }
  if (fs.existsSync(to)) return;
  throw new Error("Template has no gitignore — the generated app would ship without a .gitignore.");
}

/* ────────────────────────────────────────────────────────────
   Orquestração
   ──────────────────────────────────────────────────────────── */

/**
 * Creates a complete project: template + rules + shortcuts.
 * @returns {object} a summary of what was done
 */
export function scaffold(options) {
  const {
    target,
    template = "next",
    install = false,
    git = false,
    submodule = null,
    shortcutMode = "auto",
    log = console.log,
  } = options;

  const abs = path.resolve(target);
  const summary = { target: abs, template, rules: false, shortcuts: [], git: false, install: false };

  if (fs.existsSync(abs) && fs.readdirSync(abs).length > 0) {
    throw new Error(`Folder "${abs}" already exists and is not empty. Choose another name.`);
  }
  ensureDir(abs);

  // 1. Template do app (primeiro, para não colidir com SDD/)
  if (template && template !== "none") {
    log(`\n📦 Template: ${template}`);
    installTemplate(abs, template, { log });
  }

  // 2. Regras
  log("\n🧠 SDD rules:");
  if (submodule) {
    log(`  → installing as a submodule: ${submodule}`);
    installSubmodule(abs, submodule, { log });
  } else {
    installRules(abs, { log });
    installShortcuts(abs, { log, mode: shortcutMode });
  }
  summary.rules = true;

  // 3. Git
  if (git) {
    if (has("git")) {
      log("\n🌿 Git:");
      run("git", ["init"], abs);
      run("git", ["add", "-A"], abs);
      // The author's OWN identity. Committing as somebody else puts a name the
      // user never chose on their first commit, permanently. If git has no
      // identity we say so and leave the staging intact — the user decides.
      try {
        run(
          "git",
          ["commit", "-m", `chore: initial scaffold with SDD AI Stack. (Agent: create-sdd-ai-stack)`],
          abs,
        );
        summary.git = true;
      } catch {
        log("\n  ! Git has no identity configured, so nothing was committed.");
        log("    Everything is staged. Set your identity and finish it:");
        log("      git config user.name  \"Your Name\"");
        log("      git config user.email you@example.com");
        log("      git commit -m \"chore: initial scaffold\"");
        summary.git = false;
      }
    } else {
      log("\n! git not found. Skipping init.");
    }
  }

  // 4. Dependências
  if (install) {
    if (fs.existsSync(path.join(abs, "package.json"))) {
      log("\n📥 Installing dependencies…");
      run("npm", ["install"], abs);
      summary.install = true;
    } else {
      log("\n! No package.json — skipping install.");
    }
  }

  return summary;
}
