import { Section } from "@/components/section";
import { SITE } from "@/content";

/**
 * The author section is a pointer, not a second resume.
 *
 * The numbers and the employers live at marcelinosandroni.com. Repeating them
 * here makes the page stale the moment that site changes, and a stale number is
 * worse than no number: it looks like a claim nobody checked. Four links, and
 * the full track record one click away.
 */
export function Author() {
  const links = [
    {
      label: "Full resume",
      hint: "21 years, R$ 24M/year, 100M msgs/day",
      href: SITE.resume,
      primary: true,
    },
    {
      label: "LinkedIn",
      hint: "Professional profile",
      href: SITE.author.linkedin,
      primary: false,
    },
    {
      label: "GitHub",
      hint: "Code and issues",
      href: SITE.author.github,
      primary: false,
    },
    {
      label: "Email",
      hint: SITE.author.email,
      href: `mailto:${SITE.author.email}`,
      primary: false,
    },
  ];

  return (
    <Section
      id="author"
      eyebrow="THE AUTHOR"
      title="Built by an engineer who measures in capital, scale and availability."
      lead="Fifteen years of corporate financial governance taught me to price compute cost and operational risk as balance-sheet liability. That is why this project is about gates and evidence, not about generating more code."
      tone="raised"
    >
      <div className="card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h3 className="text-headline-md text-text-primary">{SITE.author.name}</h3>
            <p className="mt-2 text-body-md text-text-secondary">{SITE.author.title}</p>
            <p className="mt-4 max-w-xl text-body-sm text-text-secondary">
              21 years across financial governance and software engineering. Systems processing
              100M messages a day, over R$ 100 billion under custody, and a deploy time that
              went from four hours to fifteen minutes. The numbers and the track record are on
              the resume.
            </p>
          </div>
          <p className="label-mono shrink-0">Fortaleza, CE · remote worldwide</p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith("mailto:") ? undefined : "_blank"}
              rel={link.href.startsWith("mailto:") ? undefined : "noreferrer noopener"}
              className={`card card-interactive flex flex-col gap-1 p-5 ${
                link.primary ? "border-primary/40" : ""
              }`}
            >
              <span
                className={`text-body-md font-semibold ${link.primary ? "text-primary" : "text-text-primary"}`}
              >
                {link.label}
              </span>
              <span className="text-body-sm text-text-secondary">{link.hint}</span>
            </a>
          ))}
        </div>
      </div>
    </Section>
  );
}
