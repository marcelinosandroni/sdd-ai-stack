import { useCallback, useState } from "react";
import type { Example } from "@/features/example/domain/example.schema";
import { CreateExampleForm } from "@/features/example/ui/create-example-form";
import { ExampleList } from "@/features/example/ui/example-list";

/**
 * A remount key, not a prop drill.
 *
 * The form creates an item; the list shows items. They need to agree, and the
 * cheapest honest way to say "the list is stale now" is to give it a new `key`, so
 * React remounts it and its effect re-reads the repository. Lifting both into one
 * state in `App` would work too — and would put a list refresh in the same file as
 * the page layout, which is the arrangement that grows into a state manager.
 */
export default function App() {
  const [generation, setGeneration] = useState(0);
  const onCreated = useCallback((_example: Example) => setGeneration((n) => n + 1), []);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-3">
        <p className="label-mono">Spec-Driven Development</p>
        <h1 className="font-editorial text-4xl text-text-primary">[APP NAME]</h1>
        <p className="text-text-secondary">[ONE-LINE DESCRIPTION]</p>
      </header>

      <CreateExampleForm onCreated={onCreated} />

      <section className="flex flex-col gap-4" aria-labelledby="examples-heading">
        <h2 id="examples-heading" className="label-mono">
          Examples
        </h2>
        <ExampleList key={generation} />
      </section>
    </main>
  );
}
