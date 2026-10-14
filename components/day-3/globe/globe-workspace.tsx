"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ClickEvent } from "@/types/click";
import type { GeoLocation } from "@/types/geo";

import { aggregateGeo } from "@/lib/analytics/aggregate-geo";
import dynamic from "next/dynamic";

const GlobeVisualization = dynamic(
  () => import("@/components/day-3/globe/globe"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[620px] items-center justify-center bg-[#080808]">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
          Initializing Earth visualization...
        </p>
      </div>
    ),
  },
);

const CLICK_LIMIT = 5;

interface AnalyticsResponse {
  success: boolean;
  clicks?: ClickEvent[];
  count?: number;
  error?: string;
  message?: string;
}

export function GlobeWorkspace() {
  const [clicks, setClicks] = useState<
    ClickEvent[]
  >([]);

  const [selectedLocation, setSelectedLocation] =
    useState<GeoLocation | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadClicks() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/analytics/clicks?limit=${CLICK_LIMIT}`,
          {
            cache: "no-store",
          },
        );

        const data =
          (await response.json()) as AnalyticsResponse;

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ??
              data.error ??
              "Failed to load analytics data.",
          );
        }

        if (!data.clicks) {
          throw new Error(
            "Analytics response did not contain click data.",
          );
        }

        if (!cancelled) {
          setClicks(data.clicks);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load analytics data.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadClicks();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Convert the raw synthetic ClickEvents into the
   * compact geographic dataset consumed by the globe.
   *
   * useMemo prevents the aggregation from running
   * again on every UI render.
   */
  const globeData = useMemo(
    () => aggregateGeo(clicks),
    [clicks],
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0d0d0c] text-[#f2f1ed]">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-1.5 w-1.5 animate-pulse rounded-full bg-[#8ba870]" />

            <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
              Loading geographic analytics
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#0d0d0c] px-6 py-12 text-[#f2f1ed]">
        <div className="mx-auto max-w-5xl">
          <div className="border border-red-400/20 bg-red-400/[0.03] p-5">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-red-300/70">
              Geographic analytics error
            </p>

            <p className="mt-3 text-sm text-white/70">
              {error}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0d0d0c] text-[#f2f1ed]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col px-5 py-5 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-[#292927] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center border border-[#292927] font-mono text-[9px] text-white/60">
              LP
            </div>

            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/40">
                Link Performance Lab
              </p>

              <p className="mt-0.5 text-xs text-white/80">
                Geographic analytics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-white/40">
            <span className="h-1.5 w-1.5 rounded-full bg-[#8ba870]" />
            Day 03
          </div>
        </header>

        <section className="py-10 sm:py-14">
          <div className="max-w-3xl">
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#8ba870]">
              Geographic analytics
            </p>

            <h1 className="mt-4 text-4xl font-medium tracking-[-0.04em] text-[#f2f1ed] sm:text-6xl">
              Every click has a place.
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-6 text-white/45 sm:text-base">
              The same synthetic traffic powering the
              performance experiments, now mapped across
              the globe.
            </p>
          </div>
        </section>

        <section className="grid gap-px border border-[#292927] bg-[#292927] sm:grid-cols-3">
          <Stat
            label="Clicks"
            value={globeData.stats.totalClicks}
          />

          <Stat
            label="Countries"
            value={globeData.stats.countries}
          />

          <Stat
            label="Locations"
            value={globeData.stats.locations}
          />
        </section>

        <section className="relative mt-5 min-h-[620px] flex-1 overflow-hidden border border-[#292927] bg-[#080808]">
          <GlobeVisualization
            data={globeData}
            onLocationSelect={
              setSelectedLocation
            }
          />

          <div className="pointer-events-none absolute bottom-5 left-5 z-10">
            <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/30">
              {globeData.stats.totalClicks} synthetic
              events · deterministic dataset
            </p>
          </div>

          {selectedLocation && (
            <div className="pointer-events-none absolute right-5 top-5 z-10">
              <div className="border border-[#292927] bg-[#0d0d0c]/90 px-4 py-3 backdrop-blur-sm">
                <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#8ba870]">
                  Selected location
                </p>

                <p className="mt-1 text-sm text-white/85">
                  {selectedLocation.city},{" "}
                  {selectedLocation.country}
                </p>
              </div>
            </div>
          )}
        </section>

        <footer className="flex items-center justify-between border-t border-[#292927] pt-4">
          <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-white/25">
            Real-time visualization · WebGL
          </p>

          <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-white/25">
            v0.1.0
          </p>
        </footer>
      </div>
    </main>
  );
}

interface StatProps {
  label: string;
  value: number;
}

function Stat({
  label,
  value,
}: StatProps) {
  return (
    <div className="bg-[#0d0d0c] px-5 py-4">
      <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/30">
        {label}
      </p>

      <p className="mt-2 font-mono text-xl tracking-[-0.03em] text-white/90">
        {value.toLocaleString()}
      </p>
    </div>
  );
}
