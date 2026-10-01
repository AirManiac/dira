import Link from "next/link";

const navigation = [
  { label: "Day 01", href: "/day-1" },
  { label: "Day 02", href: "/day-2" },
  { label: "Day 03", href: "/day-3" },
  { label: "Benchmarks", href: "/benchmarks" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--color-line)]">
      <div className="container-shell flex h-20 items-center justify-between gap-8">
        {/* Brand */}
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-3"
          aria-label="Link Performance Lab home"
        >
          <span className="flex size-7 items-center justify-center border border-[var(--color-ink)] text-[10px] font-medium tracking-[-0.04em]">
            LP
          </span>

          <span className="hidden text-sm font-medium tracking-[-0.02em] sm:block">
            Link Performance Lab
          </span>
        </Link>

        {/* Navigation */}
        <nav
          className="hidden items-center gap-7 md:flex"
          aria-label="Primary navigation"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative py-2 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-[var(--color-ink-muted)] transition-colors duration-200 hover:text-[var(--color-ink)]"
            >
              {item.label}

              <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-[var(--color-ink)] transition-transform duration-200 group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        {/* External link */}
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="group flex shrink-0 items-center gap-2 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-[var(--color-ink-muted)] transition-colors duration-200 hover:text-[var(--color-ink)]"
        >
          <span className="hidden sm:inline">GitHub</span>

          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
            fill="none"
          >
            <path
              d="M4 12L12 4M5 4h7v7"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="square"
            />
          </svg>
        </a>
      </div>
    </header>
  );
}