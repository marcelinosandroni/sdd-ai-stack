import type { CreateExampleInput } from "../domain/example.schema";
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

export class CreateExampleUseCase {
  constructor(private readonly repo: IExampleRepository) {}

  async execute(input: CreateExampleInput): Promise<Example> {
    const title = input.title.trim();

    if (title.length < 3) {
      throw new AppError("Título inválido", "EXAMPLE_INVALID_TITLE");
    }

    return this.repo.create({ title, body: input.body.trim() });
  }
}
