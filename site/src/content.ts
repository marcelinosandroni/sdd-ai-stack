/**
 * The published version, shown in the hero and asserted against the root
 * `package.json` by `tests/site-version.test.mjs`.
 *
 * It lives here rather than being imported from `../../package.json` because Vercel
 * builds the site with `site/` as its root: the repository's `package.json` is not in
 * that build context, so an import would fail the deploy rather than the test.
 *
 * The value was `v0.2.0` while npm was already at `0.6.0`, which means a page that
 * lies about its own version — on the one page whose whole argument is "the tool
 * verifies what it states". `npm run version:sync` rewrites it and the guard fails
 * the build if anyone forgets.
 */
export const VERSION = "0.6.0";

/**
 * The Matrix palette, for the share card.
 *
 * It lives here and not as a read of `themes/matrix/tokens.css` for a reason that
 * matters: Vercel builds this site with `site/` as its root, so that file is not in
 * the build context. Reading it would work locally and silently fall back in
 * production — the same design system rendered in different colours depending on where
 * it was built, and the only place anyone would see it is somebody else's timeline.
 *
 * So the values are stated here and `tests/site-seo.test.mjs` asserts each one against
 * the theme file. That is one source of truth with a mechanical link, and a palette
 * change fails a test instead of drifting a card nobody can edit after the fact.
 */
export const OG_TOKENS = {
  surfaceBase: "#0A0D12",
  textPrimary: "#F4F1EA",
  textSecondary: "#94A3B8",
  textTertiary: "#56657A",
  borderSubtle: "#1E2633",
  primary: "#BAF336",
} as const;

export const SITE = {
  name: "SDD AI Stack",
  package: "create-sdd-ai-stack",
  /** Absolute origin. Used for canonical URLs, the sitemap and `metadataBase`. */
  url: "https://sdd.marcelinosandroni.com",
  repo: "https://github.com/marcelinosandroni/sdd-ai-stack",
  resume: "https://marcelinosandroni.com",
  npm: "https://www.npmjs.com/package/create-sdd-ai-stack",
  issues: "https://github.com/marcelinosandroni/sdd-ai-stack/issues",
  discussions: "https://github.com/marcelinosandroni/sdd-ai-stack/discussions",
  author: {
    name: "Marcelino Sandroni Dias",
    title: "Senior Software Engineer & Tech Lead",
    email: "marcelino.sandroni@gmail.com",
    github: "https://github.com/marcelinosandroni",
    linkedin: "https://www.linkedin.com/in/marcelinosandroni",
  },
} as const;

export const NAV = [
  { href: "/#what", label: "What is SDD" },
  { href: "/#why", label: "Why" },
  { href: "/#practice", label: "Practices" },
  { href: "/#ai", label: "AI" },
  { href: "/#install", label: "Install" },
  { href: "/#author", label: "Author" },
  { href: "/#contribute", label: "Contribute" },
] as const;
