import { Section } from "@/components/section";

const AGENTS = [
  "Cursor",
  "Claude Code",
  "GitHub Copilot",
  "Windsurf",
  "Cline",
  "Gemini CLI",
  "OpenAI Codex",
  "Roo Code",
];

const TOOLS = [
  {
    name: "Caveman",
    body: "Token compression and spend observability for your own agent runs. Same compression law as the rule files: prose may be compressed, evidence may not.",
    href: "https://github.com/anomalyco/opencode",
  },
  {
    name: "Playwright",
    body: "The E2E layer. Tests run against the production build on two engines, which is why a passing suite means the build works.",
    href: "https://playwright.dev",
  },
  {
    name: "Biome",
    body: "Lint and format in one binary, fast enough to run on every save. `next lint` was removed in Next 16; run your linter directly.",
    href: "https://biomejs.dev",
  },
  {
    name: "shadcn/ui",
    body: "Components copied into your repo, so you own the code. `components.json` ships pre-configured, so the first `npx shadcn add` does not ask for a layout.",
    href: "https://ui.shadcn.com",
  },
  {
    name: "Zod",
    body: "One schema, both sides. The client check is a courtesy; the server is the only source of truth.",
    href: "https://zod.dev",
  },
];

const STACKS = [
  "Next.js 16",
  "React 19",
  "TypeScript",
  "Tailwind v4",
  "Node.js",
  "Express",
  "Fastify",
  "Nest",
  "Angular",
  "Vue",
  "Svelte",
  "Java 21 + Spring",
  "Quarkus",
  ".NET 10",
  "Go",
  "Python",
  "Django",
  "FastAPI",
  "PostgreSQL",
  "Prisma",
  "Kafka",
  "Docker",
  "Kubernetes",
  "Vercel",
];

export function Toolkit() {
  return (
    <Section
      id="toolkit"
      eyebrow="INDICATIONS"
      title="Wired agents, recommended tooling, and the stacks with rules."
      lead="The shortcuts point at one file. Whichever agent you use, it reads the same laws."
    >
      <p className="label-mono">{"// Agents, wired on the first run"}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {AGENTS.map((agent) => (
          <span key={agent} className="chip chip-active">
            {agent}
          </span>
        ))}
      </div>

      <p className="label-mono mt-12">{"// Recommended"}</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => (
          <a
            key={tool.name}
            href={tool.href}
            target="_blank"
            rel="noreferrer noopener"
            className="card card-interactive p-6"
          >
            <h3 className="text-headline-sm text-text-primary">{tool.name}</h3>
            <p className="mt-2 text-body-sm text-text-secondary">{tool.body}</p>
          </a>
        ))}
      </div>

      <p className="label-mono mt-12">{"// Stacks with a rule file"}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {STACKS.map((stack) => (
          <span key={stack} className="chip">
            {stack}
          </span>
        ))}
      </div>
    </Section>
  );
}
