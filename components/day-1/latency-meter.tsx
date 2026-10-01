interface LatencyMeterProps {
  value?: number;
  target?: number;
  label?: string;
}

export function LatencyMeter({
  value = 3.8,
  target = 10,
  label = "Application-side resolution",
}: LatencyMeterProps) {
  const percentage = Math.min((value / target) * 100, 100);
  const isUnderTarget = value < target;

  return (
    <section className="container-shell pb-24 sm:pb-32">
      <div className="grid border-y border-[var(--color-line)] lg:grid-cols-[1.2fr_0.8fr]">
        {/* Primary metric */}
        <div className="border-b border-[var(--color-line)] px-6 py-10 sm:px-8 sm:py-12 lg:border-b-0 lg:border-r lg:px-12 lg:py-14">
          <div className="flex items-center justify-between gap-6">
            <p className="eyebrow text-[var(--color-accent)]">
              Resolution latency
            </p>

            <span
              className={[
                "font-mono text-[0.625rem] uppercase tracking-[0.08em]",
                isUnderTarget
                  ? "text-[var(--color-accent)]"
                  : "text-[var(--color-error)]",
              ].join(" ")}
            >
              {isUnderTarget ? "Under target" : "Over target"}
            </span>
          </div>

          <div className="mt-10 flex items-baseline gap-3">
            <span className="metric-value text-7xl leading-none sm:text-8xl lg:text-9xl">
              {value.toFixed(1)}
            </span>

            <span className="font-mono text-sm text-[var(--color-ink-muted)]">
              ms
            </span>
          </div>

          <p className="mt-6 max-w-md text-sm leading-6 text-[var(--color-ink-muted)]">
            {label}. Measured around the redirect lookup path,
            excluding browser network, DNS, TLS, and destination
            request time.
          </p>

          {/* Target scale */}
          <div className="mt-10">
            <div className="mb-3 flex items-center justify-between">
              <span className="metric-label">0 ms</span>

              <span className="metric-label">
                target &lt; {target} ms
              </span>
            </div>

            <div
              className="relative h-2 bg-[var(--color-surface-muted)]"
              role="meter"
              aria-label="Redirect resolution latency"
              aria-valuemin={0}
              aria-valuemax={target}
              aria-valuenow={value}
            >
              <div
                className="absolute inset-y-0 left-0 bg-[var(--color-accent)] transition-[width] duration-500"
                style={{ width: `${percentage}%` }}
              />

              <div
                aria-hidden="true"
                className="absolute inset-y-[-4px] w-px bg-[var(--color-ink)]"
                style={{ left: "100%" }}
              />
            </div>
          </div>
        </div>

        {/* Context */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-1">
          <div className="border-b border-[var(--color-line)] p-6 sm:p-8 lg:p-10">
            <p className="metric-label">Target</p>

            <p className="metric-value mt-3 text-3xl">
              &lt; {target} ms
            </p>

            <p className="mt-3 text-sm leading-6 text-[var(--color-ink-muted)]">
              Application-side redirect resolution under
              controlled benchmark conditions.
            </p>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <p className="metric-label">Critical path</p>

            <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-xs">
              <span className="border border-[var(--color-line)] px-2.5 py-1.5">
                Edge
              </span>

              <span className="text-[var(--color-ink-subtle)]">
                →
              </span>

              <span className="border border-[var(--color-line)] px-2.5 py-1.5">
                KV
              </span>

              <span className="text-[var(--color-ink-subtle)]">
                →
              </span>

              <span className="border border-[var(--color-line)] px-2.5 py-1.5">
                302
              </span>
            </div>

            <p className="mt-4 text-sm leading-6 text-[var(--color-ink-muted)]">
              One lookup stands between the incoming request and
              the redirect response.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
