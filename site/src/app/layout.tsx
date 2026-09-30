import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { JetBrains_Mono, Manrope, Playfair_Display } from "next/font/google";
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

const SITE = "https://sdd.marcelinosandroni.com";
const DESCRIPTION =
  "Spec-Driven Development for AI agents: one command, one Next.js 16 template, 25 rule files and gates that cannot be bypassed. Open source, by Marcelino Sandroni Dias.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
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
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "SDD AI Stack",
    title: "SDD AI Stack | Spec-Driven Development for AI agents",
    description: DESCRIPTION,
    url: SITE,
  },
  twitter: {
    card: "summary_large_image",
    title: "SDD AI Stack | Spec-Driven Development for AI agents",
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
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
        {children}
      </body>
    </html>
  );
}
