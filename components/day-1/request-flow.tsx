const steps = [
  {
    number: "01",
    label: "REQUEST",
    title: "Incoming click",
    description: "A user requests /r/github.",
  },
  {
    number: "02",
    label: "EDGE",
    title: "Middleware",
    description: "The request is handled close to the user.",
  },
  {
    number: "03",
    label: "KV LOOKUP",
    title: "One read",
    description: "Resolve the slug to its destination.",
  },
  {
    number: "04",
    label: "REDIRECT",
    title: "302 response",
    description: "Send the browser to the destination.",
  },
];

export function RequestFlow() {
  return (
    <section className="container-shell pb-24 sm:pb-32">
      <div className="border-y border-[var(--color-line)]">
        {/* Section header */}
        <div className="flex flex-col gap-3 border-b border-[var(--color-line)] py-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-[var(--color-accent)]">
              Critical path
            </p>

            <h2 className="mt-2 text-xl font-medium tracking-[-0.025em] sm:text-2xl">
              Resolve the redirect before doing anything else.
            </h2>
          </div>

          <p className="max-w-sm text-sm leading-6 text-[var(--color-ink-muted)] sm:text-right">
            One edge request. One lookup. One redirect.
            Telemetry leaves the critical path.
          </p>
        </div>

        {/* Request flow */}
        <div className="grid md:grid-cols-4">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative border-b border-[var(--color-line)] p-6 last:border-b-0 md:border-b-0 md:border-r md:p-7 md:last:border-r-0 lg:p-8"
            >
              {/* Step number */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-[0.625rem] tracking-[0.1em] text-[var(--color-ink-subtle)]">
                  {step.number}
                </span>

                {index < steps.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="hidden text-[var(--color-ink-subtle)] md:block"
                  >
                    →
                  </span>
                ) : null}
              </div>

              {/* Step content */}
              <div className="mt-12">
                <p className="eyebrow text-[var(--color-ink-subtle)]">
                  {step.label}
                </p>

                <h3 className="mt-3 text-lg font-medium tracking-[-0.02em]">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[var(--color-ink-muted)]">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Non-blocking telemetry */}
        <div className="border-t border-[var(--color-line)]">
          <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:px-8">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-[var(--color-accent)]"
              />

              <span className="eyebrow text-[var(--color-ink-muted)]">
                Async telemetry
              </span>
            </div>

            <span
              aria-hidden="true"
              className="hidden text-[var(--color-ink-subtle)] sm:block"
            >
              →
            </span>

            <p className="text-sm text-[var(--color-ink-muted)]">
              Click data is recorded after the redirect decision,
              without blocking the response.
            </p>

            <span className="font-mono text-[0.625rem] uppercase tracking-[0.08em] text-[var(--color-accent)] sm:ml-auto">
              Non-blocking
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
