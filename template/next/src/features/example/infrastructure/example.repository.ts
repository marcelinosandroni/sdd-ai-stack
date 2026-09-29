import "server-only";
import { randomUUID } from "node:crypto";
import type {
  CreateExampleData,
  Example,
  IExampleRepository,
} from "../domain/IExampleRepository";

/**
 * In-memory adapter — REPLACE with Prisma / your DB.
 * See SDD/stacks/database.md. The domain interface does NOT change.
 *
 * The store hangs off `globalThis` on purpose. In a production build Next
 * compiles each route into its own module registry, so a plain module-level
 * `new Map()` gives the Server Action and the page render DIFFERENT stores —
 * the form would report success and the list would stay empty. A real database
 * has no such problem; this singleton exists only so the demo is honest.
 */
const globalStore = globalThis as typeof globalThis & {
  __sddExampleStore?: Map<string, Example>;
};

export class InMemoryExampleRepository implements IExampleRepository {
  private readonly store: Map<string, Example>;

  constructor(store?: Map<string, Example>) {
    if (store) {
      this.store = store;
      return;
    }
    globalStore.__sddExampleStore ??= new Map();
    this.store = globalStore.__sddExampleStore;
  }

  async create(input: CreateExampleData): Promise<Example> {
    const example: Example = {
      id: randomUUID(),
      title: input.title,
      body: input.body,
      ownerId: input.ownerId,
      createdAt: new Date(),
    };
    this.store.set(example.id, example);
    return example;
  }

  async findById(id: string): Promise<Example | null> {
    return this.store.get(id) ?? null;
  }

  async listByOwner(ownerId: string): Promise<Example[]> {
    return [...this.store.values()]
      .filter((example) => example.ownerId === ownerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}
