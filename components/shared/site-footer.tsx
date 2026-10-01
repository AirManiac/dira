import Link from "next/link";

const VERSION = "v0.1.0";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--color-line)]">
      <div className="container-shell flex min-h-24 flex-col justify-between gap-6 py-6 sm:flex-row sm:items-center">
        {/* Project context */}
        <div className="flex flex-col gap-1.5">
          <Link
            href="/"
            className="text-sm font-medium tracking-[-0.02em] transition-opacity duration-200 hover:opacity-60"
          >
            Link Performance Lab
          </Link>

          <p className="font-mono text-[0.625rem] uppercase tracking-[0.08em] text-[var(--color-ink-subtle)]">
            Open-source performance experiments · {VERSION}
          </p>
        </div>

        {/* Open-source context */}
        <div className="flex items-center gap-5 font-mono text-[0.625rem] uppercase tracking-[0.08em] text-[var(--color-ink-subtle)]">
          <span>MIT Licensed</span>

          <span
            aria-hidden="true"
            className="h-3 w-px bg-[var(--color-line)]"
          />

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--color-ink-muted)] transition-colors duration-200 hover:text-[var(--color-ink)]"
          >
            GitHub ↗
          </a>
        </div>
      </div>
    </footer>
  );
}