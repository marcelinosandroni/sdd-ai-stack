import { createExample } from "./application/create-example.usecase";
import { createMemoryExampleRepository } from "./infrastructure/example.repository";

/**
 * The composition root: the one file that knows which implementation is wired to
 * which port.
 *
 * This exists so that "which repository is this app using?" has exactly one answer,
 * and so that swapping `createMemoryExampleRepository` for an HTTP client is a
 * one-line change in a one-line place — not a search across the feature.
 */
export const exampleRepository = createMemoryExampleRepository();

export { createExample };
