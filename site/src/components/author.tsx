import { Section } from "@/components/section";
import { SITE } from "@/content";

const IMPACT = [
  { value: "R$ 24M", unit: "/year", label: "protected revenue" },
  { value: "100M", unit: "msgs/day", label: "throughput at p99 under 10ms" },
  { value: "4h → 15min", unit: "deploy", label: "with rollback under 2 minutes" },
  { value: "21", unit: "years", label: "governance plus engineering" },
];

const TRACK = [
  {
    role: "Senior Software Engineer & Tech Lead",
    org: "DGT Tecnologia",
    period: "2026 — present",
    body: "Rescued a R$ 24M/year contract by taking license-plate recognition from under 60% to 100%. Multiplied throughput 10x on 100M messages/day moving MySQL to ClickHouse. Led 10 people and cut development time 40%.",
    stack: ["Go", "ClickHouse", "Kafka", "Kubernetes", "Playwright"],
  },
  {
    role: "Tech Lead & Strategic Consultant",
    org: "Antlia",
    period: "2024 — 2025",
    body: "Grew assets under management 45% in one year, settlement from D+1 batch to real time, uptime from 95% to 100%. Led 8 developers onto Java and Angular with hexagonal architecture and 95%+ coverage.",
    stack: ["Java", "Spring", "Kafka", "Angular", "K8s"],
  },
  {
    role: "Full Software Engineer & Tech Lead",
    org: "Banco Itaú",
    period: "2022",
    body: "Designed the asset-management platform operating over R$ 100 billion under custody, with B3 integration. Raised code quality 8x across three test layers on a 9-person team.",
    stack: [".NET Core", "Flutter", "Angular", "AWS", "Messaging"],
  },
];

export function Author() {
  return (
    <Section
      id="author"
      eyebrow="THE AUTHOR"
      title="Built by an engineer who measures in capital, scale and availability."
      lead="Fifteen years of corporate financial governance taught me to price compute cost and operational risk as balance-sheet liability. That is why this project is about gates and evidence, not about generating more code."
      tone="raised"
    >
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border-subtle bg-border-subtle lg:grid-cols-4">
        {IMPACT.map((item) => (
          <div key={item.label} className="bg-surface-base p-6">
            <dd className="text-metric-stat-mobile font-bold tracking-tight text-primary lg:text-metric-stat">
              {item.value}
              <span className="ml-2 text-body-sm font-medium text-text-muted">{item.unit}</span>
            </dd>
            <dt className="mt-2 text-body-sm text-text-secondary">{item.label}</dt>
          </div>
        ))}
      </dl>

      <div className="mt-10 flex flex-col gap-4">
        {TRACK.map((job) => (
          <article key={job.org} className="card p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-headline-sm text-text-primary">
                {job.role} · {job.org}
              </h3>
              <p className="font-mono text-body-sm text-text-muted">{job.period}</p>
            </div>
            <p className="mt-3 text-body-sm text-text-secondary">{job.body}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {job.stack.map((tech) => (
                <span key={tech} className="chip">
                  {tech}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <a
          href={SITE.resume}
          target="_blank"
          rel="noreferrer noopener"
          className="button button-primary"
        >
          Full resume
        </a>
        <a
          href={SITE.author.github}
          target="_blank"
          rel="noreferrer noopener"
          className="button button-quiet"
        >
          GitHub profile
        </a>
        <a href={`mailto:${SITE.author.email}`} className="button button-quiet">
          Email
        </a>
      </div>
    </Section>
  );
}
