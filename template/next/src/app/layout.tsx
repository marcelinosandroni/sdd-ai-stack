import type { Metadata } from "next";
import { JetBrains_Mono, Manrope, Playfair_Display } from "next/font/google";
// Validated at boot: a bad DATABASE_URL or a short AUTH_SECRET fails the build
// instead of the first request. See SDD/stacks/next.md §7.
import "@/shared/server/env";
import "./globals.css";

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
  title: { default: "[NOME DO APP]", template: "%s | [NOME DO APP]" },
  description: "[DESCRIÇÃO DE UMA LINHA]",
  metadataBase: new URL("https://example.com"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body
        className={`${manrope.variable} ${jetbrainsMono.variable} ${playfair.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
