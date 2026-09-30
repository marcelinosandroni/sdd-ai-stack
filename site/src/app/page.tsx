import { Ai } from "@/components/ai";
import { Author } from "@/components/author";
import { Contribute } from "@/components/contribute";
import { Hero } from "@/components/hero";
import { Install } from "@/components/install";
import { Practice } from "@/components/practice";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Toolkit } from "@/components/toolkit";
import { What } from "@/components/what";
import { Why } from "@/components/why";

export default function HomePage() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-100 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-body-sm focus:font-semibold focus:text-on-primary"
      >
        Skip to main content
      </a>
      <SiteHeader />
      <main id="main">
        <Hero />
        <What />
        <Why />
        <Practice />
        <Ai />
        <Install />
        <Toolkit />
        <Author />
        <Contribute />
      </main>
      <SiteFooter />
    </>
  );
}
