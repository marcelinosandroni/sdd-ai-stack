import type { Metadata } from "next";
import { JetBrains_Mono, Manrope, Playfair_Display } from "next/font/google";

import { MatrixTerminal } from "@/shared/ui/terminal/matrix-terminal";
// Validated at boot: a bad DATABASE_URL or a short AUTH_SECRET fails the build
// instead of the first request. See SDD/stacks/next.md §7.
import "@/shared/server/env";
import "./globals.css";
import "@/shared/ui/terminal/matrix-terminal.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "[APP NAME]", template: "%s | [APP NAME]" },
  description: "[ONE-LINE DESCRIPTION]",
  metadataBase: new URL("https://example.com"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // The opener reads `lang` from here, so the message arrives in the language the
    // page is already in. Change one and both change together — which is the whole
    // point of not hardcoding a locale inside the component.
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body
        className={`${manrope.variable} ${jetbrainsMono.variable} ${playfair.variable} antialiased`}
      >
        {children}

        {/*
          The design system's opener.

          No `onSend` here on purpose: this is a Server Component, and a plain
          function prop cannot cross the server/client boundary. `onSend` is optional,
          so the terminal runs without it and simply goes nowhere.

          To wire it for real, pass a Server Action:

              async function send(message: string) { "use server"; … }
              <MatrixTerminal onSend={send} />

          The component does not change. That is the test of an integration point.
        */}
        <MatrixTerminal />
      </body>
    </html>
  );
}
