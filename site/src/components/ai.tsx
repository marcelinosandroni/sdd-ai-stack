import { Section } from "@/components/section";

const LAYERS = [
  {
    layer: "The spec",
    human: "Decides the why and the acceptance criteria.",
    agent: "Reads PLAN.md, takes the single `[-]` task, stops at the boundary.",
  },
  {
    layer: "The rules",
    human: "Writes the convention once, as prose, in the right file.",
    agent:
      "Opens only the doc the router points at. Does not invent a convention that is not written down.",
  },
  {
    layer: "The code",
    human: "Owns the architecture and the trade-off.",
    agent:
      "Implements inside the vertical slice, hexagonal arrows inward, one reason to change per file.",
  },
  {
    layer: "The evidence",
    human: "Decides whether the claim is credible.",
    agent:
      "Runs the gate, pastes the real output, and refuses to mark a task done on a red test.",
  },
];

const FAILURE_MODES = [
  "The agent silently rewrites a convention instead of asking. §6 of the laws forbids editing the rules without a human.",
  "The agent marks `[x]` on a green typecheck and a skipped E2E. The evidence block is the acceptance, not the build.",
  "The agent adds a library because it was faster to type. §Golden rules: prove the native is enough first.",
  "The agent invents architecture when the spec is silent. §3: if it is not in the files, ask. Never improvise.",
];

export function Ai() {
  return (
    <Section
      id="ai"
      eyebrow="AI IN THE LOOP"
      title="The agent is a worker, not an author. That is the whole design."
      lead="The failure mode of agentic development is not a model that is wrong. It is a model that is confidently, fluently, unaccountably wrong — and nobody can tell from the diff which parts were invented."
      tone="raised"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="pb-3 pr-6 text-label-mono text-text-muted">Layer</th>
              <th className="pb-3 pr-6 text-label-mono text-text-muted">The human</th>
              <th className="pb-3 text-label-mono text-text-muted">The agent</th>
            </tr>
          </thead>
          <tbody>
            {LAYERS.map((row) => (
              <tr key={row.layer} className="border-b border-border-subtle/60">
                <td className="py-4 pr-6 align-top text-body-sm font-semibold text-primary">
                  {row.layer}
                </td>
                <td className="py-4 pr-6 align-top text-body-sm text-text-secondary">
                  {row.human}
                </td>
                <td className="py-4 align-top text-body-sm text-text-secondary">{row.agent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 card border-error/30 p-6">
        <p className="label-mono text-error">{"// What the laws forbid"}</p>
        <ul className="mt-5 flex flex-col gap-3">
          {FAILURE_MODES.map((mode) => (
            <li key={mode} className="flex gap-3 text-body-sm text-text-secondary">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-error" />
              {mode}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
