import type { Example } from "./example.schema";

/**
 * The port. `application/` depends on this interface, `infrastructure/` implements
 * it, and the arrow points inward — so the use case can be read, and tested,
 * without knowing what a database is.
 *
 * Naming it `IExampleRepository` rather than `ExampleRepository` is deliberate: the
 * `I` is the marker that says "this file contains no implementation".
 */
export interface IExampleRepository {
  list(): Promise<Example[]>;
  save(example: Example): Promise<Example>;
}
