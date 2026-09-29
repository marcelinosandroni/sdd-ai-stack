import "server-only";
import { CreateExampleUseCase } from "./application/create-example.usecase";
import type { IExampleRepository } from "./domain/IExampleRepository";
import { InMemoryExampleRepository } from "./infrastructure/example.repository";

export interface IExampleUseCases {
  createExample: CreateExampleUseCase;
}

export function createExampleUseCases(
  repo: IExampleRepository = new InMemoryExampleRepository(),
): IExampleUseCases {
  return {
    createExample: new CreateExampleUseCase(repo),
  };
}
