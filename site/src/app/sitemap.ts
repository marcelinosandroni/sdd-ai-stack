import type { MetadataRoute } from "next";

import { SITE } from "@/content";

/**
 * The sitemap.
 *
 * There was none, which meant Google was told about this site only by whatever it
 * could guess from links. A sitemap is not a ranking trick; it is how a crawler learns
 * that a URL exists.
 *
 * One entry, on purpose. The page has sections, and `/#what` looks like a second URL
 * worth submitting — but a fragment is not a document: it is the same document, and
 * search engines are explicit that fragments do not belong in a sitemap. Listing them
 * would have made the file look thorough while telling a crawler the site has five
 * pages when it has one.
 *
 * `lastModified` is omitted for the same reason it is not `Date.now()`: a value that
 * changes on every deploy teaches a crawler to ignore the field.
 */
export const ROUTES = [{ path: "/", changefreq: "weekly" as const, priority: 1 }] as const;

/** `output: "export"` — see the same note in `robots.ts`. */
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map(({ path, changefreq, priority }) => ({
    url: `${SITE.url}${path}`,
    changefreq,
    priority,
  }));
}
