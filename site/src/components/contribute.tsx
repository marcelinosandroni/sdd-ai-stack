import { CodeBlock } from "@/components/code-block";
import { Section } from "@/components/section";
import { SITE } from "@/content";

const WAYS = [
  {
    title: "Report a bug with evidence",
    body: "The fastest fixes come with a failing command. If a rule led an agent astray, say which rule and what it did instead.",
    cta: "Open an issue",
    href: SITE.issues,
  },
  {
    title: "Add a rule file",
    body: "A new stack is one markdown file following the pattern, listed in stacks/README.md. Spine first: map it to clean-code.md, do not duplicate it.",
    cta: "See the pattern",
    href: `${SITE.repo}/blob/main/stacks/README.md`,
  },
  {
    title: "Propose a gate",
    body: "A rule nobody checks is a rule nobody follows. If you can write a script that fails when the rule is broken, that is the highest-value contribution here.",
    cta: "See the existing checks",
    href: `${SITE.repo}/tree/main/SKILLS`,
  },
];

export function Contribute() {
  return (
    <Section
      id="contribute"
      eyebrow="CONTRIBUTE"
      title="The rules are the product, so the rules are open."
      lead="Most of this repository is prose. That makes contribution unusually cheap: a better sentence in the right file is a real improvement."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {WAYS.map((way) => (
          <div key={way.title} className="card flex flex-col p-6">
            <h3 className="text-headline-sm text-text-primary">{way.title}</h3>
            <p className="mt-3 flex-1 text-body-sm text-text-secondary">{way.body}</p>
            <a
              href={way.href}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-5 font-mono text-body-sm text-primary hover:underline"
            >
              {way.cta} →
            </a>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <p className="label-mono">{"// Local development"}</p>
          <div className="mt-4">
            <CodeBlock
              lines={[
                "git clone " +
                  SITE.repo.replace("https://github.com/", "") +
                  " && cd sdd-ai-stack",
                "npm install",
                "npm test              # the CLI suite",
                "npm run check:coverage",
                "npm run check:docs",
                "",
                "# prove the template still builds",
                "node bin/create-sdd-ai-stack.mjs .sandbox --no-install --yes",
                "cd .sandbox && npm install && npm run build",
              ]}
            />
          </div>
        </div>

        <div>
          <p className="label-mono">{"// House rules for a pull request"}</p>
          <ul className="mt-4 flex flex-col gap-3">
            {[
              "Conventional Commits, English, with the agent in the trailer.",
              "A test that would fail without your change. Break the code and watch it go red.",
              "Editing anything under stacks/ or DESIGN.md is forbidden without asking first — those are the law of the template.",
              "Green output pasted, with the real counts.",
            ].map((rule) => (
              <li key={rule} className="flex gap-3 text-body-sm text-text-secondary">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                {rule}
              </li>
            ))}
          </ul>

          <div className="card mt-6 p-6">
            <p className="label-mono">{"// Need help or found something?"}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={SITE.repo}
                target="_blank"
                rel="noreferrer noopener"
                className="button button-primary"
              >
                GitHub
              </a>
              <a
                href={SITE.issues}
                target="_blank"
                rel="noreferrer noopener"
                className="button button-quiet"
              >
                Issues
              </a>
              <a
                href={SITE.discussions}
                target="_blank"
                rel="noreferrer noopener"
                className="button button-quiet"
              >
                Discussions
              </a>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
