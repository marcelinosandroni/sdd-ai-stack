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

/**
 * One repository per process, not per call. The in-memory adapter is a
 * placeholder: a real database survives requests by itself, but this singleton
 * keeps the demo honest — a form that creates a row you can then read back.
 *
 * Swap this line for a Prisma client. Nothing above it changes.
 */
const repository = new InMemoryExampleRepository();

export const exampleUseCases: IExampleUseCases = createExampleUseCases(repository);
export const exampleRepository = repository;
