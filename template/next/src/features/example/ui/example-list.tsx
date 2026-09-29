import type { Example } from "../domain/IExampleRepository";

export function ExampleList({
  examples,
  signedIn,
}: {
  examples: Example[];
  signedIn: boolean;
}) {
  if (!signedIn) {
    return (
      <p className="card text-body-sm text-text-secondary" role="status">
        Signed out. Examples are only listed for the signed-in owner.
      </p>
    );
  }

  if (examples.length === 0) {
    return (
      <p className="card text-body-sm text-text-secondary" role="status">
        No examples yet. Submit the form to create one.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {examples.map((example) => (
        <li key={example.id} className="card">
          <h3 className="text-headline-sm">{example.title}</h3>
          <p className="mt-1 text-body-sm text-text-secondary">{example.body}</p>
        </li>
      ))}
    </ul>
  );
}
