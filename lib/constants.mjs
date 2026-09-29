import { fileURLToPath } from "node:url";
import path from "node:path";

export const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Documentos de regra que vão para <projeto>/SDD/ */
export const RULE_FILES = [
  "AGENTS.md",
  "APP.md",
  "APP-STACK.md",
  "ARCHITECTURE.md",
  "DESIGN.md",
  "NEXT.md",
  "NODE.md",
  "REACT.md",
  "README.md",
];

/** Pastas de regras que vão para <projeto>/SDD/ */
export const RULE_DIRS = ["stacks", "specs", "docs", "SKILLS"];

/** Nome da pasta onde as regras são instaladas dentro do projeto consumidor. */
export const SDD_DIR = "SDD";

/** Templates de projeto disponíveis. */
export const TEMPLATES = ["next"];

export const DEFAULT_TEMPLATE = "next";

/** Atalhos na raiz do projeto que apontam para ./SDD/AGENTS.md */
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
