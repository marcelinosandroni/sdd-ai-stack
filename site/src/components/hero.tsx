import { CodeBlock } from "@/components/code-block";
import { SITE } from "@/content";

const HERO_METRICS = [
  { value: "1", unit: "command", label: "to a gated Next.js 16 project" },
  { value: "25", unit: "rule files", label: "across 12 stacks, one spine" },
  { value: "8", unit: "agents", label: "wired on the first run" },
  { value: "0", unit: "deps", label: "the CLI itself" },
];

export function Hero() {
  return (
    <section id="top" className="hero-glow overflow-x-clip">
      <div className="container-page flex flex-col items-start gap-10 py-20 lg:py-28">
        <p className="label-mono inline-flex items-center gap-2">
          <span className="status-dot" />
          Open source · v0.2.0 · MIT
        </p>

        <h1 className="max-w-4xl text-display-hero-mobile font-extrabold tracking-tight text-balance lg:text-display-hero">
          Spec-Driven Development for AI agents.
        </h1>

        <p className="max-w-2xl text-body-lg text-text-secondary">
          An AI agent has one advantage over a human: it forgets everything between turns. This
          project turns your engineering rules into files the agent <em>cannot</em> skip, and
          gates it cannot talk its way past.
        </p>

        <div className="flex flex-wrap gap-3">
          <a href="#install" className="button button-primary">
            Install in one command
          </a>
          <a
            href={SITE.repo}
            target="_blank"
            rel="noreferrer noopener"
            className="button button-quiet"
          >
            Read the source
          </a>
        </div>

        <div className="mt-6 w-full max-w-2xl">
          <CodeBlock lines={["npx create-sdd-ai-stack my-app"]} />
        </div>

        <dl className="mt-10 grid w-full grid-cols-2 gap-px overflow-hidden rounded-lg border border-border-subtle bg-border-subtle lg:grid-cols-4">
          {HERO_METRICS.map((metric) => (
            <div key={metric.label} className="bg-surface-raised p-6">
              <dd className="text-metric-stat-mobile font-bold tracking-tight text-primary lg:text-metric-stat">
                {metric.value}
                <span className="ml-2 text-body-sm font-medium text-text-muted">
                  {metric.unit}
                </span>
              </dd>
              <dt className="mt-2 text-body-sm text-text-secondary">{metric.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
