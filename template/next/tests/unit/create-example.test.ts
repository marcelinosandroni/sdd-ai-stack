import { beforeEach, describe, expect, it } from "vitest";
import {
  AppError,
  CreateExampleUseCase,
} from "@/features/example/application/create-example.usecase";
import type {
  CreateExampleData,
  IExampleRepository,
} from "@/features/example/domain/IExampleRepository";

function makeRepo() {
  const created: CreateExampleData[] = [];
  const repo: IExampleRepository = {
    create: async (input) => {
      created.push(input);
      return { id: "id-1", createdAt: new Date(), ...input };
    },
    findById: async () => null,
    listByOwner: async (ownerId) =>
      created
        .filter((row) => row.ownerId === ownerId)
        .map((row, index) => ({ id: `id-${index}`, createdAt: new Date(), ...row })),
  };
  return { repo, created };
}

describe("CreateExampleUseCase", () => {
  let repo: IExampleRepository;
  let created: CreateExampleData[];

  beforeEach(() => {
    const made = makeRepo();
    repo = made.repo;
    created = made.created;
  });

  it("creates when the input is valid", async () => {
    const useCase = new CreateExampleUseCase(repo);

    const result = await useCase.execute({
      title: "Ledger",
      body: "valid content",
      ownerId: "user-1",
    });

    expect(result.title).toBe("Ledger");
    expect(result.ownerId).toBe("user-1");
    expect(created).toHaveLength(1);
  });

  it("trims both sides before persisting", async () => {
    const useCase = new CreateExampleUseCase(repo);

    await useCase.execute({
      title: "  Ledger  ",
      body: "  valid body content  ",
      ownerId: "user-1",
    });

    expect(created[0]).toEqual({
      title: "Ledger",
      body: "valid body content",
      ownerId: "user-1",
    });
  });

  it("throws when the title is too short after trim", async () => {
    const useCase = new CreateExampleUseCase(repo);

    await expect(
      useCase.execute({ title: "  ab  ", body: "body", ownerId: "user-1" }),
    ).rejects.toThrow();
    expect(created).toHaveLength(0);
  });

  it("throws when the body is too short after trim", async () => {
    const useCase = new CreateExampleUseCase(repo);

    await expect(
      useCase.execute({ title: "Ledger", body: "  ab  ", ownerId: "user-1" }),
    ).rejects.toThrow();
    expect(created).toHaveLength(0);
  });

  it("rejects a missing owner instead of writing an orphan row", async () => {
    const useCase = new CreateExampleUseCase(repo);

    await expect(
      useCase.execute({ title: "Ledger", body: "valid body", ownerId: "" }),
    ).rejects.toThrow(AppError);
    expect(created).toHaveLength(0);
  });

  it("propagates a repository failure instead of swallowing it", async () => {
    const useCase = new CreateExampleUseCase({
      create: async () => {
        throw new Error("database is down");
      },
      findById: async () => null,
      listByOwner: async () => [],
    });

    await expect(
      useCase.execute({ title: "Ledger", body: "valid body", ownerId: "user-1" }),
    ).rejects.toThrow("database is down");
  });
});
