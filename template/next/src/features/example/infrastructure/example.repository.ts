import "server-only";
import { randomUUID } from "node:crypto";
import type { Example, IExampleRepository } from "../domain/IExampleRepository";

/**
 * Adaptador em memória — SUBSTITUA pelo Prisma/Seu DB.
 * Ver SDD/stacks/database.md. A interface do domínio NÃO muda.
 */
export class InMemoryExampleRepository implements IExampleRepository {
  private readonly store = new Map<string, Example>();

  async create(input: { title: string; body: string }): Promise<Example> {
    const example: Example = {
      id: randomUUID(),
      title: input.title,
      body: input.body,
      createdAt: new Date(),
    };
    this.store.set(example.id, example);
    return example;
  }

  async findById(id: string): Promise<Example | null> {
    return this.store.get(id) ?? null;
  }
}
