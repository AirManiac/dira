"use client";

import { useEffect, useState } from "react";

import { ClickDataGrid } from "@/components/analytics/click-data-grid";
import type { ClickEvent } from "@/types/click";

interface AnalyticsResponse {
success: boolean;
source?: "redis" | "generated";
count?: number;
totalAvailable?: number;
clicks?: ClickEvent[];
generationTime?: number;
persistenceTime?: number;
readTime?: number;
apiTime?: number;
error?: string;
message?: string;
}

export function AnalyticsWorkspace() {
const [clicks, setClicks] = useState<ClickEvent[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [metrics, setMetrics] = useState({
source: null as AnalyticsResponse["source"],
apiTime: 0,
generationTime: 0,
persistenceTime: 0,
readTime: 0,
});

useEffect(() => {
let cancelled = false;

async function loadAnalytics() {
  const startedAt = performance.now();

  try {
    setIsLoading(true);
    setError(null);

    const response = await fetch(
      "/api/analytics/clicks?limit=10",
      {
        method: "GET",
        cache: "no-store",
      },
    );

    const data: AnalyticsResponse = await response.json();

    if (!response.ok || !data.success || !data.clicks) {
      throw new Error(
        data.message ??
          data.error ??
          "Unable to load analytics data.",
      );
    }

    if (cancelled) return;

    setClicks(data.clicks);

    setMetrics({
      source: data.source,
      apiTime:
        data.apiTime ??
        Number((performance.now() - startedAt).toFixed(2)),
      generationTime: data.generationTime ?? 0,
      persistenceTime: data.persistenceTime ?? 0,
      readTime: data.readTime ?? 0,
    });
  } catch (error) {
    if (cancelled) return;

    setError(
      error instanceof Error
        ? error.message
        : "Unable to load analytics data.",
    );
  } finally {
    if (!cancelled) {
      setIsLoading(false);
    }
  }
}

void loadAnalytics();

return () => {
  cancelled = true;
};

}, []);

return ( <main className="min-h-screen bg-[#0d0d0c] text-[#f2f1ed]"> <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-5 sm:px-8 lg:px-10"> <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#292927]"> <div className="flex items-center gap-4"> <a
           href="/"
           className="flex items-center gap-2.5 transition-opacity duration-200 hover:opacity-60"
           aria-label="Link Performance Lab"
         > <span className="flex size-6 items-center justify-center border border-[#f2f1ed] font-mono text-[9px] font-medium tracking-[-0.05em]">
LP </span>

          <span className="hidden text-xs font-medium tracking-[-0.02em] sm:block">
            Link Performance Lab
          </span>
        </a>

        <span aria-hidden="true" className="text-[#444440]">
          /
        </span>

        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#777771]">
          Day 2
        </span>
      </div>

      <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777771]">
        100k analytics
      </div>
    </header>

    <div className="flex flex-1 flex-col">
      <section className="border-b border-[#292927] py-8 sm:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#6d9b82]">
              Performance experiment / 02
            </p>

            <h1 className="mt-3 max-w-4xl font-serif text-4xl font-normal leading-[0.95] tracking-[-0.045em] text-[#f2f1ed] sm:text-5xl lg:text-6xl">
              100,000 rows.
              <br />
              Still 60 FPS.
            </h1>
          </div>

          <p className="max-w-md text-sm leading-6 text-[#777771] lg:pb-1 lg:text-right">
            A Web Worker handles filtering and sorting while TanStack
            Virtual keeps only the rows you can see in the DOM.
          </p>
        </div>
      </section>

      <section className="border-b border-[#292927]">
        <div className="grid grid-cols-2 divide-x divide-[#292927] sm:grid-cols-4">
          <Metric
            label="Dataset"
            value={
              isLoading
                ? "—"
                : clicks.length.toLocaleString()
            }
          />

          <Metric
            label="API"
            value={
              isLoading
                ? "—"
                : `${metrics.apiTime.toFixed(0)}ms`
            }
          />

          <Metric
            label="Worker"
            value="off-main-thread"
          />

          <Metric
            label="DOM"
            value="virtualized"
          />
        </div>
      </section>

      {error ? (
        <section className="border-b border-[#292927] py-6">
          <div className="flex items-start gap-2">
            <span
              aria-hidden="true"
              className="mt-1.5 size-1 shrink-0 rounded-full bg-[#a64a43]"
            />

            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#a64a43]">
                Analytics load failed
              </p>

              <p className="mt-2 font-mono text-[10px] leading-5 text-[#777771]">
                {error}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="flex flex-1 flex-col py-6 sm:py-7">
        {isLoading ? (
          <LoadingState />
        ) : (
          <ClickDataGrid clicks={clicks} />
        )}
      </section>
    </div>

    <footer className="flex min-h-12 shrink-0 items-center justify-between border-t border-[#292927]">
      <div className="flex items-center gap-4 font-mono text-[9px] uppercase tracking-[0.1em] text-[#555550]">
        <span>Link Performance Lab</span>

        <span
          aria-hidden="true"
          className="hidden h-3 w-px bg-[#292927] sm:block"
        />

        <span className="hidden sm:inline">
          Web Worker + TanStack Virtual
        </span>
      </div>

      <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#555550]">
        Day 02 / 03
      </div>
    </footer>
  </div>
</main>

);
}

interface MetricProps {
label: string;
value: string;
}

function Metric({ label, value }: MetricProps) {
return ( <div className="min-w-0 px-3 py-4 sm:px-4"> <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#555550]">
{label} </p>

  <p className="mt-2 truncate font-mono text-xs tabular-nums text-[#f2f1ed]">
    {value}
  </p>
</div>


);
}

function LoadingState() {
return ( <div className="flex min-h-[520px] flex-1 items-center justify-center border-y border-[#292927]"> <div className="text-center"> <div className="mx-auto flex items-center justify-center gap-1.5"> <span className="size-1 rounded-full bg-[#6d9b82]" /> <span className="size-1 rounded-full bg-[#555550]" /> <span className="size-1 rounded-full bg-[#555550]" /> </div>

    <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.12em] text-[#555550]">
      Loading 100,000 events
    </p>

    <p className="mt-2 text-xs text-[#777771]">
      Preparing the analytics worker...
    </p>
  </div>
</div>

);
}
