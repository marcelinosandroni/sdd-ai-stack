import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { JetBrains_Mono, Manrope, Playfair_Display } from "next/font/google";
import { SITE } from "@/content";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--msd-font-manrope",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--msd-font-jetbrains",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--msd-font-playfair",
  display: "swap",
});

const DESCRIPTION =
  "Spec-Driven Development for AI agents: one command, one Next.js 16 template, 25 rule files and gates that cannot be bypassed. Open source, by Marcelino Sandroni Dias.";

const { OG_IMAGE, OG_APPLE_ICON, OG_ICON, TWITTER_IMAGE, structuredData } = await import(
  "./seo"
);

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "SDD AI Stack | Spec-Driven Development for AI agents",
    template: "%s | SDD AI Stack",
  },
  description: DESCRIPTION,
  applicationName: "SDD AI Stack",
  authors: [{ name: "Marcelino Sandroni Dias", url: "https://marcelinosandroni.com" }],
  creator: "Marcelino Sandroni Dias",
  publisher: "Marcelino Sandroni Dias",
  keywords: [
    "spec-driven development",
    "SDD",
    "AI agents",
    "agentic development",
    "Claude Code",
    "Cursor",
    "Copilot",
    "Windsurf",
    "Cline",
    "Next.js 16",
    "React 19",
    "vertical slices",
    "hexagonal architecture",
    "rules as code",
    "TDD",
    "create-sdd-ai-stack",
  ],
  alternates: { canonical: "/" },
  // Search-console ownership. Read from the environment, so the token is one Vercel
  // variable away and never a commit — and absent by default, which means the whole
  // block disappears rather than emitting a placeholder Google would reject.
  //
  // Everything else on this page asks to be found; this is the one part that only the
  // owner can grant. Set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION (and the Bing one if you
  // use Webmaster Tools) after claiming the property.
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? {
        verification: {
          google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
          ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
            ? { other: { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION } }
            : {}),
        },
      }
    : {}),
  icons: {
    icon: [{ url: OG_ICON.url, sizes: OG_ICON.sizes, type: "image/png" }],
    apple: [{ url: OG_APPLE_ICON.url, sizes: OG_APPLE_ICON.sizes, type: "image/png" }],
  },
  // Every one of these is a platform deciding what to show before the page renders.
  // `images` is the one that was missing: without it LinkedIn and WhatsApp render a
  // title on an empty rectangle, and that rectangle is the share.
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE.name,
    title: "SDD AI Stack | Spec-Driven Development for AI agents",
    description: DESCRIPTION,
    url: SITE.url,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "SDD AI Stack | Spec-Driven Development for AI agents",
    description: DESCRIPTION,
    images: [TWITTER_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "developer",
};

export const viewport = {
  themeColor: "#0a0d12",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${jetbrains.variable} ${playfair.variable}`}
    >
      <body>
        {/*
          Page views, and nothing else. The Analytics component renders a
          script and no markup, so it does not change the layout, and it
          collects no data unless the deployment has the Vercel Web Analytics
          property enabled — which is a deliberate step, not a default.
        */}
        <Analytics />

        {/*
          Structured data for the crawlers that read it and the platforms that do not:
          LinkedIn reads Open Graph, Google reads JSON-LD, and both read the same
          version, the same name and the same person. Assembled in `./seo` so the page
          and the data cannot disagree.

          The rule being suppressed is right in general. This is the case it exists
          for: Next's own JSON-LD guide is built on `dangerouslySetInnerHTML`, and
          there is no other way to put a JSON-LD graph in a document. The payload is
          `JSON.stringify` of a literal in `./seo` — no user input, nothing to inject —
          and the `<` is escaped below so the payload cannot close this tag early.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData()).replace(/</g, "\\u003c"),
          }}
        />

        {children}
      </body>
    </html>
  );
}
