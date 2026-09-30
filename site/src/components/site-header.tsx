import { NAV, SITE } from "@/content";

/**
 * Site header.
 *
 * On a phone the seven-item nav cannot fit beside the wordmark and the CTA, and
 * squeezing it into a horizontal scroller is worse than useless: a nav you have
 * to discover by swiping sideways is a nav most visitors never find. So below
 * `md` the links become a wrapped block under the bar — every destination is
 * visible at 390px without a gesture, and the whole page costs one extra row.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-surface-base/82 backdrop-blur-xl">
      <div className="container-page">
        <div className="flex h-16 items-center justify-between gap-4">
          <a
            href="/"
            className="tap-target font-headline-sm font-extrabold tracking-tight text-text-primary"
            aria-label="SDD AI Stack — home"
          >
            SDD<span className="text-primary">.</span>AI
          </a>

          <nav aria-label="Main" className="hidden min-w-0 items-center gap-1 md:flex lg:gap-2">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="tap-target whitespace-nowrap rounded-md px-3 text-body-sm text-text-secondary transition-colors hover:text-text-primary"
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
              className="button button-quiet hidden lg:inline-flex"
            >
              GitHub
            </a>
            <a href="#install" className="button button-primary">
              Get started
            </a>
          </div>
        </div>

        {/* The phone nav. Wrapped, not scrolled: see the note above. */}
        <nav
          aria-label="Main"
          className="flex flex-wrap gap-x-1 gap-y-1 border-t border-border-subtle py-2 md:hidden"
        >
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="tap-target whitespace-nowrap rounded-md px-2 text-body-sm text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
