import {
  Activity,
  CheckCircle2,
  Clock3,
  Globe2,
  MousePointerClick,
  Smartphone,
  Zap,
} from "lucide-react";

import type { AnalyticsInsights } from "@/lib/analytics/insights";

interface PerformanceOverviewProps {
  insights: AnalyticsInsights;
}

const numberFormatter = new Intl.NumberFormat("en-US");

const statusLabels: Record<string, string> = {
  success: "Success",
  redirect: "Redirect",
  not_found: "Not found",
  error: "Error",
};

const deviceLabels: Record<string, string> = {
  desktop: "Desktop",
  mobile: "Mobile",
  tablet: "Tablet",
  bot: "Bot",
};

function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string;
  description: string;
  icon: typeof Activity;
  accent?: boolean;
}) {
  return (
    <article className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#111210] p-5 transition-colors duration-200 hover:border-white/[0.14]">
      <div className="flex items-start justify-between gap-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#92938b]">
          {label}
        </p>

        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-lg border ${
            accent
              ? "border-[#8ba870]/20 bg-[#8ba870]/10 text-[#a8c493]"
              : "border-white/[0.08] bg-white/[0.03] text-[#92938b]"
          }`}
        >
          <Icon size={17} strokeWidth={1.7} />
        </div>
      </div>

      <p className="mt-6 text-3xl font-medium tracking-[-0.055em] text-[#f0f0e9] tabular-nums sm:text-[34px]">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-[#777970]">
        {description}
      </p>
    </article>
  );
}

function SectionHeader({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="text-sm font-medium text-[#e8e8e0]">
        {title}
      </h3>

      <span className="text-[10px] uppercase tracking-[0.12em] text-[#73756d]">
        {detail}
      </span>
    </div>
  );
}

function BreakdownBar({
  label,
  count,
  percentage,
  color = "#8ba870",
}: {
  label: string;
  count: number;
  percentage: number;
  color?: string;
}) {
  const width = Math.min(100, Math.max(0, percentage));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="truncate text-[#b7b8af]">{label}</span>

        <span className="shrink-0 font-mono text-[11px] tabular-nums text-[#92938b]">
          {formatNumber(count)}
          <span className="ml-2 text-[#65675f]">
            {formatPercentage(percentage)}
          </span>
        </span>
      </div>

      <div
        className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]"
        role="progressbar"
        aria-label={`${label}: ${formatPercentage(percentage)}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={width}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{
            width: `${width}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

export function PerformanceOverview({
  insights,
}: PerformanceOverviewProps) {
  const {
    totalClicks,
    averageResponseTime,
    medianResponseTime,
    successRate,
    statusBreakdown,
    deviceBreakdown,
    countryBreakdown,
    linkBreakdown,
    responseTimeDistribution,
  } = insights;

  const errorCount =
    statusBreakdown.find((item) => item.label === "error")?.count ?? 0;

  const hasLatencyData = responseTimeDistribution.some(
    (bucket) => bucket.count > 0,
  );

  const topCountries = countryBreakdown.slice(0, 5);
  const topLinks = linkBreakdown.slice(0, 5);

  return (
    <section aria-label="Performance overview" className="space-y-5">
      {/* Primary metrics */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total clicks"
          value={formatNumber(totalClicks)}
          description="Events in the current dataset"
          icon={MousePointerClick}
          accent
        />

        <MetricCard
          label="Average response"
          value={hasLatencyData ? `${averageResponseTime} ms` : "—"}
          description="Mean recorded response time"
          icon={Activity}
        />

        <MetricCard
          label="Median response"
          value={hasLatencyData ? `${medianResponseTime} ms` : "—"}
          description="Middle recorded response time"
          icon={Clock3}
        />

        <MetricCard
          label="Success rate"
          value={totalClicks > 0 ? formatPercentage(successRate) : "—"}
          description={
            totalClicks > 0
              ? `${formatNumber(errorCount)} error events excluded from successful outcomes`
              : "Waiting for click events"
          }
          icon={CheckCircle2}
          accent
        />
      </div>

      {/* Latency and device distribution */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-white/[0.08] bg-[#111210] p-5 sm:p-6">
          <SectionHeader
            title="Response time distribution"
            detail="Latency · milliseconds"
          />

          <div className="mt-7 space-y-5">
            {responseTimeDistribution.map((bucket) => (
              <BreakdownBar
                key={bucket.label}
                label={bucket.label}
                count={bucket.count}
                percentage={bucket.percentage}
              />
            ))}
          </div>

          {!hasLatencyData && (
            <p className="mt-5 text-xs text-[#777970]">
              No valid response-time measurements are available yet.
            </p>
          )}

          <div className="mt-6 flex items-center gap-2 border-t border-white/[0.07] pt-4">
            <Zap size={14} className="text-[#8ba870]" />
            <p className="text-[11px] leading-5 text-[#85867e]">
              Lower response times indicate faster recorded responses.
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-white/[0.08] bg-[#111210] p-5 sm:p-6">
          <SectionHeader
            title="Device breakdown"
            detail="By event count"
          />

          <div className="mt-7 space-y-5">
            {deviceBreakdown.map((device) => (
              <BreakdownBar
                key={device.label}
                label={deviceLabels[device.label] ?? device.label}
                count={device.count}
                percentage={device.percentage}
                color={
                  device.label === "desktop"
                    ? "#8ba870"
                    : device.label === "mobile"
                      ? "#a3a49b"
                      : device.label === "tablet"
                        ? "#777970"
                        : "#b7a17c"
                }
              />
            ))}
          </div>

          {totalClicks === 0 && (
            <p className="mt-5 text-xs text-[#777970]">
              Device statistics will appear when events are available.
            </p>
          )}

          <div className="mt-6 flex items-center gap-2 border-t border-white/[0.07] pt-4">
            <Smartphone size={14} className="text-[#8ba870]" />
            <p className="text-[11px] leading-5 text-[#85867e]">
              Includes all recorded device categories.
            </p>
          </div>
        </section>
      </div>

      {/* Country and link performance */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-white/[0.08] bg-[#111210] p-5 sm:p-6">
          <SectionHeader
            title="Top countries"
            detail="By click volume"
          />

          {topCountries.length > 0 ? (
            <div className="mt-7 space-y-5">
              {topCountries.map((country) => (
                <BreakdownBar
                  key={country.country}
                  label={country.country}
                  count={country.clicks}
                  percentage={country.percentage}
                />
              ))}
            </div>
          ) : (
            <p className="mt-7 text-xs text-[#777970]">
              Country breakdowns will appear when events are available.
            </p>
          )}

          <div className="mt-6 flex items-center gap-2 border-t border-white/[0.07] pt-4">
            <Globe2 size={14} className="text-[#8ba870]" />
            <p className="text-[11px] leading-5 text-[#85867e]">
              {countryBreakdown.length} distinct recorded countries
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-white/[0.08] bg-[#111210] p-5 sm:p-6">
          <SectionHeader
            title="Link performance"
            detail="Ranked by clicks"
          />

          {topLinks.length > 0 ? (
            <div className="mt-5 divide-y divide-white/[0.06]">
              {topLinks.map((link, index) => (
                <div
                  key={`${link.slug}-${link.destination}`}
                  className="flex items-center gap-3 py-4 first:pt-2 last:pb-1"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.025] font-mono text-[11px] text-[#85867e]">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#e8e8e0]">
                      /{link.slug}
                    </p>
                    <p className="mt-1 truncate text-[11px] text-[#777970]">
                      {link.destination}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="font-mono text-sm tabular-nums text-[#e8e8e0]">
                      {formatNumber(link.clicks)}
                    </p>
                    <p className="mt-1 text-[10px] text-[#85867e]">
                      {link.averageResponseTime} ms avg.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-7 text-xs text-[#777970]">
              Link rankings will appear when events are available.
            </p>
          )}

          <div className="mt-5 flex items-center justify-between gap-2 border-t border-white/[0.07] pt-4">
            <p className="text-[11px] text-[#85867e]">
              {linkBreakdown.length} distinct links
            </p>
            <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-[#777970]">
              <Activity size={12} />
              Event-derived
            </span>
          </div>
        </section>
      </div>
    </section>
  );
}

export default PerformanceOverview;
