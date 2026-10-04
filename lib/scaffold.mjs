import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import {
  COPY_IGNORE,
  PKG_ROOT,
  RULE_COPY_SKIP,
  RULE_DIRS,
  RULE_DOC_COPY_SKIP,
  RULE_FILES,
  RULE_SKILL_COPY_SKIP,
  SDD_DIR,
  SHORTCUTS,
  TEMPLATE_IGNORE,
  TEMPLATE_THEME_DESTINATIONS,
  THEME_DIR,
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

/** Creates a relative symlink. Returns "symlink", or null if the OS refuses. */
function trySymlink(targetAbs, linkPath) {
  const rel = path.relative(path.dirname(linkPath), targetAbs).split(path.sep).join("/");
  try {
    fs.symlinkSync(rel, linkPath, "file");
    return "symlink";
  } catch {
    return null;
  }
}

/**
 * The body of a shortcut. Parameterised by tool because the file an agent opens
 * must say who opens it.
 *
 * Every shortcut used to be titled "AGENTS.md (pointer)" — including `CLAUDE.md`,
 * `GEMINI.md` and `.clinerules`. An agent that opened `CLAUDE.md` saw a heading
 * naming a different file and had to work out why it was reading the rules of
 * another tool. It costs one line to say who reads this, and the line is the
 * difference between "why is this here" and "right".
 *
 * @param tool  who reads this file, in the reader's vocabulary
 * @param note  a tool-specific caveat worth stating once, or null
 */
function stubBody(tool, note) {
  return `# 🤖 ${tool}

> **Read [\`SDD/AGENTS.md\`](./SDD/AGENTS.md) before you touch this project.**
> It is the only copy of the rules. This file exists because you are looking for
> ${tool} instructions, not because the rules live here.

## 🚨 FIRST ACTION

\`\`\`bash
cat SDD/AGENTS.md
\`\`\`

Then follow it. It tells you what **not** to read, which matters more than what to
read.

**Minimum reading for any task:**

1. \`SDD/AGENTS.md\` — agent laws and delivery flow
2. \`SDD/specs/PLAN.md\` — the single task in flight RIGHT NOW
3. \`SDD/APP.md\` + \`SDD/APP-STACK.md\` — what this app is and which stack it uses
4. \`SDD/stacks/README.md\` — the router, then only the one file that applies
${note ? `\n${note}\n` : ""}
> **Do not edit \`SDD/\`** without asking. They are the law. To update:
> \`git submodule update --remote --merge SDD\` (submodule mode) or
> \`npm run sdd:sync\`.
`;
}

/**
 * Per-shortcut wording. A caveat only appears where it is true for that tool.
 *
 * `.cursorrules` gets a warning because it is the one that does not work:
 * Cursor loads it in Chat mode and ignores it in **Agent mode**, which is the
 * mode an SDD workflow depends on. The project ships a stub there, and a stub
 * that teaches nothing has to say so.
 */
const SHORTCUT_NOTES = {
  ".cursorrules":
    "> ⚠️ **Cursor does not load this file in Agent mode** — `.cursorrules` is the\n" +
    "> legacy format. This pointer only helps in Chat mode. For Agent mode, point\n" +
    "> a `.cursor/rules/*.mdc` at `SDD/AGENTS.md`, or rely on the root\n" +
    "> `AGENTS.md`, which Cursor reads natively.",
  "CLAUDE.md":
    "> Claude Code reads this file natively and does **not** read `AGENTS.md` by\n" +
    "> itself. This pointer is the bridge — keep it, and keep it short.",
  ".github/copilot-instructions.md":
    "> Copilot reads this file natively, and also reads the root `AGENTS.md`. Both\n" +
    "> point at the same `SDD/AGENTS.md`, so there is nothing to keep in sync.",
};

function shortcutStub(relPath) {
  const tool = TOOL_NAMES[relPath] ?? relPath;
  return stubBody(tool, SHORTCUT_NOTES[relPath] ?? null);
}

/** Who reads each shortcut. Used for the title of the file that names it. */
const TOOL_NAMES = {
  "AGENTS.md": "Claude Code, Cursor, Copilot, Codex, OpenCode — agent instructions",
  "CLAUDE.md": "Claude Code",
  "GEMINI.md": "Gemini CLI",
  ".cursorrules": "Cursor (Chat mode only)",
  ".windsurfrules": "Windsurf",
  ".github/copilot-instructions.md": "GitHub Copilot",
  ".clinerules": "Cline",
};

function writeShortcut(root, relPath, mode) {
  const linkPath = path.join(root, relPath);
  // the target must be ABSOLUTE — path.relative() requires it, otherwise the
  // second argument resolves against process.cwd() and the link is born broken
  const targetAbs = path.join(root, SDD_DIR, "AGENTS.md");
  ensureDir(path.dirname(linkPath));

  if (fs.existsSync(linkPath)) return "skipped";
  if (mode === "stub") return writeStub(linkPath, relPath);

  return trySymlink(targetAbs, linkPath) ?? writeStub(linkPath, relPath);
}

function writeStub(linkPath, relPath) {
  fs.writeFileSync(linkPath, shortcutStub(relPath ?? path.basename(linkPath)), "utf8");
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
    // RULE_COPY_SKIP keeps this repository's phase history out of a new app,
    // and RULE_DOC_COPY_SKIP keeps this repository's CHANGELOG, RELEASE notes
    // and EVIDENCE report out of a consumer's SDD/docs/. All three describe
    // publishing *this* template, and a consumer has no use for them.
    //
    // RULE_SKILL_COPY_SKIP does the same for skills that build the template
    // rather than working in an app — dogfood imports lib/scaffold.mjs, which is
    // not copied on purpose.
    const perDir =
      dir === "docs" ? RULE_DOC_COPY_SKIP : dir === "SKILLS" ? RULE_SKILL_COPY_SKIP : [];
    const skip = new Set([...COPY_IGNORE, ...RULE_COPY_SKIP, ...perDir]);
    copyDir(src, path.join(dest, dir), { ignore: skip });
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

  // ROADMAP.md is the third place, and the quietest. Its "Closed" table links
  // this repository's six phases, and `history/` is skipped — so a new app
  // received six dead links pointing at a project that is not theirs. A broken
  // link in the file that plans the work is worse than a missing file: an agent
  // checking the rules finds one and stops trusting the rest.
  const roadmap = path.join(dest, "specs", "ROADMAP.md");
  if (fs.existsSync(roadmap)) {
    fs.writeFileSync(roadmap, FRESH_ROADMAP, "utf8");
    log("  ✓ SDD/specs/ROADMAP.md (reset for a new project)");
  }

  // SDD/README.md is the index an agent opens first. This repository's own is
  // 400 lines about publishing `create-sdd-ai-stack`: the CLI, Trusted
  // Publishing, the OIDC dashboard, the essential-file list, the owner's npm
  // username. A new app read "how to publish the template" as its own docs.
  //
  // Written, not rewritten: the root README is deliberately not in RULE_FILES,
  // so there is nothing to overwrite. The consumer's SDD/ always gets an index,
  // and it is always one written for their project.
  const sddReadme = path.join(dest, "README.md");
  fs.writeFileSync(sddReadme, FRESH_SDD_README, "utf8");
  log("  ✓ SDD/README.md (written for a new project)");

  stripTemplateSelfReference(path.join(dest, "AGENTS.md"), log);

  return dest;
}

/**
 * Rewrites the AGENTS.md sections that describe the *template* rather than the
 * process, so they do not read as instructions about the consumer's project.
 *
 * Two blocks, both honest in this repository and misleading in a generated app:
 *
 *   "This repository is the template (`create-sdd-ai-stack`). Consume it with
 *    `npx create-sdd-ai-stack my-app`…"
 *
 * An agent in the generated app would read that as a task: install the template
 * it already is. And the `Details:` link pointed at `README.md`, which now holds
 * the generated index — the wrong document entirely.
 *
 * Replaced rather than deleted. The lines carry the provenance of the rules, and
 * an agent that knows where the laws came from is less likely to "improve" them.
 */
function stripTemplateSelfReference(agentsPath, log) {
  if (!fs.existsSync(agentsPath)) return;

  const text = fs.readFileSync(agentsPath, "utf8");
  const replaced = text
    .replace(
      /^- This repository is the \*\*template\*\* \(`create-sdd-ai-stack`\)\.[\s\S]*?- Details: \[`README\.md`\]\(\.\/README\.md\)\.\n/m,
      [
        "- These rules came from the `create-sdd-ai-stack` template. They are yours",
        "  to change — a rule you outgrew is a rule you should edit, not delete.",
        "- Provenance and what the template deliberately does not ship:",
        "  [`docs/PRODUCT.md`](./docs/PRODUCT.md).",
        "",
      ].join("\n"),
    )
    .replace(
      /^> 📦 \*\*Where this file lives:\*\* at the root of the `create-sdd-ai-stack` package\.\n> Installed into a project it becomes \*\*`SDD\/AGENTS\.md`\*\*, and every path below is\n> relative to `SDD\/`\. That is why every link uses the `SDD\/` prefix\.\n/m,
      [
        "> 📦 **Where this file lives:** in `SDD/`, next to the `PLAN.md` it commands.",
        "> Every path below is relative to `SDD/`.",
        "",
      ].join("\n"),
    );

  if (replaced !== text) {
    fs.writeFileSync(agentsPath, replaced, "utf8");
    log("  ✓ SDD/AGENTS.md (template provenance rewritten)");
  }
}

/**
 * The SDD/ index a brand-new project starts with.
 *
 * Small on purpose. It answers one question — where do I look right now — and
 * points at the files that answer it. Everything else belongs in the files it
 * names, not in an index that duplicates them and goes stale.
 */
const FRESH_SDD_README = `# 🧠 SDD — the rules

> Spec-Driven Development. The specification is the nervous system; you only need
> to know **where to look right now**.

## Start here

| Read | When |
| --- | --- |
| [\`AGENTS.md\`](./AGENTS.md) | Always, before coding. The laws and the delivery flow. |
| [\`specs/PLAN.md\`](./specs/PLAN.md) | To find the one task in flight. |
| [\`PREFLIGHT.md\`](./PREFLIGHT.md) | Before committing. The gates and what each one proves. |
| [\`APP.md\`](./APP.md) | To remember what this project is. |
| [\`APP-STACK.md\`](./APP-STACK.md) | To know which stack file applies. |

## The rule map

Every document opens with a router, so you never read one that does not apply.

| Folder | Scope |
| --- | --- |
| [\`stacks/\`](./stacks) | One file per stack — language, framework, tooling. Start at [\`stacks/README.md\`](./stacks/README.md). |
| [\`specs/\`](./specs) | The PLAN, the task in flight, and one file per closed phase. |
| [\`SKILLS/\`](./SKILLS) | Automations. If a pattern repeats, it becomes a skill. |
| [\`docs/\`](./docs) | [What this template delivers](./docs/PRODUCT.md) and [how to plan](./docs/PLANNING.md). |

## The one rule that matters most

**Read the minimum.** An agent that reads forty files to answer one question is an
agent that starts guessing at file thirty. If a document does not tell you when to
open it, that document is the problem.

> This index is generated on every \`create-sdd-ai-stack\`. It never mentions the
> template's own repository, its releases, or its npm package — those are not
> your project's history.
`;

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
 * The ROADMAP a brand-new project starts with. Never this repository's own.
 *
 * Kept deliberately shorter than the template's. The template's roadmap is a
 * record of six phases that happened here, and every one of those links dangles
 * in a new app because `history/` is not copied. A roadmap for a project with no
 * closed phases is an empty table and one line of rule — that is the honest
 * version, and it is what makes the first entry mean something.
 */
const FRESH_ROADMAP = `# 🗺️ ROADMAP

> The macro view. **Don't work from this** — use [\`PLAN.md\`](./PLAN.md) for the task
> at hand.

## ✅ Closed

| Phase | Name | What it changed |
| --- | --- | --- |
| _(none yet)_ | | |

## 🧭 Planned

_(nothing yet — a phase appears here when something is broken or missing, and the
entry names the problem rather than the solution.)_

---

## 🧭 How this roadmap talks to the PLAN

\`\`\`text
ROADMAP.md   →  macro, the phases and their problems     (vision)
    ↓
PLAN.md      →  this week                 (one task at a time)
    ↓
tasks/       →  this task, in detail      (micro-steps)
    ↓
commit       →  this task, one step       (evidence)
\`\`\`

> Rule: **no task enters the PLAN without existing in the ROADMAP** (even as a single
> line).
`;

/**
 * Installs the SDD/ folder as a git submodule pointing at the remote repository.
 *
 * `git submodule add` requires an ALREADY initialized repository. This scaffold
 * runs the function before the `git init` step, so without that `init` the command
 * fails with "fatal: not a git repository".
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
  installTheme(target);
  log(`  ✓ template/${template} → ${target}`);
  return target;
}

/**
 * Writes the canonical theme over the template's copy of it.
 *
 * The tokens live in ONE place in this package — `themes/matrix/tokens.css` —
 * and every template carries a byte-identical copy, because Turbopack refuses an
 * `@import` that leaves the project root. Two copies of one design is exactly the
 * arrangement that rots, so this step makes the generated app provably carry the
 * canonical file rather than whatever the template happened to ship.
 *
 * It is not a fallback for a diverging copy: `tests/theme.test.mjs` fails the build
 * when the two differ. This only guarantees the fresh app starts from the source.
 */
export function installTheme(target) {
  const canonical = path.join(PKG_ROOT, THEME_DIR, "tokens.css");
  if (!fs.existsSync(canonical)) return null;

  const destinations = TEMPLATE_THEME_DESTINATIONS.map((rel) => path.join(target, rel));
  const existing = destinations.find((dest) => fs.existsSync(path.dirname(dest)));
  if (!existing) return null;

  fs.writeFileSync(existing, fs.readFileSync(canonical, "utf8"), "utf8");
  return path.relative(target, existing).split(path.sep).join("/");
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

  // 1. The app template first, so it cannot collide with SDD/
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
