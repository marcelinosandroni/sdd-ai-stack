import { describe, expect, it } from "vitest";

import { createExample } from "@/features/example/application/create-example.usecase";
import type { Example } from "@/features/example/domain/example.schema";
import type { IExampleRepository } from "@/features/example/domain/IExampleRepository";

/**
 * The repository is an object literal, not a mock.
 *
 * There is no framework here, no `vi.fn()`, no reset: the port has two methods, so
 * the whole implementation is two lines. A test double that needs a framework to
 * express "save this and return it" is a sign the port is too wide.
 */
function repositoryStub(overrides: Partial<IExampleRepository> = {}): IExampleRepository {
  const saved: Example[] = [];

  return {
    list: async () => saved,
    save: async (example) => {
      saved.push(example);
      return example;
    },
    ...overrides,
  };
}

describe("createExample", () => {
  it("returns the saved example when the input is valid", async () => {
    const repository = repositoryStub();

    const result = await createExample(repository, { title: "First slice", notes: "" });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected success");

    expect(result.example.title).toBe("First slice");
    expect(result.example.id).toBeTruthy();
    expect(Number.isNaN(Date.parse(result.example.createdAt))).toBe(false);
  });

  it("trims the title, because the schema is the only definition of valid", async () => {
    const result = await createExample(repositoryStub(), {
      title: "  padded  ",
      notes: "",
    });

    if (!result.ok) throw new Error("expected success");
    expect(result.example.title).toBe("padded");
  });

  it("rejects a title below the minimum length with the schema's own message", async () => {
    const result = await createExample(repositoryStub(), { title: "ab", notes: "" });

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected failure");

    // The message is the schema's, not the use case's. If this test ever needs
    // rewriting because a copy changed, the copy was the bug.
    expect(result.error).toBe("Give it at least 3 characters");
  });

  it("never writes when the input is invalid", async () => {
    let writes = 0;
    const repository = repositoryStub({
      save: async (example) => {
        writes += 1;
        return example;
      },
    });

    await createExample(repository, { title: "", notes: "" });

    expect(writes).toBe(0);
  });

  it("defaults notes to an empty string rather than undefined", async () => {
    const result = await createExample(repositoryStub(), { title: "No notes" });

    if (!result.ok) throw new Error("expected success");
    expect(result.example.notes).toBe("");
  });
});
