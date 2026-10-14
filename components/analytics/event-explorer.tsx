
"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowDownUp,
  ArrowUp,
  ChevronDown,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import type {
  ClickEvent,
  ClickStatus,
  DeviceType,
} from "@/types/click";

interface EventExplorerProps {
  clicks: ClickEvent[];
  selectedEventId?: string | null;
  onSelectEvent: (event: ClickEvent) => void;
}

type SortField = "timestamp" | "responseTime" | "country";
type SortDirection = "asc" | "desc";

const STATUS_OPTIONS: { value: ClickStatus; label: string }[] = [
  { value: "success", label: "Success" },
  { value: "redirect", label: "Redirect" },
  { value: "not_found", label: "Not found" },
  { value: "error", label: "Error" },
];

const DEVICE_OPTIONS: { value: DeviceType; label: string }[] = [
  { value: "desktop", label: "Desktop" },
  { value: "mobile", label: "Mobile" },
  { value: "tablet", label: "Tablet" },
  { value: "bot", label: "Bot" },
];

const STATUS_STYLES: Record<ClickStatus, string> = {
  success: "border-[#8ba870]/20 bg-[#8ba870]/10 text-[#a8c493]",
  redirect: "border-sky-400/15 bg-sky-400/[0.07] text-sky-300",
  not_found: "border-amber-400/15 bg-amber-400/[0.07] text-amber-300",
  error: "border-red-400/15 bg-red-400/[0.07] text-red-300",
};

const STATUS_LABELS: Record<ClickStatus, string> = {
  success: "Success",
  redirect: "Redirect",
  not_found: "Not found",
  error: "Error",
};

const DEVICE_LABELS: Record<DeviceType, string> = {
  desktop: "Desktop",
  mobile: "Mobile",
  tablet: "Tablet",
  bot: "Bot",
};

const numberFormatter = new Intl.NumberFormat("en-US");

function formatTimestamp(timestamp: number): string {
  if (!Number.isFinite(timestamp)) return "Unknown";

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) return "Unknown";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function formatResponseTime(responseTime: number): string {
  if (!Number.isFinite(responseTime) || responseTime < 0) {
    return "—";
  }

  return `${numberFormatter.format(responseTime)} ms`;
}

