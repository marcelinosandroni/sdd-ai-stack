"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  LINE_GAP_MS,
  MESSAGES,
  NOTIFY_DELAY_MS,
  resolveLocale,
  TYPING_MS,
} from "./matrix-terminal.strings";

/**
 * The Matrix opener.
 *
 * Three states, in order: nothing → notification → terminal. Everything a visitor sees
 * before touching anything is the notification, and the notification dismisses on its
 * own — an invitation that cannot be refused is not an invitation.
 *
 * `onSend` is the only integration point. This component does not know who it is
 * talking to, where a message goes, or what the project is about.
 */
export function MatrixTerminal({
  lang,
  onSend,
}: {
  /** Override the language. Omit it and the document's own `lang` is used. */
  lang?: string;
  onSend?: (message: string) => void;
}) {
  const documentLang = useDocumentLang();
  const t = MESSAGES[resolveLocale(lang ?? documentLang)];

  const [notified, setNotified] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [open, setOpen] = useState(false);

  // Cursor over the message rather than a growing string: the pause *between* lines
  // is the effect, and a flat character count has nowhere to put it.
  const [cursor, setCursor] = useState(0);

  const [draft, setDraft] = useState("");
  // A monotonic id, not the array index. Two people can send the same message, so the
  // message itself is not a key — and an index as a key is exactly the bug where
  // removing one exchange re-renders the wrong one.
  const [sent, setSent] = useState<{ id: number; text: string }[]>([]);
  const nextId = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const reduced = usePrefersReducedMotion();

  const total = t.lines.reduce((sum, line) => sum + line.length, 0);
  // Under reduced motion the message is simply already there. CSS cannot pause a
  // `setTimeout`, so the choice is between no message and an immediate one.
  const shown = reduced ? total : cursor;
  const complete = shown >= total;

  useEffect(() => {
    const timer = setTimeout(() => setNotified(true), NOTIFY_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (reduced || complete) return;

    // The gap only applies when the previous line has just finished: the cursor is
    // sitting exactly on a line boundary.
    const startsNewLine = t.lines.some(
      (_, i) => cursor > 0 && cursor === t.lines.slice(0, i + 1).join("").length,
    );

    const timer = setTimeout(
      () => setCursor((n) => n + 1),
      startsNewLine ? LINE_GAP_MS : TYPING_MS,
    );
    return () => clearTimeout(timer);
  }, [cursor, complete, reduced, t.lines]);

  // Dismissing removes the *notification*, not the way in. It used to return null for
  // the whole component, which took the launcher with it — so a visitor who closed the
  // toast once had no way to open the terminal at all. That was found by the E2E test
  // that asserts the launcher appears after a dismissal.
  const dismissNotice = useCallback(() => {
    setDismissed(true);
    setNotified(false);
  }, []);

  const openTerminal = useCallback(() => {
    setOpen(true);
    setNotified(false);
    setCursor(total);
  }, [total]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // `Escape` closes. A panel with no exit other than a 44px target is a trap, and §6
  // is explicit about that.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const submit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const message = draft.trim();
      if (!message) return;
      nextId.current += 1;
      const id = nextId.current;
      setSent((previous) => [...previous, { id, text: message }]);
      setDraft("");
      onSend?.(message);
    },
    [draft, onSend],
  );

  const showNotice = notified && !open && !dismissed;

  // How much of each line has been typed so far. `noUncheckedIndexedAccess` is on, so
  // the lookup is explicit about the absent case — which is every line past the cursor.
  let remaining = shown;
  const typed = t.lines.map((line) => {
    const take = Math.min(remaining, line.length);
    remaining -= take;
    return line.slice(0, take);
  });

  return (
    <>
      {showNotice ? (
        <div className="matrix-notice" role="status" data-testid="matrix-notice">
          <span className="matrix-notice__dot" aria-hidden="true" />
          {/*
            The notice IS the affordance. It used to sit beside the launcher in the same
            corner, and the dismiss control — 44px, because §4b.2 rule 2 — landed
            squarely on top of the launcher, so while a notice was up the terminal could
            not be opened at all. Playwright caught it; a screenshot would not have,
            because both elements render perfectly and overlap invisibly.
          */}
          <button type="button" className="matrix-notice__open" onClick={openTerminal}>
            <span className="matrix-notice__label">{t.notification}</span>
            <span className="matrix-notice__preview" data-testid="matrix-preview">
              {complete ? typed[0] : typed[0] || t.typing}
            </span>
          </button>
          <button
            type="button"
            className="matrix-notice__dismiss"
            onClick={dismissNotice}
          >
            <span aria-hidden="true">×</span>
            <span className="sr-only">{t.dismiss}</span>
          </button>
        </div>
      ) : null}

      {open ? (
        <section
          className="matrix-terminal"
          role="dialog"
          aria-label={t.openLabel}
          data-testid="matrix-terminal"
        >
          <header className="matrix-terminal__bar">
            <span className="matrix-terminal__title">{t.openLabel}</span>
            <button
              type="button"
              className="matrix-terminal__close"
              onClick={() => setOpen(false)}
            >
              <span aria-hidden="true">×</span>
              <span className="sr-only">{t.close}</span>
            </button>
          </header>

          <div className="matrix-terminal__body" aria-live="polite">
            {t.lines.map((line, index) => {
              const text = typed[index] ?? "";
              const typingThisLine =
                !complete && text.length > 0 && text.length < line.length;
              return (
                <p key={line} className="matrix-terminal__line" data-testid="matrix-line">
                  {text}
                  {typingThisLine ? <span className="matrix-caret" /> : null}
                </p>
              );
            })}

            {sent.map(({ id, text }) => (
              <div key={id} className="matrix-terminal__exchange">
                <p className="matrix-terminal__echo">{text}</p>
                <p className="matrix-terminal__reply">{t.reply}</p>
              </div>
            ))}
          </div>

          {/* No "skip" button. There was one, and it was unreachable: opening the
              terminal reveals the whole message, because the law is immediate feedback
              and nobody wants a click to start a four-second animation. The drama lives
              in the notification, where it is a teaser for what you are about to open.
              A control that can never appear is a control nobody tested. */}

          <form className="matrix-terminal__form" onSubmit={submit}>
            <label className="matrix-terminal__prompt" htmlFor="matrix-input">
              {t.prompt}
            </label>
            <input
              id="matrix-input"
              ref={inputRef}
              className="matrix-terminal__input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t.placeholder}
              autoComplete="off"
              spellCheck={false}
            />
            <button type="submit" className="matrix-terminal__send">
              {t.send}
            </button>
          </form>
        </section>
      ) : null}

      {/* The launcher yields to the notice. Two controls in one corner is a z-index
          argument waiting to happen, and the argument is always lost by whoever is
          underneath. */}
      {!showNotice && !open ? (
        <button
          type="button"
          className="matrix-launcher"
          onClick={openTerminal}
          data-testid="matrix-launcher"
        >
          <span aria-hidden="true">&gt;_</span>
          <span className="sr-only">{t.openLabel}</span>
        </button>
      ) : null}
    </>
  );
}

/**
 * The document's declared language, read after mount.
 *
 * The component reads this itself rather than requiring every call site to pass it.
 * Two templates did pass it explicitly and one did not, and the one that did not came
 * out in English on a page whose `<html lang>` was `pt-BR` — a component that depends
 * on the caller remembering something is a component that will be used wrong, which is
 * §REUSABILITY applied to an API instead of a name.
 *
 * After mount, not during render: reading the DOM while rendering is impure, and the
 * notification does not appear for 1.6s anyway, so there is nothing to get wrong.
 */
function useDocumentLang() {
  const [value, setValue] = useState<string | undefined>(undefined);

  useEffect(() => {
    setValue(document.documentElement.lang);
  }, []);

  return value;
}
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);

    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
