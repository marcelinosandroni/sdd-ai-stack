import { beforeEach, describe, expect, it } from "vitest";
import {
  AppError,
  CreateExampleUseCase,
} from "@/features/example/application/create-example.usecase";
import type { IExampleRepository } from "@/features/example/domain/IExampleRepository";

function makeRepo() {
  const created: { title: string; body: string }[] = [];
  const repo: IExampleRepository = {
    create: async (input) => {
      created.push(input);
      return { id: "id-1", createdAt: new Date(), ...input };
    },
    findById: async () => null,
  };
  return { repo, created };
}

describe("CreateExampleUseCase", () => {
  let repo: IExampleRepository;
  let created: { title: string; body: string }[];

  beforeEach(() => {
    const made = makeRepo();
    repo = made.repo;
    created = made.created;
  });

  it("deve_criar_quando_input_valido", async () => {
    const useCase = new CreateExampleUseCase(repo);

    const result = await useCase.execute({ title: "Ledger", body: "conteúdo ok" });

    expect(result.title).toBe("Ledger");
    expect(created).toHaveLength(1);
  });

  it("deve_remover_espacos_dos_lados", async () => {
    const useCase = new CreateExampleUseCase(repo);

    await useCase.execute({ title: "  Ledger  ", body: "  corpo  " });

    expect(created[0]).toEqual({ title: "Ledger", body: "corpo" });
  });

  it("deve_lancar_erro_quando_titulo_curto_apos_trim", async () => {
    const useCase = new CreateExampleUseCase(repo);

    await expect(useCase.execute({ title: "  ab  ", body: "corpo" })).rejects.toThrow(
      AppError,
    );
    expect(created).toHaveLength(0);
  });
});
