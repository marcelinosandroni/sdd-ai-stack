import { DEFAULT_SUBMODULE_URL, DEFAULT_TEMPLATE, TEMPLATES } from "../lib/constants.mjs";

export const HELP = `
create-sdd-ai-stack — a project ready for AI agents (Spec-Driven Development)

USAGE
  npx create-sdd-ai-stack <project-name> [options]

EXAMPLES
  npx create-sdd-ai-stack my-dashboard
  npx create-sdd-ai-stack my-dashboard --no-install
  npx create-sdd-ai-stack my-dashboard --submodule
  npx create-sdd-ai-stack my-dashboard --rules-only

OPTIONS
  --template <${TEMPLATES.join("|")}|none>   Project template (default: ${DEFAULT_TEMPLATE})
  --rules-only            Install only the rules (no app), into ./SDD
  --submodule [url]       Install ./SDD as a git submodule (default: the official repo)
  --no-install            Do not run npm install
  --install               Run npm install (default: does not run)
  --git / --no-git        git init + first commit (default: does not run)
  --shortcuts <auto|stub|symlink>
                          How to create the root shortcuts (default: auto)
  -y, --yes               No confirmation prompt
  -h, --help              This help
  -v, --version           Version

WHAT GETS CREATED
  <app>/
  ├── src/ …            Next.js 16 template (App Router, Tailwind v4, Biome, Vitest)
  ├── SDD/              the rules: AGENTS.md, stacks/next.md, DESIGN.md, stacks/, specs/…
  ├── AGENTS.md         shortcut → ./SDD/AGENTS.md
  ├── CLAUDE.md, GEMINI.md, .cursorrules, .github/copilot-instructions.md …
  └── package.json

DOCS
  https://github.com/marcelinosandroni/sdd-ai-stack
`;

export function parseArgs(argv) {
  const opts = {
    name: null,
    template: DEFAULT_TEMPLATE,
    install: false,
    git: false,
    submodule: null,
    rulesOnly: false,
    shortcutMode: "auto",
    help: false,
    version: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = () => argv[++i];

    switch (arg) {
      case "-h":
      case "--help":
        opts.help = true;
        break;
      case "-v":
      case "--version":
        opts.version = true;
        break;
      case "-y":
      case "--yes":
        break;
      case "--rules-only":
        opts.rulesOnly = true;
        opts.template = "none";
        break;
      case "--install":
        opts.install = true;
        break;
      case "--no-install":
        opts.install = false;
        break;
      case "--git":
        opts.git = true;
        break;
      case "--no-git":
        opts.git = false;
        break;
      case "--submodule": {
        const value = argv[i + 1];
        if (value && !value.startsWith("-")) {
          opts.submodule = value;
          i++;
        } else {
          opts.submodule = DEFAULT_SUBMODULE_URL;
        }
        break;
      }
      case "--template": {
        const value = next();
        if (!value) throw new Error("--template requires a value");
        if (value !== "none" && !TEMPLATES.includes(value)) {
          throw new Error(`Invalid template: "${value}". Use: ${TEMPLATES.join(", ")} or none.`);
        }
        opts.template = value;
        break;
      }
      case "--shortcuts": {
        const value = next();
        if (!["auto", "stub", "symlink"].includes(value)) {
          throw new Error(`--shortcuts invalid: "${value}". Use: auto, stub, symlink.`);
        }
        opts.shortcutMode = value;
        break;
      }
      default:
        if (arg.startsWith("-")) throw new Error(`Unknown option: ${arg}`);
        if (!opts.name) opts.name = arg;
    }
  }

  return opts;
}
