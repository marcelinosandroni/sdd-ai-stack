import type { MetadataRoute } from "next";

import { SITE } from "@/content";

/**
 * robots.txt.
 *
 * The point is the `Sitemap:` line. Everything else here is the default a crawler
 * assumes, written out so the file is self-explanatory to whoever opens it in six
 * months.
 *
 * `host` is the canonical origin, same string as `SITE.url` — the sitemap and the
 * robots file have to agree, and two hand-typed copies of a hostname is how they
 * stop agreeing.
 */
/**
 * The site is `output: "export"`, so every route must be prerenderable at build
 * time. Without this Next refuses to build, and the failure names the route rather
 * than the config — so the reason is recorded here instead.
 */
export const dynamic = "force-static";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
