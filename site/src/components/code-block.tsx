"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * A code block with a copy button.
 *
 * The install command on this page is the whole pitch. Asking a visitor to
 * select 31 characters out of a `<pre>` and then press Ctrl+C on a phone is the
 * single highest-friction thing this site could do, so the button is on every
 * block rather than only the hero one.
 *
 * `navigator.clipboard` is unavailable on an insecure origin and throws in some
 * embedded webviews, so a selection-based fallback runs behind it. A copy button
 * that silently does nothing is worse than no copy button.
 */
export function CodeBlock({ lines, label = "Copy" }: { lines: string[]; label?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const text = lines.join("\n");

  // A shell block repeats lines — a blank separator, the same command twice — so
  // the content alone is not a unique key and the index alone is not stable
  // under a reorder. The occurrence count per line gives both.
  const keys = useMemo(() => {
    const seen = new Map<string, number>();
    return lines.map((line) => {
      const n = seen.get(line) ?? 0;
      seen.set(line, n + 1);
      return `${line}#${n}`;
    });
  }, [lines]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        fallbackCopy(text);
      }
      setState("copied");
    } catch {
      try {
        fallbackCopy(text);
        setState("copied");
      } catch {
        setState("failed");
      }
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2000);
  }, [text]);

  return (
    <div className="code-block">
      <button
        type="button"
        onClick={() => void copy()}
        data-copied={state === "copied"}
        data-click="copy-code"
        aria-label={
          state === "failed"
            ? "Copy failed — select the text manually"
            : `${label} to clipboard`
        }
        className="copy-button"
      >
        <span aria-hidden="true">
          {state === "copied" ? "✓" : state === "failed" ? "!" : "⧉"}
        </span>
        {state === "copied" ? "Copied" : state === "failed" ? "Failed" : label}
      </button>

      <pre className="m-0">
        <code>
          {lines.map((line, index) => (
            <span key={keys[index]} className="block">
              {line}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

/**
 * Selection-based copy. `execCommand` is deprecated but it is the only path that
 * works without a secure context, and a deprecated API that still works beats a
 * button that silently fails.
 */
function fallbackCopy(text: string) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(area);
  if (!ok) throw new Error("copy failed");
}
