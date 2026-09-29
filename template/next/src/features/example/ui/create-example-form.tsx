"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/shared/ui";
import { createExampleAction, type ExampleActionState } from "../actions";

const initialState: ExampleActionState = { ok: false };

export function CreateExampleForm() {
  const [state, formAction] = useActionState(createExampleAction, initialState);

  return (
    <form action={formAction} className="card flex flex-col gap-4">
      <div>
        <label htmlFor="title" className="field-label">
          Title
        </label>
        <input
          id="title"
          name="title"
          className="field"
          placeholder="e.g. Ledger migration"
          aria-invalid={state.errors?.title ? true : undefined}
          aria-describedby={state.errors?.title ? "title-error" : undefined}
        />
        {state.errors?.title ? (
          <p id="title-error" className="mt-1 text-body-sm text-error">
            {state.errors.title[0]}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="body" className="field-label">
          Content
        </label>
        <textarea
          id="body"
          name="body"
          rows={4}
          className="field"
          aria-invalid={state.errors?.body ? true : undefined}
          aria-describedby={state.errors?.body ? "body-error" : undefined}
        />
        {state.errors?.body ? (
          <p id="body-error" className="mt-1 text-body-sm text-error">
            {state.errors.body[0]}
          </p>
        ) : null}
      </div>

      {state.error ? (
        <p className="text-body-sm text-error" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="text-body-sm text-primary" role="status">
          Example created.
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} aria-busy={pending}>
      {pending ? "Creating..." : "Create example"}
    </Button>
  );
}
