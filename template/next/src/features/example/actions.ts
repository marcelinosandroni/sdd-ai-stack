"use server";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { createExampleUseCases } from "./container";
import { CreateExampleSchema } from "./domain/example.schema";

export type ExampleActionState = {
  ok: boolean;
  errors?: Record<string, string[]>;
  error?: string;
};

export async function createExampleAction(
  _prev: ExampleActionState,
  formData: FormData,
): Promise<ExampleActionState> {
  // 1. AUTHENTICATION (see SDD/stacks/next.md §5)
  // const user = await requireUser();

  // 2. VALIDATION — Zod on the server is the only source of truth
  const parsed = CreateExampleSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { ok: false, errors: z.flattenError(parsed.error).fieldErrors };
  }

  try {
    // 3. MUTATION via the use case
    const { createExample } = createExampleUseCases();
    await createExample.execute(parsed.data);

    // 4. CACHE
    updateTag("examples");
    revalidatePath("/home");

    return { ok: true };
  } catch {
    return { ok: false, error: "Não foi possível criar. Tente novamente." };
  }
}
