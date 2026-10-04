import { z } from "zod";

/**
 * The domain owns the rule; the application owns the orchestration; the UI owns
 * neither.
 *
 * A schema in `domain/` is the single definition of what an Example is. The form
 * parses into it, the use case accepts it, and the repository stores it — so
 * "valid" means one thing in all three places instead of three things that drift.
 */
export const exampleSchema = z.object({
  title: z.string().trim().min(3, "Give it at least 3 characters").max(80),
  notes: z.string().trim().max(280).default(""),
});

export type ExampleInput = z.input<typeof exampleSchema>;
export type Example = z.output<typeof exampleSchema> & {
  id: string;
  createdAt: string;
};
