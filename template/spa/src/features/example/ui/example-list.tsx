import { useEffect, useState } from "react";

import { Skeleton } from "@/shared/ui";

import { exampleRepository } from "../container";
import type { Example } from "../domain/example.schema";

export function ExampleList() {
  const [examples, setExamples] = useState<Example[] | null>(null);

  useEffect(() => {
    let alive = true;

    void exampleRepository.list().then((found) => {
      // The `alive` flag is not paranoia: `list()` awaits, and by the time it
      // resolves the component may already be unmounted. Setting state after that
      // is the warning React prints once and then stops printing — which is exactly
      // the bug nobody finds.
      if (alive) setExamples(found);
    });

    return () => {
      alive = false;
    };
  }, []);

  if (examples === null) {
    return (
      <div className="flex flex-col gap-3" data-testid="examples-loading">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (examples.length === 0) {
    return (
      <p className="text-sm text-text-secondary">
        Nothing here yet. Create the first one above.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3" data-testid="examples-list">
      {examples.map((example) => (
        <li key={example.id} className="card p-4">
          <h3 className="text-sm font-medium text-text-primary">{example.title}</h3>
          {example.notes ? (
            <p className="mt-1 text-sm text-text-secondary">{example.notes}</p>
          ) : null}
          <time className="label-mono mt-3 block" dateTime={example.createdAt}>
            {example.createdAt.slice(0, 16).replace("T", " ")}
          </time>
        </li>
      ))}
    </ul>
  );
}
