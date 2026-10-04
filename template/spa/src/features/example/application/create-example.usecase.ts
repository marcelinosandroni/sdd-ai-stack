import { type Example, type ExampleInput, exampleSchema } from "../domain/example.schema";
import type { IExampleRepository } from "../domain/IExampleRepository";

export type CreateExampleResult =
  | { ok: true; example: Example }
  | { ok: false; error: string };

/**
 * The use case takes what it needs as parameters.
 *
 * No import of the repository, no container lookup, no module-level singleton. The
 * wiring lives in `container.ts`, which is the one file allowed to know how the
 * pieces are connected — and that is what lets this function be tested by handing
 * it an object literal instead of a database.
 */
export async function createExample(
  repository: IExampleRepository,
  input: ExampleInput,
): Promise<CreateExampleResult> {
  const parsed = exampleSchema.safeParse(input);

  if (!parsed.success) {
    // The first message, not all of them: the form renders one error at a time, and
    // a use case that returns a paragraph is a use case the UI has to re-parse.
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const example: Example = {
    ...parsed.data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  return { ok: true, example: await repository.save(example) };
}
