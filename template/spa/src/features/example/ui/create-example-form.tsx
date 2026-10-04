import { useCallback, useState } from "react";

import { Button } from "@/shared/ui";

import { createExample, exampleRepository } from "../container";
import type { Example } from "../domain/example.schema";

/**
 * The UI owns presentation and nothing else.
 *
 * No validation rules, no ID generation, no timestamps — all three are already in
 * `domain/` and `application/`. That is what makes the use case testable without a
 * DOM and this component testable without a repository.
 */
export function CreateExampleForm({ onCreated }: { onCreated?: (e: Example) => void }) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = useCallback(async () => {
    setPending(true);
    setError(null);

    const result = await createExample(exampleRepository, { title, notes });

    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setTitle("");
    setNotes("");
    onCreated?.(result.example);
  }, [title, notes, onCreated]);

  return (
    <form
      className="card flex flex-col gap-4 p-6"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="example-title" className="label-mono">
          Title
        </label>
        <input
          id="example-title"
          name="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What are you building?"
          className="h-10 rounded-md border border-border-subtle bg-surface-base px-3 text-sm text-text-primary placeholder:text-text-tertiary"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="example-notes" className="label-mono">
          Notes
        </label>
        <textarea
          id="example-notes"
          name="notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          placeholder="Optional. Up to 280 characters."
          className="rounded-md border border-border-subtle bg-surface-base p-3 text-sm text-text-primary placeholder:text-text-tertiary"
        />
      </div>

      {error ? (
        // `role="alert"` so a screen reader announces the failure as it appears,
        // instead of leaving it as silent text that only sighted users notice.
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Create example"}
      </Button>
    </form>
  );
}
