interface TelemetryStatusProps {
  eventsRecorded?: number;
  status?: "idle" | "recording" | "error";
}

const statusConfig = {
  idle: {
    label: "Ready",
    description: "Waiting for redirect events.",
  },
  recording: {
    label: "Recording",
    description: "Click events are being sent asynchronously.",
  },
  error: {
    label: "Degraded",
    description: "Telemetry delivery failed. Redirects remain independent.",
  },
} as const;

export function TelemetryStatus({
  eventsRecorded = 0,
  status = "idle",
}: TelemetryStatusProps) {
  const currentStatus = statusConfig[status];

  return (
    <section className="container-shell pb-24 sm:pb-32">
      <div className="border-y border-[var(--color-line)]">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-[var(--color-line)] px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="eyebrow text-[var(--color-accent)]">
              Observability
            </p>

            <h2 className="mt-2 text-xl font-medium tracking-[-0.025em] sm:text-2xl">
              Measure without slowing the redirect.
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={[
                "size-1.5 rounded-full",
                status === "error"
                  ? "bg-[var(--color-error)]"
                  : "bg-[var(--color-accent)]",
              ].join(" ")}
            />

            <span className="font-mono text-[0.625rem] uppercase tracking-[0.08em] text-[var(--color-ink-muted)]">
              {currentStatus.label}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_1fr]">
          {/* Flow */}
          <div className="border-b border-[var(--color-line)] p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
            <p className="metric-label">Event lifecycle</p>

            <div className="mt-8">
              <div className="flex items-center gap-3">
                <Step number="01" label="Redirect" active />

                <Arrow />

                <Step number="02" label="Response" active />

                <Arrow />

                <Step number="03" label="Telemetry" />
              </div>

              <div className="mt-8 border-l border-[var(--color-line-strong)] pl-5">
                <p className="text-sm leading-6 text-[var(--color-ink-muted)]">
                  The redirect response is returned first. Click
                  telemetry is dispatched separately so analytics
                  work does not become part of the critical path.
                </p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="grid sm:grid-cols-2">
            <div className="border-b border-[var(--color-line)] p-6 sm:border-b-0 sm:border-r sm:p-8 lg:p-10">
              <p className="metric-label">Events recorded</p>

              <p className="metric-value mt-5 text-4xl sm:text-5xl">
                {eventsRecorded.toLocaleString()}
              </p>

              <p className="mt-3 text-sm leading-6 text-[var(--color-ink-muted)]">
                Click events accepted by the telemetry endpoint.
              </p>
            </div>

            <div className="p-6 sm:p-8 lg:p-10">
              <p className="metric-label">Delivery</p>

              <p className="mt-5 font-mono text-sm font-medium">
                {currentStatus.label}
              </p>

              <p className="mt-3 text-sm leading-6 text-[var(--color-ink-muted)]">
                {currentStatus.description}
              </p>

              <div className="mt-8 border-t border-[var(--color-line)] pt-5">
                <span className="font-mono text-[0.625rem] uppercase tracking-[0.08em] text-[var(--color-accent)]">
                  Async / Non-blocking
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Step({
  number,
  label,
  active = false,
}: {
  number: string;
  label: string;
  active?: boolean;
}) {
  return (
    <div className="min-w-0">
      <div
        className={[
          "flex size-9 items-center justify-center border font-mono text-[0.625rem]",
          active
            ? "border-[var(--color-ink)] text-[var(--color-ink)]"
            : "border-[var(--color-line)] text-[var(--color-ink-subtle)]",
        ].join(" ")}
      >
        {number}
      </div>

      <p className="mt-2 font-mono text-[0.5625rem] uppercase tracking-[0.08em] text-[var(--color-ink-subtle)]">
        {label}
      </p>
    </div>
  );
}

function Arrow() {
  return (
    <span
      aria-hidden="true"
      className="mb-5 shrink-0 text-[var(--color-ink-subtle)]"
    >
      →
    </span>
  );
}