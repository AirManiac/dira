"use client";

import { FormEvent, useState } from "react";

interface RedirectResult {
  slug: string;
  destination: string;
  responseTime: number;
}

export function RedirectDemo() {
  const [slug, setSlug] = useState("github");
  const [result, setResult] = useState<RedirectResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedSlug = slug.trim();

    if (!normalizedSlug || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    const start = performance.now();

    try {
      const response = await fetch(
        `/api/benchmark/redirect?slug=${encodeURIComponent(
          normalizedSlug,
        )}&iterations=1`,
        {
          cache: "no-store",
        },
      );

      const elapsed = performance.now() - start;

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ??
            data.error ??
            "Unable to resolve this link.",
        );
      }

      const benchmark = data.benchmark;

      setResult({
        slug: benchmark.slug,
        destination: "Resolved successfully",
        responseTime: elapsed,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while resolving the link.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="container-shell pb-24 sm:pb-32">
      <div className="border-y border-[var(--color-line)]">
        {/* Header */}
        <div className="border-b border-[var(--color-line)] px-6 py-6 sm:px-8">
          <p className="eyebrow text-[var(--color-accent)]">
            Try the redirect
          </p>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-2xl font-medium tracking-[-0.03em]">
              Resolve a link at the edge.
            </h2>

            <p className="max-w-md text-sm leading-6 text-[var(--color-ink-muted)] sm:text-right">
              Enter a seeded slug and measure the request from
              this browser.
            </p>
          </div>
        </div>

        {/* Demo */}
        <div className="grid lg:grid-cols-[1fr_0.8fr]">
          {/* Form */}
          <div className="border-b border-[var(--color-line)] p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
            <form onSubmit={handleSubmit}>
              <label
                htmlFor="redirect-slug"
                className="metric-label"
              >
                Link slug
              </label>

              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <div className="flex min-w-0 flex-1 items-center border border-[var(--color-line-strong)] bg-[var(--color-surface)] transition-colors focus-within:border-[var(--color-ink)]">
                  <span className="shrink-0 pl-4 font-mono text-sm text-[var(--color-ink-subtle)]">
                    /r/
                  </span>

                  <input
                    id="redirect-slug"
                    value={slug}
                    onChange={(event) =>
                      setSlug(event.target.value)
                    }
                    placeholder="github"
                    autoComplete="off"
                    spellCheck={false}
                    className="min-w-0 flex-1 bg-transparent px-2 py-4 font-mono text-sm outline-none placeholder:text-[var(--color-ink-subtle)]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !slug.trim()}
                  className="shrink-0 border border-[var(--color-ink)] bg-[var(--color-ink)] px-6 py-4 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-[var(--color-paper)] transition-opacity duration-200 hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isLoading ? "Resolving..." : "Resolve"}
                </button>
              </div>
            </form>

            {/* Request preview */}
            <div className="mt-10 border-t border-[var(--color-line)] pt-6">
              <p className="metric-label">Request</p>

              <code className="mt-3 block break-all text-sm text-[var(--color-ink-muted)]">
                GET /r/{slug.trim() || "..."}
              </code>
            </div>

            {error ? (
              <div className="mt-6 border-l-2 border-[var(--color-error)] pl-4">
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-[var(--color-error)]">
                  Resolution failed
                </p>

                <p className="mt-2 text-sm leading-6 text-[var(--color-ink-muted)]">
                  {error}
                </p>
              </div>
            ) : null}
          </div>

          {/* Result */}
          <div className="flex min-h-[280px] flex-col justify-between p-6 sm:p-8 lg:p-10">
            <div>
              <p className="metric-label">Result</p>

              {result ? (
                <div className="mt-8">
                  <div className="flex items-baseline gap-2">
                    <span className="metric-value text-5xl sm:text-6xl">
                      {result.responseTime.toFixed(1)}
                    </span>

                    <span className="font-mono text-sm text-[var(--color-ink-muted)]">
                      ms
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
                    Browser-to-benchmark request time
                  </p>

                  <div className="mt-8 border-t border-[var(--color-line)] pt-5">
                    <p className="metric-label">Resolved slug</p>

                    <p className="mt-2 font-mono text-sm">
                      /r/{result.slug}
                    </p>
                  </div>

                  <div className="mt-5">
                    <p className="metric-label">Status</p>

                    <p className="mt-2 flex items-center gap-2 font-mono text-xs text-[var(--color-accent)]">
                      <span className="size-1.5 rounded-full bg-[var(--color-accent)]" />
                      LINK FOUND
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-8">
                  <span className="metric-value text-5xl text-[var(--color-ink-subtle)] sm:text-6xl">
                    —
                  </span>

                  <p className="mt-3 max-w-xs text-sm leading-6 text-[var(--color-ink-muted)]">
                    Run the experiment to see the measured
                    request time.
                  </p>
                </div>
              )}
            </div>

            <p className="mt-10 border-t border-[var(--color-line)] pt-5 font-mono text-[0.625rem] uppercase tracking-[0.08em] text-[var(--color-ink-subtle)]">
              Benchmark endpoint · 1 iteration
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}