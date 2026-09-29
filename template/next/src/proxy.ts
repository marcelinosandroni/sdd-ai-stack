import { type NextRequest, NextResponse } from "next/server";

/**
 * Network boundary. NÃO é fronteira de segurança (ver SDD/NEXT.md §7).
 * Autorização real vive na camada de dado (actions/queries).
 */
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);

  // defense-in-depth: remove o header interno que o CVE-2025-29927 explorava
  headers.delete("x-middleware-subrequest");
  headers.set("x-request-id", crypto.randomUUID());

  const response = NextResponse.next({ request: { headers } });
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  return response;
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};
