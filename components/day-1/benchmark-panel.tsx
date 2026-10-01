"use client";

import { useState } from "react";

interface BenchmarkResult {
  iterations: number;
  slug: string;
  average: number;
  min: number;
  max: number;
  p50: number;
  p95: number;
  p99: number;
}

interface BenchmarkResponse {
  success?: boolean;
  benchmark?: BenchmarkResult;
  error?: string;
  message?: string;
}

const metrics = [
  { key: "average", label: "Average" },
  { key: "min", label: "Minimum" },
  { key: "p50", label: "p50" },
  { key: "p95", label: "p95" },
  { key: "p99", label: "p99" },
  { key: "max", label: "Maximum" },
] as const;

export function BenchmarkPanel() {
  const [slug, setSlug] = useState("github");
  const [iterations, setIterations] = useState("100");
  const [result, setResult] = useState<BenchmarkResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runBenchmark() {
    const normalizedSlug = slug.trim();

    if (!normalizedSlug || isRunning) {
      return;
    }

    const requestedIterations = Number(iterations);

    if (
      !Number.isFinite(requestedIterations) ||
      requestedIterations < 1
    ) {
      setError("Iterations must be a positive number.");
      return;
    }

    setIsRunning(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        `/api/benchmark/redirect?slug=${encodeURIComponent(
          normalizedSlug,
        )}&iterations=${Math.min(
          Math.floor(requestedIterations),
          10_000,
        )}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const data: BenchmarkResponse = await response.json();

      if (!response.ok || !data.success || !data.benchmark) {
        throw new Error(
          data.message ??
            data.error ??
            "Benchmark failed.",
        );
      }

      setResult(data.benchmark);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to run benchmark.",
      );
    } finally {
      setIsRunning(false);
    }
  }

  const target = 10;
  const targetMetric = result?.p95 ?? null;
  const isUnderTarget =
    targetMetric !== null && targetMetric < target;

  return (
    <section className="container-shell pb-24 sm:pb-32">
      <div className="border-y border-[var(--color-line)]">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-[var(--color-line)] px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-[var(--color-accent)]">
                Benchmark
              </p>

              <h2 className="mt-2 text-xl font-medium tracking-[-0.025em] sm:text-2xl">
                Measure the redirect path.
              </h2>
            </div>

            <p className="max-w-md text-sm leading-6 text-[var(--color-ink-muted)] sm:text-right">
              Repeatedly measures the application-side lookup
              path after a warm-up request.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="grid border-b border-[var(--color-line)] lg:grid-cols-[1fr_auto]">
          <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:p-8">
            <label className="flex min-w-0 flex-1 flex-col gap-2">
              <span className="metric-label">Slug</span>

              <div className="flex items-center border border-[var(--color-line-strong)] bg-[var(--color-surface)]">
                <span className="pl-3 font-mono text-sm text-[var(--color-ink-subtle)]">
                  /r/
                </span>

                <input
                  value={slug}
                  onChange={(event) =>
                    setSlug(event.target.value)
                  }
                  disabled={isRunning}
                  className="min-w-0 flex-1 bg-transparent px-2 py-3 font-mono text-sm outline-none placeholder:text-[var(--color-ink-subtle)] disabled:opacity-50"
                  placeholder="github"
                  spellCheck={false}
                />
              </div>
            </label>

            <label className="flex w-full flex-col gap-2 sm:w-40">
              <span className="metric-label">Iterations</span>

              <input
                type="number"
                min="1"
                max="10000"
                value={iterations}
                onChange={(event) =>
                  setIterations(event.target.value)
                }
                disabled={isRunning}
                className="border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-3 py-3 font-mono text-sm outline-none disabled:opacity-50"
              />
            </label>

            <button
              type="button"
              onClick={runBenchmark}
              disabled={isRunning || !slug.trim()}
              className="h-[46px] shrink-0 border border-[var(--color-ink)] bg-[var(--color-ink)] px-6 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-[var(--color-paper)] transition-opacity duration-200 hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isRunning ? "Running..." : "Run benchmark"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error ? (
          <div className="border-b border-[var(--color-line)] px-6 py-5 sm:px-8">
            <div className="border-l-2 border-[var(--color-error)] pl-4">
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-[var(--color-error)]">
                Benchmark failed
              </p>

              <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                {error}
              </p>
            </div>
          </div>
        ) : null}

        {/* Results */}
        <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
          {/* Primary result */}
          <div className="border-b border-[var(--color-line)] p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
            <p className="metric-label">p95 resolution</p>

            {result ? (
              <>
                <div className="mt-6 flex items-baseline gap-3">
                  <span className="metric-value text-6xl leading-none sm:text-7xl">
                    {result.p95.toFixed(2)}
                  </span>

                  <span className="font-mono text-sm text-[var(--color-ink-muted)]">
                    ms
                  </span>
                </div>

                <div className="mt-5 flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={[
                      "size-1.5 rounded-full",
                      isUnderTarget
                        ? "bg-[var(--color-accent)]"
                        : "bg-[var(--color-error)]",
                    ].join(" ")}
                  />

                  <span
                    className={[
                      "font-mono text-[0.625rem] uppercase tracking-[0.08em]",
                      isUnderTarget
                        ? "text-[var(--color-accent)]"
                        : "text-[var(--color-error)]",
                    ].join(" ")}
                  >
                    {isUnderTarget
                      ? "Under 10ms target"
                      : "Above 10ms target"}
                  </span>
                </div>
              </>
            ) : (
              <>
                <p className="metric-value mt-6 text-6xl leading-none text-[var(--color-ink-subtle)] sm:text-7xl">
                  —
                </p>

                <p className="mt-5 max-w-sm text-sm leading-6 text-[var(--color-ink-muted)]">
                  Run the benchmark to measure the redirect
                  resolution distribution.
                </p>
              </>
            )}

            {result ? (
              <div className="mt-10 border-t border-[var(--color-line)] pt-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="metric-label">
                    Sample size
                  </span>

                  <span className="font-mono text-xs">
                    {result.iterations.toLocaleString()} runs
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-4">
                  <span className="metric-label">
                    Slug
                  </span>

                  <span className="font-mono text-xs">
                    /r/{result.slug}
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Distribution */}
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="flex items-center justify-between gap-4">
              <p className="metric-label">Distribution</p>

              {result ? (
                <span className="font-mono text-[0.625rem] uppercase tracking-[0.08em] text-[var(--color-ink-subtle)]">
                  {result.iterations.toLocaleString()} samples
                </span>
              ) : null}
            </div>

            <div className="mt-6">
              {metrics.map((metric) => {
                const value = result?.[metric.key] ?? null;

                return (
                  <div
                    key={metric.key}
                    className="grid grid-cols-[70px_1fr_72px] items-center gap-4 border-b border-[var(--color-line)] py-4 last:border-b-0"
                  >
                    <span className="font-mono text-[0.625rem] uppercase tracking-[0.06em] text-[var(--color-ink-subtle)]">
                      {metric.label}
                    </span>

                    <div className="h-1 bg-[var(--color-surface-muted)]">
                      {value !== null ? (
                        <div
                          className="h-full bg-[var(--color-accent)]"
                          style={{
                            width: `${Math.min(
                              (value / target) * 100,
                              100,
                            )}%`,
                          }}
                        />
                      ) : null}
                    </div>

                    <span className="metric-value text-right text-xs">
                      {value !== null
                        ? `${value.toFixed(2)} ms`
                        : "—"}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="mt-6 max-w-xl text-xs leading-5 text-[var(--color-ink-subtle)]">
              These measurements isolate the application-side
              redirect lookup. They do not represent total
              browser-to-destination latency.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}