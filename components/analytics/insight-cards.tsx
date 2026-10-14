
"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Clock3,
  Globe2,
  MousePointerClick,
  Zap,
} from "lucide-react";

import type { AnalyticsInsights } from "@/lib/analytics/insights";
import type { ClickEvent } from "@/types/click";

interface InsightCardsProps {
  insights: AnalyticsInsights;
  onSelectEvent?: (event: ClickEvent) => void;
}

function formatDestination(destination: string, maxLength = 38) {
  if (destination.length <= maxLength) return destination;

  return `${destination.slice(0, maxLength).trimEnd()}…`;
}

function InsightCard({
  icon: Icon,
  label,
  title,
  description,
  accent = "neutral",
  action,
}: {
  icon: typeof Clock3;
  label: string;
  title: string;
  description: string;
  accent?: "neutral" | "green" | "amber";
  action?: {
    label: string;
    onClick: () => void;
  };
}) {
  const accentStyles = {
    neutral: "bg-white/[0.06] text-white/65",
    green: "bg-[#8ba870]/10 text-[#a8c88a]",
    amber: "bg-amber-400/10 text-amber-300",
  };

  return (
    <article className="flex min-w-0 flex-col rounded-xl border border-white/[0.09] bg-[#111110] p-5 transition-colors duration-200 hover:border-white/[0.16] sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/40">
          {label}
        </span>

        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${accentStyles[accent]}`}
        >
          <Icon size={17} strokeWidth={1.7} />
        </span>
      </div>

      <h3 className="mt-5 break-words text-lg font-medium tracking-tight text-white">
        {title}
      </h3>

      <p className="mt-2 min-h-10 text-sm leading-5 text-white/45">
        {description}
      </p>

      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-5 inline-flex w-fit items-center gap-2 text-xs font-medium text-[#a8c88a] transition-colors hover:text-[#c3dfa8]"
        >
          {action.label}
          <ArrowDownRight size={14} />
        </button>
      )}
    </article>
  );
}

export function InsightCards({
  insights,
  onSelectEvent,
}: InsightCardsProps) {
  const {
    totalClicks,
    averageResponseTime,
    medianResponseTime,
    successRate,
    mostActiveCountry,
    mostClickedLink,
    slowestEvent,
  } = insights;

  if (totalClicks === 0) {
    return (
      <section className="rounded-xl border border-white/[0.09] bg-[#111110] px-6 py-10 text-center">
        <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-white/[0.05] text-white/40">
          <Zap size={20} strokeWidth={1.6} />
        </div>

        <h3 className="mt-4 text-sm font-medium text-white">
          No insights yet
        </h3>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/45">
          Insights will appear when click events are available for analysis.
        </p>
      </section>
    );
  }

  const latencyDifference = averageResponseTime - medianResponseTime;

  const latencyDescription =
    latencyDifference > 0
      ? `The average is ${latencyDifference} ms above the median, suggesting some slower requests are pulling up the average.`
      : latencyDifference < 0
        ? "The average is below the median. Review individual events for a clearer picture of response-time variation."
        : "Average and median response times are aligned across the current sample.";

  const successAccent =
    successRate >= 95 ? "green" : successRate >= 80 ? "neutral" : "amber";

  return (
    <section aria-labelledby="insights-heading" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#a8c88a]">
            Signal detection
          </p>

          <h2
            id="insights-heading"
            className="mt-2 text-lg font-medium tracking-tight text-white"
          >
            What stands out
          </h2>
        </div>

        <span className="text-xs text-white/35">
          Based on {totalClicks.toLocaleString()} events
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <InsightCard
          icon={Clock3}
          label="Response latency"
          title={`${averageResponseTime} ms average`}
          description={latencyDescription}
          accent={latencyDifference > 0 ? "amber" : "neutral"}
          action={
            slowestEvent && onSelectEvent
              ? {
                  label: "Inspect slowest event",
                  onClick: () => onSelectEvent(slowestEvent),
                }
              : undefined
          }
        />

        <InsightCard
          icon={Globe2}
          label="Top location"
          title={mostActiveCountry?.country ?? "No location data"}
          description={
            mostActiveCountry
              ? `${mostActiveCountry.clicks.toLocaleString()} clicks · ${mostActiveCountry.percentage}% of observed traffic.`
              : "Location data is not available in this sample."
          }
          accent="green"
        />

        <InsightCard
          icon={MousePointerClick}
          label="Most clicked link"
          title={
            mostClickedLink
              ? `/${mostClickedLink.slug}`
              : "No link data"
          }
          description={
            mostClickedLink
              ? `${mostClickedLink.clicks.toLocaleString()} clicks · ${formatDestination(mostClickedLink.destination)}`
              : "Link activity will appear when events are available."
          }
          accent="neutral"
        />

        <InsightCard
          icon={successRate >= 95 ? ArrowUpRight : ArrowDownRight}
          label="Successful outcomes"
          title={`${successRate}% success rate`}
          description={`${totalClicks.toLocaleString()} events analyzed. Successful outcomes include successful requests and redirects.`}
          accent={successAccent}
        />

        <InsightCard
          icon={Zap}
          label="Response consistency"
          title={`${medianResponseTime} ms median`}
          description="Half of the observed response times are at or below this value, and half are at or above it."
          accent="neutral"
        />

        <InsightCard
          icon={Clock3}
          label="Slowest request"
          title={
            slowestEvent
              ? `${slowestEvent.responseTime} ms`
              : "No timing data"
          }
          description={
            slowestEvent
              ? `/${slowestEvent.slug} · ${slowestEvent.city || slowestEvent.country || "Unknown location"}`
              : "No valid response-time measurements were found."
          }
          accent="amber"
          action={
            slowestEvent && onSelectEvent
              ? {
                  label: "View event details",
                  onClick: () => onSelectEvent(slowestEvent),
                }
              : undefined
          }
        />
      </div>
    </section>
  );
}
