import "server-only";
import { cache } from "react";

export interface AuthUser {
  id: string;
  email: string;
  role: "admin" | "member" | "banned";
}

/**
 * Substitua pela sessão real (Auth.js, Clerk, etc).
 * Autorização NUNCA sai daqui — ver SDD/NEXT.md §7.
 */
export const getSession = cache(async (): Promise<AuthUser | null> => {
  return null;
});

export async function requireUser(): Promise<AuthUser> {
  const user = await getSession();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireRole(...roles: AuthUser["role"][]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}
