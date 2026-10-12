import type { MetadataRoute } from "next";

import { SITE } from "@/content";

import { OG_APPLE_ICON, OG_ICON } from "./seo";

/**
 * The web app manifest.
 *
 * Not about install prompts — this page has nothing to run offline. It is about
 * identity: the manifest is where the name, the colours and the icons are stated for a
 * platform that asks before the page renders, which is increasingly true of shared
 * links. WhatsApp reads it when it decides what a link is.
 *
 * `start_url` is `/` with no query string, because a share that arrives with tracking
 * parameters should land on the page a visitor came for.
 */
/**
 * The site is `output: "export"`, so every route must be prerenderable at build
 * time. Without this Next refuses to build, and the failure names the route rather
 * than the config — so the reason is recorded here instead.
 */
export const dynamic = "force-static";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — Spec-Driven Development for AI agents`,
    short_name: SITE.name,
    description:
      "Rules, a design system and two templates for Spec-Driven Development with AI agents. One command, with gates that fail.",
    start_url: "/",
    display: "standalone",
    background_color: "#0A0D12",
    theme_color: "#0A0D12",
    icons: [
      { src: OG_ICON.url, sizes: OG_ICON.sizes, type: "image/png" },
      { src: OG_APPLE_ICON.url, sizes: OG_APPLE_ICON.sizes, type: "image/png" },
    ],
    // Not a PWA, and saying so is better than pretending: no service worker, no
    // offline mode, no install prompt.
    categories: ["developer", "productivity"],
  };
}
