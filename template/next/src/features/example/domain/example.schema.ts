import { z } from "zod";

export const ExampleTitleSchema = z
  .string()
  .trim()
  .min(3, "Title needs at least 3 characters")
  .max(120, "Title is too long");

export const ExampleBodySchema = z
  .string()
  .trim()
  .min(10, "Content needs at least 10 characters")
  .max(5000, "Content is too long");

export const CreateExampleSchema = z.object({
  title: ExampleTitleSchema,
  body: ExampleBodySchema,
});

export type CreateExampleInput = z.infer<typeof CreateExampleSchema> & {
  ownerId: string;
};
