import { fileURLToPath } from "node:url";
import path from "node:path";

export const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Documents that get copied into <project>/SDD/ — the stack files live in stacks/ */
export const RULE_FILES = [
  "AGENTS.md",
  "APP.md",
  "APP-STACK.md",
  "ARCHITECTURE.md",
  "DESIGN.md",
  "PREFLIGHT.md",
  // README.md is handled separately. The repository root README is 400 lines of
  // how to publish *this template* — `npx create-sdd-ai-stack`, Trusted
  // Publishing, the OIDC setup, the essential-file list, the owner's npm
  // username. Copied into SDD/ it became the index a new project's agent reads
  // first, telling it to release someone else's package. A generated app gets a
  // README written for it instead; see FRESH_SDD_README in lib/scaffold.mjs.
];

/** Rule folders that land in <project>/SDD/ */
export const RULE_DIRS = ["stacks", "specs", "docs", "SKILLS"];

/**
 * The twelve language and framework stacks.
 *
 * This is the same grouping the tree in `AGENTS.md` draws, written down so it can be
 * counted instead of remembered. The site used to publish "25 rule files across 12
 * stacks" with the 12 typed into a component, which meant the number could only be
 * checked by going to the repository and doing the classification yourself.
 *
 * It is a list rather than a heuristic on purpose. "Is this document about a language or
 * a framework?" is a judgement, and a script that guesses will be wrong in whichever
 * direction nobody reviewed. An explicit list is checkable: `tests/stack-counts.test.mjs`
 * asserts it is exactly the set of files in `stacks/`, so a new document cannot be added
 * without being classified, and a rename cannot happen without breaking a test.
 *
 * `typescript`, `tailwind` and `shadcn` are deliberately absent. They are not stacks —
 * the first is a language that the others assume, the other two are libraries a project
 * may or may not use. Counting them would inflate the number by claiming support for
 * stacks that are really conventions.
 */
export const STACK_DOCS = [
  "angular",
  "dotnet",
  "go",
  "java",
  "javascript",
  "next",
  "node",
  "node-frameworks",
  "python",
  "react",
  "svelte",
  "vue",
];

/**
 * The stacks/ documents that are not stacks.
 *
 * Two of these are structural rather than topical: `README.md` is the index the router
 * reads, and `clean-code.md` is the spine every other file points at. The rest are
 * cross-cutting — they apply whatever the language, and a project using three stacks
 * reads them once, not three times.
 *
 * This list exists so that `STACK_DOCS` plus this list plus the two structural files
 * equals `stacks/` exactly. A document added to `stacks/` and not classified fails the
 * guard, which is the only thing that keeps "12" true as the repository grows.
 */
export const CROSSCUTTING_DOCS = [
  "agent-tooling",
  "ai",
  "architecture",
  "ci",
  "database",
  "git",
  "language",
  "shadcn",
  "tailwind",
  "testing",
  "typescript",
];

/** `stacks/` documents that are structure, not subject. Counted separately, never as stacks. */
export const STACK_DIR_STRUCTURE = ["README", "clean-code"];

/**
 * Sub-paths NOT copied into a generated app.
 *
 * `specs/history/` is this repository's own phase history. Shipping it means
 * the agent of the new project reads "phase 0 bootstrap, done" and concludes
 * the app already exists. A brand-new app starts at phase 0 with an empty
 * history; `installSubmodule` still gets the real one, because a submodule
 * always points at the real repository.
 */
export const RULE_COPY_SKIP = new Set(["history"]);

/**
 * Documents inside `docs/` that belong to THIS repository, not to a consuming
 * app.
 *
 * `CHANGELOG.md`, `RELEASE.md` and `EVIDENCE.md` describe publishing *this
 * template* — its versions, its registries, its coverage gate. Copied into a
 * consumer's `SDD/`, they carried 41 references to `marcelinosandroni` and
 * `create-sdd-ai-stack`, and an agent reading `SDD/docs/RELEASE.md` would find
 * seven phases worth of someone else's release history.
 *
 * `PRODUCT.md`, `PLANNING.md`, `RELEASE-notes-for-you` stay: they describe what
 * the template delivers and how to work, which is exactly what a consumer needs.
 *
 * A submodule keeps all of them, because there they ARE the real ones.
 */
export const RULE_DOC_COPY_SKIP = new Set(["CHANGELOG.md", "RELEASE.md", "EVIDENCE.md"]);

