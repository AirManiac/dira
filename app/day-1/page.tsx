import type { Metadata } from "next";

import { BenchmarkPanel } from "@/components/day-1/benchmark-panel";
import { LatencyMeter } from "@/components/day-1/latency-meter";
import { RedirectDemo } from "@/components/day-1/redirect-demo";
import { RequestFlow } from "@/components/day-1/request-flow";
import { TelemetryStatus } from "@/components/day-1/telemetry-status";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";
import { PageIntro } from "@/components/shared/page-intro";

export const metadata: Metadata = {
  title: "Day 01 — Sub-10ms Edge Redirects",
  description:
    "An edge redirect experiment using middleware and a single KV lookup to keep application-side redirect resolution under 10ms.",
};

export default function DayOnePage() {
  return (
    <>
      <SiteHeader />

      <main>
        <PageIntro
          eyebrow="Day 01 / Edge Computing"
          title="Sub-10ms Edge Redirects"
          description="Resolve short links close to the user with one edge lookup, while keeping click telemetry outside the critical path."
        >
          <div className="flex flex-wrap items-center gap-3 font-mono text-[0.625rem] uppercase tracking-[0.08em] text-[var(--color-ink-muted)]">
            <span className="border border-[var(--color-line)] px-3 py-2">
              Next.js Edge
            </span>

            <span className="border border-[var(--color-line)] px-3 py-2">
              Redis / KV
            </span>

            <span className="border border-[var(--color-line)] px-3 py-2">
              Async Telemetry
            </span>
          </div>
        </PageIntro>

        <RequestFlow />

        <LatencyMeter />

        <RedirectDemo />

        <TelemetryStatus />

        <BenchmarkPanel />
      </main>

      <SiteFooter />
    </>
  );
}