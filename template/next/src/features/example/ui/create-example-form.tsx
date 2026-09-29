"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createExampleAction, type ExampleActionState } from "../actions";

const initialState: ExampleActionState = { ok: false };

export function CreateExampleForm() {
  const [state, formAction] = useActionState(createExampleAction, initialState);

  return (
    <form action={formAction} className="card flex flex-col gap-4">
      <div>
        <label htmlFor="title" className="field-label">
          Título
        </label>
        <input
          id="title"
          name="title"
          className="field"
          placeholder="Ex: Migração do ledger"
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
          Conteúdo
        </label>
        <textarea id="body" name="body" rows={4} className="field" />
        {state.errors?.body ? (
          <p className="mt-1 text-body-sm text-error">{state.errors.body[0]}</p>
        ) : null}
      </div>

      {state.error ? <p className="text-body-sm text-error">{state.error}</p> : null}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary self-start" disabled={pending}>
      {pending ? "Processando..." : "Criar exemplo"}
    </button>
  );
}
