import "server-only";
import { cache } from "react";

export interface AuthUser {
  id: string;
  email: string;
  role: "admin" | "member" | "banned";
}

/**
 * Demo session. Replace with Auth.js, Clerk, or your own.
 *
 * Reads a header so the template has a real, testable auth path without forcing
 * a session library on the first `npm run dev`:
 *   x-demo-user: member  → signed in as a member
 *   anything else        → signed out
 *
 * NEVER ship this. See SDD/stacks/next.md §7 — authorization belongs in the
 * data layer, closest to the database, not in the network boundary.
 */
export const getSession = cache(async (): Promise<AuthUser | null> => {
  const { headers } = await import("next/headers");
  const role = (await headers()).get("x-demo-user");

  if (role !== "admin" && role !== "member" && role !== "banned") {
    return null;
  }
  return { id: "user-1", email: `${role}@example.com`, role };
});

export class UnauthorizedError extends Error {
  readonly code = "UNAUTHORIZED";
}

export class ForbiddenError extends Error {
  readonly code = "FORBIDDEN";
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getSession();
  if (!user) {
    throw new UnauthorizedError("UNAUTHORIZED");
  }
  return user;
}

export async function requireRole(...roles: AuthUser["role"][]): Promise<AuthUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new ForbiddenError("FORBIDDEN");
  }
  return user;
}
