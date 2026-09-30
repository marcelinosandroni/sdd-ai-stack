"use server";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { ForbiddenError, requireUser, UnauthorizedError } from "@/shared/server/auth";
import { createExampleUseCases } from "./container";
import { CreateExampleSchema } from "./domain/example.schema";

export type ExampleActionState = {
  ok: boolean;
  errors?: Record<string, string[]>;
  error?: string;
};

/**
 * A Server Action is a PUBLIC HTTP endpoint. The client is untrusted, so every
 * step happens here in a fixed order:
 *
 *   1. authentication    who is calling
 *   2. authorization     may they do this
 *   3. validation        is the input well-formed
 *   4. mutation          through a use case, never raw infra
 *   5. cache             invalidate what just changed
 *
 * Errors return state, they do not throw: throwing sends the user to
 * `error.tsx` instead of showing them what went wrong.
 */
export async function createExampleAction(
  _prev: ExampleActionState,
  formData: FormData,
): Promise<ExampleActionState> {
  try {
    // 1. AUTHENTICATION
    const user = await requireUser();

    // 2. AUTHORIZATION
    if (user.role === "banned") {
      throw new ForbiddenError("FORBIDDEN");
    }

    // 3. VALIDATION — Zod on the server is the only source of truth
    const parsed = CreateExampleSchema.safeParse({
      title: formData.get("title"),
      body: formData.get("body"),
    });

    if (!parsed.success) {
      return { ok: false, errors: z.flattenError(parsed.error).fieldErrors };
    }

    // 4. MUTATION via the use case
    const { createExample } = createExampleUseCases();
    await createExample.execute({ ...parsed.data, ownerId: user.id });

    // 5. CACHE — read-your-writes for interactive UI
    updateTag("examples");
    revalidatePath("/app");

    return { ok: true };
  } catch (cause) {
    if (cause instanceof UnauthorizedError) {
      return { ok: false, error: "Sign in to create an example." };
    }
    if (cause instanceof ForbiddenError) {
      return { ok: false, error: "Access denied." };
    }
    return { ok: false, error: "Could not create the example. Try again." };
  }
}
