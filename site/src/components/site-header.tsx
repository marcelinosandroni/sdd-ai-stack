import { NAV, SITE } from "@/content";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-surface-base/82 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <a
          href="/"
          className="font-headline-sm font-extrabold tracking-tight text-text-primary"
          aria-label="SDD AI Stack — home"
        >
          SDD<span className="text-primary">.</span>AI
        </a>

        <nav className="nav-scroller -mx-1 flex items-center gap-1 overflow-x-auto px-1">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-md px-3 py-2 text-body-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <a
            href={SITE.repo}
            target="_blank"
            rel="noreferrer noopener"
            className="button button-quiet hidden sm:inline-flex"
          >
            GitHub
          </a>
          <a href="#install" className="button button-primary">
            Get started
          </a>
        </div>
      </div>
    </header>
  );
}
