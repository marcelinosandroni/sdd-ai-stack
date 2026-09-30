"use client";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/shared/ui";

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
        Error
      </span>
      <h1 className="mt-6 text-headline-lg">Something broke.</h1>
      <p className="mt-3 max-w-lg text-body-md text-text-secondary">
        The error was logged. Try again — if it persists, the digest below identifies the
        occurrence.
      </p>
      {error.digest ? (
        <p className="mt-4 text-code-inline text-text-muted">digest: {error.digest}</p>
      ) : null}
      <Button type="button" onClick={reset} size="lg" className="mt-8">
        Try again
      </Button>
    </main>
  );
}
