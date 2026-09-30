import type { ReactNode } from "react";

export function Section({
  id,
  eyebrow,
  title,
  lead,
  children,
  tone = "base",
}: {
  id: string;
  eyebrow: string;
  title: string;
  lead?: string;
  children: ReactNode;
  tone?: "base" | "raised";
}) {
  return (
    <section
      id={id}
      className={`section ${tone === "raised" ? "border-y border-border-subtle bg-surface-raised/40" : ""}`}
    >
      <div className="container-page">
        <p className="label-mono">{`// ${eyebrow}`}</p>
        <div className="rule mt-4" />
        <h2 className="mt-6 max-w-3xl text-headline-lg text-text-primary">{title}</h2>
        {lead ? (
          <p className="mt-4 max-w-2xl text-body-lg text-text-secondary">{lead}</p>
        ) : null}
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
