import { CodeBlock } from "@/components/code-block";
import { Section } from "@/components/section";
import { SITE } from "@/content";

const OPTIONS = [
  { flag: "--rules-only", body: "Install only the rules, into an existing project. No app." },
  {
    flag: "--submodule [url]",
    body: "Install ./SDD as a git submodule, so `git submodule update` syncs the rules.",
  },
  { flag: "--git", body: "git init plus the first commit, using your own git identity." },
  {
    flag: "--shortcuts <mode>",
    body: "auto (symlink with stub fallback), stub, or symlink. AGENTS.md, CLAUDE.md, .cursorrules, .windsurfrules, copilot-instructions.md, .clinerules, GEMINI.md.",
  },
  { flag: "--install", body: "Run npm install for you. Off by default." },
  { flag: "--template <name>", body: "next (default) or none." },
];

const TREE = `my-app/
├── src/                 Next.js 16 App Router + Tailwind v4 + Biome
│   ├── app/             routing only — no business logic
│   ├── features/example the live vertical slice, wired and tested
│   ├── shared/          ui (shadcn) · lib · server (auth, env)
│   └── proxy.ts         the network boundary
├── tests/               unit · integration · e2e
├── SDD/                 the rules — the product
│   ├── AGENTS.md        agent laws + delivery flow
│   ├── specs/           PLAN.md, tasks, history
│   ├── stacks/          25 rule files, one spine
│   └── SKILLS/          scripts that check the rules
└── AGENTS.md            shortcut → ./SDD/AGENTS.md`;

export function Install() {
  return (
    <Section
      id="install"
      eyebrow="INSTALL"
      title="One command. No configuration, no account, no telemetry."
      lead="The CLI has zero runtime dependencies. It copies files, creates a directory, and gets out of the way."
    >
      {/*
        `min-w-0` on the children is not decoration. A grid item defaults to
        `min-width: auto`, which resolves to its min-content width, and a
        command with no spaces to break at is 594px wide. The track then refuses
        to shrink below that and pushes the whole document sideways — and
        `overflow-x-auto` on the code block cannot save it, because the track
        never lets the box get small enough to scroll. DESIGN.md §4b.6.
      */}
      <div className="grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
        <div className="min-w-0">
          <p className="label-mono">{"// Create a project"}</p>
          <div className="mt-4">
            <CodeBlock
              lines={[
                "# the whole thing",
                "npx create-sdd-ai-stack my-app",
                "",
                "# skip the install, it is slow",
                "npx create-sdd-ai-stack my-app --no-install",
                "",
                "# rules only, into a project you already have",
                "npx create-sdd-ai-stack . --rules-only",
              ]}
            />
          </div>

          <p className="label-mono mt-8">{"// What lands"}</p>
          <div className="mt-4">
            <CodeBlock lines={TREE.split("\n")} />
          </div>
        </div>

        <div className="min-w-0">
          <p className="label-mono">{"// Options"}</p>
          <div className="mt-4 flex flex-col gap-3">
            {OPTIONS.map((option) => (
              <div key={option.flag} className="card p-5">
                <p className="font-mono text-body-sm text-primary">{option.flag}</p>
                <p className="mt-2 text-body-sm text-text-secondary">{option.body}</p>
              </div>
            ))}
          </div>

          <div className="card mt-6 p-6">
            <p className="label-mono">{"// First run of the generated app"}</p>
            <div className="mt-4">
              <CodeBlock
                lines={[
                  "cd my-app",
                  "npm install",
                  "npx playwright install chromium firefox",
                  "npm run dev",
                  "",
                  "# the gate, before you believe yourself",
                  "npm run typecheck && npm run lint \\",
                  "  && npm run test && npm run build",
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={SITE.npm}
          target="_blank"
          rel="noreferrer noopener"
          className="button button-quiet"
        >
          {SITE.package} on npm
        </a>
        <a
          href={SITE.repo}
          target="_blank"
          rel="noreferrer noopener"
          className="button button-quiet"
        >
          Source on GitHub
        </a>
      </div>
    </Section>
  );
}
