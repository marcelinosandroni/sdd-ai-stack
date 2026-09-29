import "server-only";
import { z } from "zod";

/**
 * Env schema, parsed once at module load. Anything wrong here throws at boot
 * instead of failing later in production with a confusing error.
 *
 * Imported by the root layout so `next build` and `next dev` both validate.
 */
const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().optional(),
  AUTH_SECRET: z.string().min(16).optional(),
});

export type Env = z.infer<typeof EnvSchema>;

export const env: Env = EnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
});
