import { type NextRequest, NextResponse } from "next/server";

/**
 * Network boundary. NOT a security boundary — see SDD/stacks/next.md §7.
 * Real authorization lives in the data layer (actions and queries), closest to
 * the database. This file exists for the cheap rejections and the headers.
 *
 * Next.js 16 renamed `middleware.ts` to `proxy.ts`. A file named
 * `middleware.ts` is silently ignored at build time.
 */

/** Applied to EVERY response. Extracted so no branch can accidentally skip it. */
function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}

export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);

  // Defense in depth against CVE-2025-29927: a forged `x-middleware-subrequest`
  // made older Next versions skip this function entirely. Strip it so nothing
  // downstream can read a value that looks trusted.
  headers.delete("x-middleware-subrequest");
  headers.set("x-request-id", crypto.randomUUID());

  // The auth gate would live here:
  //   if (pathname.startsWith("/app") && !isSignedIn(request)) {
  //     return NextResponse.redirect(new URL("/login", request.url));
  //   }
  return withSecurityHeaders(NextResponse.next({ request: { headers } }));
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};
