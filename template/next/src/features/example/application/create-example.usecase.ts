import { ExampleBodySchema, ExampleTitleSchema } from "../domain/example.schema";
import type { Example, IExampleRepository } from "../domain/IExampleRepository";

export class AppError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Business rules live here, not in the action and not in the form. The form is
 * untrusted, the database is dumb: this class is the only place allowed to
 * decide whether a title is acceptable.
 */
export class CreateExampleUseCase {
  constructor(private readonly repo: IExampleRepository) {}

  async execute(input: {
    title: string;
    body: string;
    ownerId: string;
  }): Promise<Example> {
    const title = ExampleTitleSchema.parse(input.title);
    const body = ExampleBodySchema.parse(input.body);

    if (!input.ownerId) {
      throw new AppError("Owner is required", "EXAMPLE_MISSING_OWNER");
    }

    return this.repo.create({ title, body, ownerId: input.ownerId });
  }
}
