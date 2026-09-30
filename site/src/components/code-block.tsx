import type { ReactNode } from "react";

export function CodeBlock({ lines }: { lines: string[] }) {
  return (
    <pre className="code-block">
      <code>
        {lines.map((line, i) => (
          <span key={line + String(i)} className="block">
            {line}
          </span>
        ))}
      </code>
    </pre>
  );
}

/** Renders a shell line with a coloured prompt and highlighted flags. */
export function ShellLine({ children }: { children: ReactNode }) {
  return (
    <span className="block">
      <span className="prompt">$ </span>
      {children}
    </span>
  );
}
