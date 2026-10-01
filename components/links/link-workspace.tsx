"use client";

import { useState } from "react";

interface LinkWorkspaceProps {
  children?: React.ReactNode;
}

export function LinkWorkspace({
  children,
}: LinkWorkspaceProps) {
  const [isOnline] = useState(true);

  return (
    <main className="min-h-screen bg-[#0d0d0c] text-[#f2f1ed]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#292927]">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="flex items-center gap-2.5 transition-opacity duration-200 hover:opacity-60"
              aria-label="Link Performance Lab"
            >
              <span className="flex size-6 items-center justify-center border border-[#f2f1ed] font-mono text-[9px] font-medium tracking-[-0.05em]">
                LP
              </span>

              <span className="hidden text-xs font-medium tracking-[-0.02em] sm:block">
                Link Performance Lab
              </span>
            </a>

            <span
              aria-hidden="true"
              className="text-[#444440]"
            >
              /
            </span>

            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#777771]">
              Links
            </span>
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden items-center gap-2 sm:flex">
              <span
                aria-hidden="true"
                className={[
                  "size-1.5 rounded-full",
                  isOnline
                    ? "bg-[#6d9b82]"
                    : "bg-[#a64a43]",
                ].join(" ")}
              />

              <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777771]">
                {isOnline ? "System online" : "System offline"}
              </span>
            </div>

            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777771] transition-colors duration-200 hover:text-[#f2f1ed]"
            >
              GitHub ↗
            </a>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex flex-1 flex-col">
          <section className="border-b border-[#292927] py-8 sm:py-10">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#6d9b82]">
                  Link management / analytics
                </p>

                <h1 className="mt-3 max-w-3xl font-serif text-4xl font-normal leading-[0.95] tracking-[-0.045em] text-[#f2f1ed] sm:text-5xl lg:text-6xl">
                  Your links.
                  <br />
                  Measured at the edge.
                </h1>
              </div>

              <p className="max-w-sm text-sm leading-6 text-[#777771] lg:pb-1 lg:text-right">
                Create short links, track every click, and
                inspect the performance data behind them.
              </p>
            </div>
          </section>

          {children}
        </div>

        {/* Footer status bar */}
        <footer className="flex min-h-12 shrink-0 items-center justify-between border-t border-[#292927]">
          <div className="flex items-center gap-4 font-mono text-[9px] uppercase tracking-[0.1em] text-[#555550]">
            <span>Link Performance Lab</span>

            <span
              aria-hidden="true"
              className="hidden h-3 w-px bg-[#292927] sm:block"
            />

            <span className="hidden sm:inline">
              Performance experiments
            </span>
          </div>

          <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#555550]">
            v0.1.0
          </div>
        </footer>
      </div>
    </main>
  );
}