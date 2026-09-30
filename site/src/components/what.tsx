import { Section } from "@/components/section";

const PROBLEM = {
  before: [
    "The agent guesses the folder structure every time.",
    "Nobody can prove which rules were actually read.",
    "A red test is “probably fine, I will fix it next task”.",
    "The prompt is 2,000 words and the model skims it by turn 40.",
    "The conventions live in a human's head, then in a review comment, then vanish.",
  ],
  after: [
    "The structure is a file. `ARCHITECTURE.md` is the only answer.",
    "Every claim needs pasted terminal output, not a summary.",
    "A red test means stop. It is written in the laws, not in a review comment.",
    "Rules are routed: read the index, open only the one file you need.",
    "Conventions ship as `stacks/*.md`, versioned and diffable like code.",
  ],
};

export function What() {
  return (
    <Section
      id="what"
      eyebrow="WHAT IT IS"
      title="The spec is the source of truth. The agent is not."
      lead="Spec-Driven Development started as a discipline: write down what the system must do before writing the code. This project applies it to the agent itself — the spec, the rules and the acceptance criteria all become files, and the agent is a worker executing them rather than an author inventing them."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-6">
          <p className="label-mono text-text-muted">{"// Without a spec"}</p>
          <ul className="mt-5 flex flex-col gap-3.5">
            {PROBLEM.before.map((line) => (
              <li key={line} className="flex gap-3 text-body-md text-text-secondary">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-error" />
                {line}
              </li>
            ))}
          </ul>
        </div>
        <div className="card border-primary/40 p-6">
          <p className="label-mono text-primary">{"// With SDD"}</p>
          <ul className="mt-5 flex flex-col gap-3.5">
            {PROBLEM.after.map((line) => (
              <li key={line} className="flex gap-3 text-body-md text-text-secondary">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-secondary" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          {
            step: "01",
            title: "Spec",
            body: "PLAN.md holds exactly one task in flight, sized so it fits in an attention span. If it takes more than an hour, it is split before it starts.",
          },
          {
            step: "02",
            title: "Rules",
            body: "stacks/*.md is the engineering knowledge: architecture, language, testing, security. Routed by index so the agent reads the minimum necessary.",
          },
          {
            step: "03",
            title: "Evidence",
            body: "A task closes only when the green terminal output is pasted. Not described. Pasted, with the real counts.",
          },
        ].map((item) => (
          <div key={item.step} className="card p-6">
            <p className="font-mono text-body-sm text-primary">{item.step}</p>
            <h3 className="mt-3 text-headline-sm text-text-primary">{item.title}</h3>
            <p className="mt-2 text-body-sm text-text-secondary">{item.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