/**
 * Skills that exist to build the template, not to work inside an app.
 *
 * `dogfood` imports `lib/scaffold.mjs` — the CLI's own library, which is
 * deliberately not copied into SDD/ (`COPY_IGNORE` keeps it out). Copied, the
 * skill dies on import in every generated app.
 *
 * `check-rules`, `check-coverage` and `check-facts` verify *this repository*:
 * the rules it ships, its own coverage floor, its own documented numbers. A
 * consuming app has none of those — and every one of them crashed with ENOENT
 * when it tried. `check-docs` stays: it works on any markdown tree, which is
 * what a generated app has.
 *
 * They are not lost to the consumer. `AGENTS.md` tells an agent to run
 * `check-docs`; the other three are this template's own gates and run in CI.
 */
export const RULE_SKILL_COPY_SKIP = new Set([
  "dogfood",
  "check-rules",
  "check-coverage",
  "check-facts",
]);

/** Name of the folder where the rules are installed inside the consuming project. */
export const SDD_DIR = "SDD";

/**
 * The canonical theme, in this package.
 *
 * `themes/<name>/tokens.css` is the single source of truth for the design tokens.
 * Every template carries a byte-identical copy, because Turbopack refuses an
 * `@import` that leaves the project root — so the portable half of the design
 * system is a file a second stack can copy verbatim instead of reinventing.
 */
export const THEME_DIR = "themes";

/** The theme this package ships. */
export const DEFAULT_THEME = "matrix";

/** Where each template keeps its copy of the theme, relative to the app root. */
export const TEMPLATE_THEME_DESTINATIONS = ["src/app/theme.css"];

/**
 * The design system's code assets, and where each template keeps its copy.
 *
 * `tokens.css` is values; this is a component. They are separate on purpose — a
 * stylesheet every app inherits whether it uses it or not is a stylesheet nobody
 * edits.
 *
 * The copy exists for the same reason `theme.css` is copied: templates are standalone
 * apps and cannot import from the package. So the canonical files live here, the
 * scaffold copies them, and `tests/theme.test.mjs` asserts the copies are
 * byte-identical. Editing a copy instead of the source is the one mistake this
 * arrangement invites, and it is the one thing it must never allow.
 */
export const THEME_ASSETS = ["matrix-terminal.css", "matrix-terminal.strings.ts", "matrix-terminal.tsx"];

/** Where each template keeps those copies, relative to the app root. */
export const TEMPLATE_THEME_ASSET_DESTINATION = "src/shared/ui/terminal";

/**
 * Available project templates.
 *
 * The list is the single source of truth: the CLI validates `--template` against it,
 * so adding a name here is all it takes for `--template <name>` to become legal.
 * Nothing else enumerates templates, and that is the point — a second hardcoded list
 * is a second thing to forget.
 */
export const TEMPLATES = ["next", "spa"];

export const DEFAULT_TEMPLATE = "next";

/** Root shortcuts that point at ./SDD/AGENTS.md */
export const SHORTCUTS = [
  "AGENTS.md",
  "CLAUDE.md",
  "GEMINI.md",
  ".cursorrules",
  ".windsurfrules",
  ".github/copilot-instructions.md",
  ".clinerules",
];

/** Repository used when the user asks to install as a submodule. */
export const DEFAULT_SUBMODULE_URL = "https://github.com/marcelinosandroni/sdd-ai-stack.git";

/**
 * Skipped when copying the TEMPLATE into the generated app.
 *
 * `node_modules` and `.next` are here because somebody will run `npm install`
 * inside `template/next/` while developing this repository. Without this set, the
 * generated app is born carrying the developer's node_modules.
 */
export const TEMPLATE_IGNORE = new Set([
  ".git",
  "node_modules",
  ".next",
  // Vite's equivalents. A build artefact shipped into a generated app is the same
  // defect as a Next `.next` shipped into one: dead weight, and a stale copy that
  // makes a bug look fixed.
  ".vite",
  "dist",
  "coverage",
  "test-results",
  "playwright-report",
  "blob-report",
  "package-lock.json",
  "tsconfig.tsbuildinfo",
]);

/** Skipped when copying the rules (keeps this repository's own lib out of SDD/). */
export const COPY_IGNORE = new Set([
  ".git",
  ".github",
  "node_modules",
  ".next",
  "bin",
  "src",
  "lib",
  "tests",
  "template",
  "package.json",
  "package-lock.json",
  "coverage",
  "test-results",
  "playwright-report",
]);

