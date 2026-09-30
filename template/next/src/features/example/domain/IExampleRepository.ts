export interface Example {
  id: string;
  title: string;
  body: string;
  ownerId: string;
  createdAt: Date;
}

export interface CreateExampleData {
  title: string;
  body: string;
  ownerId: string;
}

/**
 * The port. The use case depends on this, never on Prisma, never on a fetch
 * call. Swap the implementation in `container.ts` and nothing above changes.
 */
export interface IExampleRepository {
  create(input: CreateExampleData): Promise<Example>;
  findById(id: string): Promise<Example | null>;
  listByOwner(ownerId: string): Promise<Example[]>;
}
