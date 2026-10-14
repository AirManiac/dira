
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

import { EventDetailPanel } from "@/components/analytics/event-detail-panel";
import { EventExplorer } from "@/components/analytics/event-explorer";
import { InsightCards } from "@/components/analytics/insight-cards";
import { PerformanceOverview } from "@/components/analytics/performance-overview";
import { getAnalyticsInsights } from "@/lib/analytics/insights";
import type { ClickEvent } from "@/types/click";

const DEFAULT_LIMIT = 50;

interface AnalyticsResponse {
  success: boolean;
  clicks: ClickEvent[];
  count: number;
  error?: string;
  message?: string;
}

function formatUpdatedAt(timestamp: number | null) {
  if (timestamp === null) return "Not loaded yet";

  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(timestamp);
a}

export function ObservatoryWorkspace() {
  const [clicks, setClicks] = useState<ClickEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ClickEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const fetchClicks = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/analytics/clicks?limit=${DEFAULT_LIMIT}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
          signal,
        },
      );

      const payload = (await response.json()) as AnalyticsResponse;

      if (!response.ok || !payload.success) {
        throw new Error(
          payload.message ??
            payload.error ??
            `Unable to load analytics (HTTP ${response.status}).`,
        );
      }

      if (!Array.isArray(payload.clicks)) {
        throw new Error("The analytics API returned an invalid click dataset.");
      }

      setClicks(payload.clicks);
      setLastUpdated(Date.now());

      setSelectedEvent((current) => {
        if (!current) return null;

        return (
          payload.clicks.find((click) => click.id === current.id) ?? null
        );
      });
    } catch (cause) {
      if (cause instanceof Error && cause.name === "AbortError") {
        return;
      }

      setError(
        cause instanceof Error
          ? cause.message
          : "An unexpected error occurred while loading analytics.",
      );
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void fetchClicks(controller.signal);

    return () => controller.abort();
  }, [fetchClicks]);

  const insights = useMemo(() => getAnalyticsInsights(clicks), [clicks]);

  const handleSelectEvent = useCallback((event: ClickEvent) => {
    setSelectedEvent(event);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  const handleRefresh = useCallback(() => {
    void fetchClicks();
  }, [fetchClicks]);

  return (
    <div className="min-h-screen bg-[#0d0d0c] text-white">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        {/* Page heading */}
        <header className="flex flex-col gap-6 border-b border-white/[0.09] pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-white/40">
              <span className="size-1.5 rounded-full bg-[#8ba870]" />
              LINK PERFORMANCE LAB
              <ArrowRight size={12} />
              DAY 03
            </div>

            <h1 className="mt-4 text-3xl font-medium tracking-[-0.045em] sm:text-4xl lg:text-5xl">
              Link Observatory
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/45 sm:text-base">
              A closer look at redirect performance, traffic patterns, and
              individual click events.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="text-xs text-white/40">
              <p>Last fetched</p>
              <p className="mt-1 font-mono text-white/65">
                {formatUpdatedAt(lastUpdated)}
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.04] px-4 text-sm text-white/80 transition-colors hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <LoaderCircle className="animate-spin" size={15} />
              ) : (
                <RefreshCw size={15} />
              )}
              {isLoading ? "Loading..." : "Refresh data"}
            </button>
          </div>
        </header>

        {/* Request state */}
        {error && (
          <div
            role="alert"
            className="mt-6 flex flex-col gap-4 rounded-xl border border-red-400/20 bg-red-400/[0.05] p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                className="mt-0.5 shrink-0 text-red-300"
                size={18}
              />

              <div>
                <p className="text-sm font-medium text-red-200">
                  Could not load analytics
                </p>
                <p className="mt-1 break-words text-sm text-red-200/60">
                  {error}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              className="inline-flex shrink-0 items-center gap-2 text-sm text-red-200 transition-colors hover:text-white disabled:opacity-50"
            >
              Try again
              <RefreshCw size={14} />
            </button>
          </div>
        )}

        {/* Initial loading state */}
        {isLoading && clicks.length === 0 && !error && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="h-44 animate-pulse rounded-xl border border-white/[0.07] bg-white/[0.025]"
              />
            ))}
          </div>
        )}

        {/* Dashboard content */}
        {(!isLoading || clicks.length > 0) && (
          <div className="mt-8 space-y-10">
            <PerformanceOverview insights={insights} />

            <InsightCards
              insights={insights}
              onSelectEvent={handleSelectEvent}
            />

            <section className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#a8c88a]">
                    Request intelligence
                  </p>

                  <h2 className="mt-2 text-lg font-medium tracking-tight">
                    Event explorer
                  </h2>

                  <p className="mt-1 text-sm text-white/40">
                    Search, filter, and inspect individual click events.
                  </p>
                </div>

                <span className="font-mono text-xs text-white/40">
                  {clicks.length.toLocaleString()} events
                </span>
              </div>

              <div
                className={`grid items-start gap-4 ${
                  selectedEvent
                    ? "grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px]"
                    : "grid-cols-1"
                }`}
              >
                <EventExplorer
                  clicks={clicks}
                  selectedEventId={selectedEvent?.id}
                  onSelectEvent={handleSelectEvent}
                />

                {selectedEvent && (
                  <div className="min-w-0 xl:sticky xl:top-6">
                    <EventDetailPanel
                      event={selectedEvent}
                      onClose={handleCloseDetails}
                    />
                  </div>
                )}
              </div>
            </section>

            {clicks.length === 0 && !error && !isLoading && (
              <p className="rounded-xl border border-white/[0.08] p-6 text-center text-sm text-white/45">
                No click events were returned. Check that your analytics API
                has links available to generate the sample dataset.
              </p>
            )}
          </div>
        )}

        <footer className="mt-16 flex flex-col gap-2 border-t border-white/[0.08] pt-5 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <span>LINK PERFORMANCE LAB / OBSERVATORY</span>
          <span>Built for visibility, not guesswork.</span>
        </footer>
      </div>
    </div>
  );
}