/**
 * The Matrix opener — the design system speaking for itself.
 *
 * Every project built with this system opens the same way: a small notification in
 * the bottom-right corner, a message typing itself out one line at a time, and a
 * click that opens a terminal. It is the shortest possible statement of what the
 * tokens are for, and it costs a visitor nothing to dismiss.
 *
 * Two rules shaped this file, both from `DESIGN.md`:
 *
 *   §REUSABILITY — nothing here names a domain. It says "message" and "open", not
 *   "contact the author". Swap `onSend` for whatever the project actually does.
 *
 *   §6 UX — "zero actions without a response", "animations respect
 *   prefers-reduced-motion", and "nothing traps the user in a loading state". The
 *   typing animation is the one place this design is allowed to be slow, so it is
 *   the one place that gets an explicit skip.
 */

export type Locale = "pt-BR" | "en-US";

/**
 * Both languages ship. Nothing decides at runtime, nothing is fetched, and there is
 * no English fallback that silently swallows a missing key — a missing key has to
 * be a type error, which is the only way a translator finds out.
 */
export const MESSAGES = {
  "en-US": {
    notification: "New message",
    typing: "typing",
    /** Typed out one line at a time, in this order. */
    lines: [
      "Wake up, Neo...",
      "The Matrix has you...",
      "Follow the white rabbit.",
      "Knock, knock, Neo.",
    ],
    openLabel: "Open terminal",
    prompt: "neo@matrix:~$",
    placeholder: "type, then Enter",
    send: "send",
    reply: "There is no spoon.",
    dismiss: "dismiss",
    close: "close terminal",
  },
  "pt-BR": {
    notification: "Nova mensagem",
    typing: "digitando",
    lines: [
      "Acorda, Neo...",
      "A Matrix tem você...",
      "Siga o coelho branco.",
      "Toc, toc, Neo.",
    ],
    openLabel: "Abrir terminal",
    prompt: "neo@matrix:~$",
    placeholder: "digite, depois Enter",
    send: "enviar",
    reply: "Não existe colher.",
    dismiss: "dispensar",
    close: "fechar terminal",
  },
} as const satisfies Record<Locale, Record<string, string | readonly string[]>>;

/**
 * Resolves the locale from the document, falling back to English.
 *
 * `<html lang>` is the project's own declaration, so the opener agrees with the rest
 * of the app by construction rather than by consulting a second source of truth.
 */
export function resolveLocale(lang: string | undefined | null): Locale {
  return lang?.toLowerCase().startsWith("pt") ? "pt-BR" : "en-US";
}

/** Milliseconds per character while typing. */
export const TYPING_MS = 42;
/** Milliseconds of silence between one line finishing and the next starting. */
export const LINE_GAP_MS = 620;
/** Milliseconds before the notification appears. Long enough not to ambush. */
export const NOTIFY_DELAY_MS = 1600;

/**
 * The four lines, as a plain array, so a test can assert the copy without rendering.
 *
 * The film phrasing is a quotation and it is the whole point of the component, so it
 * is asserted rather than trusted — a reworded "Knock, knock, Neo." is a regression
 * nobody would otherwise notice.
 */
export function linesFor(locale: Locale): readonly string[] {
  return MESSAGES[locale].lines;
}

/** Total characters across every line. Used for the progress-free reveal. */
export function totalChars(lines: readonly string[]): number {
  return lines.reduce((sum, line) => sum + line.length, 0);
}
