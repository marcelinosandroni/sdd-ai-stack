import { Section } from "@/components/section";

const CLAIMS = [
  {
    metric: "16.5k",
    unit: "tokens",
    title: "Context is a budget",
    body: "The mandatory read order costs ~16.5k tokens before the first line of code. That is why every doc opens with a router, and why the spine is compressed. An agent that reads 40 files to answer one question hallucinates by file 30.",
  },
  {
    metric: "4",
    unit: "CI gates",
    title: "Rules that cannot be bypassed",
    body: "Branch protection on main, a coverage floor at 95/85/90, npm audit at high severity, and a job that fails if an action is pinned to a deprecated runtime. A green build is not the same as a correct change.",
  },
  {
    metric: "0",
    unit: "dead code",
    title: "The template obeys its own rules",
    body: "The first audit found the reference feature imported by nothing. It is now wired, behind real auth, with E2E proving the auth rejection writes no row. A template that violates its own conventions teaches the wrong lesson.",
  },
  {
    metric: "98.5",
    unit: "% line coverage",
    title: "Measured, not asserted",
    body: "Coverage is a gate with a floor in the file, not a number in someone's memory. Lowering it requires a written reason next to the change.",
  },
];

export function Why() {
  return (
    <Section
      id="why"
      eyebrow="WHY IT WORKS"
      title="Four properties that decide whether an agent produces good code."
      lead="Not opinions. Each one is a property of the repository that either holds or does not, and most of them can be checked by a script."
      tone="raised"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {CLAIMS.map((claim) => (
          <div key={claim.title} className="card card-interactive p-6">
            <p className="text-metric-stat-mobile font-bold tracking-tight text-primary lg:text-metric-stat">
              {claim.metric}
              <span className="ml-2 text-body-sm font-medium text-text-muted">
                {claim.unit}
              </span>
            </p>
            <h3 className="mt-4 text-headline-sm text-text-primary">{claim.title}</h3>
            <p className="mt-2 text-body-sm text-text-secondary">{claim.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
