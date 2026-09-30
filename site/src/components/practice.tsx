import { Section } from "@/components/section";

const PRACTICES = [
  {
    title: "One task in flight",
    body: "PLAN.md holds exactly one `[-]` task. Two means the agent stopped wrong. Micro-scoping is not bureaucracy: an agent that loses the thread mid-task writes code nobody asked for.",
    rule: "If it takes more than 1 hour, split it in two before starting.",
  },
  {
    title: "Behavioural acceptance criteria",
    body: "Commands prove the code compiles. Criteria prove the code is right. The task template asks for Given/When/Then, the 401 that writes no row, the forbidden role, the repository that throws.",
    rule: "Every criterion needs a test that would fail without the change.",
  },
  {
    title: "A Server Action is public",
    body: "The browser is untrusted. Authentication, then authorization, then validation, then mutation, then cache — in that order, on the server. A disabled auth stub in a template is a trap, so this one is wired and tested.",
    rule: "Authorization lives in the data layer, not only in the UI.",
  },
  {
    title: "Test against the build",
    body: "`next dev` does not minify and takes a different render path. A green E2E against dev proves nothing about production.",
    rule: "E2E runs against `next build && next start`, on Chromium and Firefox.",
  },
  {
    title: "No dead code",
    body: "An unmeasurable function is a function nobody ran. Every generated slice compiles on the first run; the parts that need a human decision fail at runtime, loudly, not at build time.",
    rule: "Every new export must be imported somewhere. Grep it.",
  },
  {
    title: "Evidence is never compressed",
    body: "A token-saving tool may shorten your prose. It may never shorten the evidence block. Full command, full exit code, real counts.",
    rule: "Paste the output. Describing it is not the same as running it.",
  },
];

export function Practice() {
  return (
    <Section
      id="practice"
      eyebrow="PRACTICES"
      title="The six rules the template enforces, and the one that matters most."
      lead="Every practice here exists because its absence produced a bug that a test now prevents."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {PRACTICES.map((practice) => (
          <div key={practice.title} className="card p-6">
            <h3 className="text-headline-sm text-text-primary">{practice.title}</h3>
            <p className="mt-3 text-body-sm text-text-secondary">{practice.body}</p>
            <p className="mt-4 border-l-2 border-primary pl-3 font-mono text-body-sm text-primary">
              {practice.rule}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
