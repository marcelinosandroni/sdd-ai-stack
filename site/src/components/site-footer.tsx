import { SITE } from "@/content";

export function SiteFooter() {
  return (
    <footer id="footer" className="border-t border-border-subtle">
      <div className="container-page flex flex-col gap-8 py-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <p className="font-headline-sm font-extrabold tracking-tight">
            SDD<span className="text-primary">.</span>AI
          </p>
          <p className="mt-3 text-body-sm text-text-secondary">
            Spec-Driven Development for AI agents. The rules are the product: everything else is
            scaffolding.
          </p>
          <p className="label-mono mt-6">
            © 2026 · Built by{" "}
            <a
              href={SITE.resume}
              target="_blank"
              rel="noreferrer noopener"
              className="tap-target text-text-secondary transition-colors hover:text-primary"
            >
              {SITE.author.name}
            </a>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <nav aria-label="Project">
            <p className="label-mono">Project</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              <li>
                <a
                  href="#what"
                  className="tap-target text-body-sm text-text-secondary hover:text-primary"
                >
                  What is SDD
                </a>
              </li>
              <li>
                <a
                  href="#install"
                  className="tap-target text-body-sm text-text-secondary hover:text-primary"
                >
                  Install
                </a>
              </li>
              <li>
                <a
                  href="#contribute"
                  className="tap-target text-body-sm text-text-secondary hover:text-primary"
                >
                  Contribute
                </a>
              </li>
            </ul>
          </nav>

          <nav aria-label="Code">
            <p className="label-mono">Code</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              <li>
                <a
                  href={SITE.repo}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="tap-target text-body-sm text-text-secondary hover:text-primary"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href={SITE.issues}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="tap-target text-body-sm text-text-secondary hover:text-primary"
                >
                  Issues
                </a>
              </li>
              <li>
                <a
                  href={SITE.npm}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="tap-target text-body-sm text-text-secondary hover:text-primary"
                >
                  npm
                </a>
              </li>
            </ul>
          </nav>

          <nav aria-label="Author">
            <p className="label-mono">Author</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              <li>
                <a
                  href={SITE.resume}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="tap-target text-body-sm text-text-secondary hover:text-primary"
                >
                  Resume
                </a>
              </li>
              <li>
                <a
                  href={SITE.author.github}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="tap-target text-body-sm text-text-secondary hover:text-primary"
                >
                  Profile
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SITE.author.email}`}
                  className="tap-target text-body-sm text-text-secondary hover:text-primary"
                >
                  Email
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
