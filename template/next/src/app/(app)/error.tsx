"use client";
import { AlertTriangle } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="container-grid flex min-h-screen flex-col items-start justify-center py-24">
      <span className="chip" style={{ borderColor: "var(--color-error)" }}>
        <AlertTriangle size={12} />
        Erro
      </span>
      <h1 className="mt-6 text-headline-lg">Algo quebrou.</h1>
      <p className="mt-3 max-w-lg text-body-md text-text-secondary">
        O erro foi registrado. Tente novamente — se persistir, o digest abaixo identifica
        a ocorrência.
      </p>
      {error.digest ? (
        <p className="mt-4 text-code-inline text-text-muted">digest: {error.digest}</p>
      ) : null}
      <button type="button" onClick={reset} className="btn-primary mt-8">
        Tentar novamente
      </button>
    </main>
  );
}