function StatusBadge({ status }: { status: ClickStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-medium ${STATUS_STYLES[status]}`}
    >
      <span
        className="size-1.5 rounded-full bg-current"
        aria-hidden="true"
      />
      {STATUS_LABELS[status]}
    </span>
  );
}

function SelectFilter({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 max-w-full appearance-none rounded-lg border border-white/[0.09] bg-[#141512] py-0 pl-3 pr-8 text-xs text-[#c5c6bd] outline-none transition-colors hover:border-white/[0.16] focus:border-[#8ba870]/50"
      >
        {children}
      </select>

      <ChevronDown
        size={13}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#777970]"
      />
    </label>
  );
}

export function EventExplorer({
  clicks,
  selectedEventId = null,
  onSelectEvent,
}: EventExplorerProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortDirection, setSortDirection] =
    useState<SortDirection>("desc");

  const countries = useMemo(
    () =>
      Array.from(
        new Set(
          clicks
            .map((click) => click.country.trim())
            .filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [clicks],
  );

  const filteredClicks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return clicks
      .filter((click) => {
        const matchesSearch =
          !query ||
          [
            click.id,
            click.slug,
            click.destination,
            click.country,
            click.city,
            click.referrer ?? "",
            click.device,
            click.status,
          ].some((value) => value.toLowerCase().includes(query));

        const matchesStatus =
          statusFilter === "all" || click.status === statusFilter;

        const matchesDevice =
          deviceFilter === "all" || click.device === deviceFilter;

        const matchesCountry =
          countryFilter === "all" || click.country === countryFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesDevice &&
          matchesCountry
        );
      })
      .sort((a, b) => {
        let comparison = 0;

        switch (sortField) {
          case "timestamp":
            comparison = a.timestamp - b.timestamp;
            break;

          case "responseTime":
            comparison = a.responseTime - b.responseTime;
            break;

          case "country":
            comparison = a.country.localeCompare(b.country);
            break;
        }

        if (comparison === 0) {
          comparison = a.id.localeCompare(b.id);
        }

        return sortDirection === "asc" ? comparison : -comparison;
      });
  }, [
    clicks,
    search,
    statusFilter,
    deviceFilter,
    countryFilter,
    sortField,
    sortDirection,
  ]);

  const hasActiveFilters =
    search.trim() !== "" ||
    statusFilter !== "all" ||
    deviceFilter !== "all" ||
    countryFilter !== "all";

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setDeviceFilter("all");
    setCountryFilter("all");
  }

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((current) =>
        current === "asc" ? "desc" : "asc",
      );
      return;
    }

    setSortField(field);
    setSortDirection(field === "country" ? "asc" : "desc");
  }

  function SortButton({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) {
    const active = sortField === field;

    return (
      <button
        type="button"
        onClick={() => toggleSort(field)}
        className="inline-flex items-center gap-1.5 transition-colors hover:text-[#e8e8e0]"
        aria-label={`Sort by ${field}, ${
          active ? `currently ${sortDirection}` : "not currently sorted"
        }`}
      >
        {children}

        {active ? (
          sortDirection === "asc" ? (
            <ArrowUp size={12} />
          ) : (
            <ArrowDown size={12} />
          )
        ) : (
          <ArrowDownUp size={12} className="opacity-40" />
        )}
      </button>
    );
  }

  return (
    <section
      aria-label="Click event explorer"
      className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#111210]"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-white/[0.07] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium text-[#e8e8e0]">
              Event explorer
            </h2>

            <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-[#a3a49b]">
              {numberFormatter.format(filteredClicks.length)}
            </span>
          </div>

          <p className="mt-1.5 text-xs text-[#777970]">
            Search, filter, and inspect recorded click events.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-[#777970]">
          <SlidersHorizontal size={13} />
          <span>
            {hasActiveFilters ? "Filtered results" : "All events"}
          </span>
        </div>
      </div>

      {/* Search and filters */}
      <div className="space-y-3 border-b border-white/[0.07] p-4 sm:p-5">
        <div className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777970]"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search slug, destination, country, city, referrer..."
            aria-label="Search click events"
            className="h-10 w-full rounded-lg border border-white/[0.09] bg-[#0d0d0c] pl-10 pr-4 text-xs text-[#e8e8e0] outline-none placeholder:text-[#64665e] transition-colors focus:border-[#8ba870]/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SelectFilter
            label="Filter by status"
            value={statusFilter}
            onChange={setStatusFilter}
          >
            <option value="all">All statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </SelectFilter>

          <SelectFilter
            label="Filter by device"
            value={deviceFilter}
            onChange={setDeviceFilter}
          >
            <option value="all">All devices</option>
            {DEVICE_OPTIONS.map((device) => (
              <option key={device.value} value={device.value}>
                {device.label}
              </option>
            ))}
          </SelectFilter>

          <SelectFilter
            label="Filter by country"
            value={countryFilter}
            onChange={setCountryFilter}
          >
            <option value="all">All countries</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </SelectFilter>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs text-[#92938b] transition-colors hover:bg-white/[0.04] hover:text-[#e8e8e0]"
            >
              <X size={13} />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Event table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-left">
          <thead>
            <tr className="border-b border-white/[0.07] bg-white/[0.015] text-[10px] font-medium uppercase tracking-[0.12em] text-[#777970]">
              <th className="px-5 py-3.5 font-medium">Event / Link</th>

              <th className="px-4 py-3.5 font-medium">
                <SortButton field="country">Location</SortButton>
              </th>

              <th className="px-4 py-3.5 font-medium">Device</th>

              <th className="px-4 py-3.5 font-medium">Status</th>

              <th className="px-4 py-3.5 font-medium">
                <SortButton field="responseTime">
                  Response
                </SortButton>
              </th>

              <th className="px-5 py-3.5 font-medium">
                <SortButton field="timestamp">Timestamp</SortButton>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/[0.055]">
            {filteredClicks.map((click) => {
              const selected = click.id === selectedEventId;

              return (
                <tr
                  key={click.id}
                  className={`group cursor-pointer transition-colors ${
                    selected
                      ? "bg-[#8ba870]/[0.07]"
                      : "hover:bg-white/[0.025]"
                  }`}
                  onClick={() => onSelectEvent(click)}
                >
                  <td className="max-w-[260px] px-5 py-4">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelectEvent(click);
                      }}
                      aria-pressed={selected}
                      className="block w-full text-left outline-none"
                    >
                      <span className="block truncate text-xs font-medium text-[#e5e5dd] group-hover:text-white">
                        /{click.slug}
                      </span>

                      <span className="mt-1 block truncate font-mono text-[10px] text-[#777970]">
                        {click.id}
                      </span>
                    </button>
                  </td>

                  <td className="px-4 py-4">
                    <span className="block whitespace-nowrap text-xs text-[#c5c6bd]">
                      {click.city || "Unknown city"}
                    </span>
                    <span className="mt-1 block whitespace-nowrap text-[10px] text-[#777970]">
                      {click.country || "Unknown country"}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <span className="text-xs text-[#b7b8af]">
                      {DEVICE_LABELS[click.device]}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <StatusBadge status={click.status} />
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`whitespace-nowrap font-mono text-xs tabular-nums ${
                        click.responseTime >= 200
                          ? "text-amber-300"
                          : "text-[#b7b8af]"
                      }`}
                    >
                      {formatResponseTime(click.responseTime)}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <span className="text-[11px] tabular-nums text-[#92938b]">
                      {formatTimestamp(click.timestamp)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredClicks.length === 0 && (
          <div className="flex min-h-52 flex-col items-center justify-center px-6 text-center">
            <div className="flex size-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-[#777970]">
              <Search size={17} />
            </div>

            <p className="mt-4 text-sm font-medium text-[#d7d8d0]">
              {clicks.length === 0
                ? "No click events yet"
                : "No matching events"}
            </p>

            <p className="mt-1.5 max-w-sm text-xs leading-5 text-[#777970]">
              {clicks.length === 0
                ? "Events will appear here when analytics data is available."
                : "Try another search or clear your filters to see more events."}
            </p>

            {hasActiveFilters && clicks.length > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/[0.1] px-3 py-2 text-xs text-[#d7d8d0] transition-colors hover:bg-white/[0.05]"
              >
                <X size={13} />
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] px-5 py-3.5">
        <p className="text-[10px] text-[#777970]">
          Showing{" "}
          <span className="font-mono text-[#b7b8af]">
            {numberFormatter.format(filteredClicks.length)}
          </span>{" "}
          of{" "}
          <span className="font-mono text-[#b7b8af]">
            {numberFormatter.format(clicks.length)}
          </span>{" "}
          events
        </p>

        <p className="font-mono text-[10px] text-[#65675f]">
          IN-MEMORY · CLIENT-SIDE FILTERING
        </p>
      </div>
    </section>
  );
}

export default EventExplorer;
