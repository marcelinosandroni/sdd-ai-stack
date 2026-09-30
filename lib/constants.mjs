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
  "README.md",
];

/** Rule folders that land in <project>/SDD/ */
export const RULE_DIRS = ["stacks", "specs", "docs", "SKILLS"];

/** Name of the folder where the rules are installed inside the consuming project. */
export const SDD_DIR = "SDD";

/** Available project templates. */
export const TEMPLATES = ["next"];

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

/** Repositório usado quando o usuário pede para instalar como submodule. */
export const DEFAULT_SUBMODULE_URL = "https://github.com/marcelinosandroni/sdd-ai-stack.git";

/**
 * Ignorado ao copiar o TEMPLATE para o app gerado.
 *
 * `node_modules` e `.next` entram aqui porque alguém vai rodar `npm install`
 * dentro de `template/next/` enquanto desenvolve este repositório. Sem este
 * conjunto, o app gerado nasce com o node_modules do desenvolvedor dentro.
 */
export const TEMPLATE_IGNORE = new Set([
  ".git",
  "node_modules",
  ".next",
  "coverage",
  "test-results",
  "playwright-report",
  "package-lock.json",
  "tsconfig.tsbuildinfo",
]);

/** Ignorado ao copiar regras (evita embutir a própria lib no SDD/). */
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
