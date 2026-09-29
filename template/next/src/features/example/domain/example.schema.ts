import { z } from "zod";

export const ExampleTitleSchema = z
  .string()
  .min(3, "Título precisa ter ao menos 3 caracteres")
  .max(120, "Título muito longo");

export const ExampleBodySchema = z
  .string()
  .min(10, "Conteúdo precisa ter ao menos 10 caracteres")
  .max(5000, "Conteúdo muito longo");

export const CreateExampleSchema = z.object({
  title: ExampleTitleSchema,
  body: ExampleBodySchema,
});

export type CreateExampleInput = z.infer<typeof CreateExampleSchema>;
