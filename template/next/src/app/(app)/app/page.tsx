import { Suspense } from "react";
import { CreateExampleForm } from "@/features/example/ui/create-example-form";
import { ExampleBoard } from "./example-board";

export default function AppPage() {
  return (
    <main className="container-grid py-16">
      <h1 className="text-headline-lg">App</h1>
      <p className="mt-3 text-body-md text-text-secondary">
        This page is the live reference for{" "}
        <code className="text-code-inline text-primary">src/features/example</code> —
        action, use case, repository, form.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        <span className="chip chip-active">Next.js 16</span>
        <span className="chip">React 19</span>
        <span className="chip">TypeScript</span>
        <span className="chip">Tailwind v4</span>
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <section aria-labelledby="create-example-heading">
          <h2 id="create-example-heading" className="text-headline-sm">
            Create example
          </h2>
          <p className="mt-2 text-body-sm text-text-secondary">
            Signed out: the action rejects before validating. Signed in: send the header{" "}
            <code className="text-code-inline">x-demo-user: member</code>.
          </p>
          <div className="mt-4">
            <CreateExampleForm />
          </div>
        </section>

        <section aria-labelledby="example-list-heading">
          <h2 id="example-list-heading" className="text-headline-sm">
            Your examples
          </h2>
          {/* `headers()` is dynamic, so the read needs a Suspense boundary under
              `cacheComponents`. See SDD/stacks/next.md §6. */}
          <Suspense fallback={<div className="card h-32 animate-pulse" />}>
            <ExampleBoard />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
