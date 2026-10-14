"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

import type { ClickEvent } from "@/types/click";
import type {
  AnalyticsFilters,
  AnalyticsQuery,
  AnalyticsSort,
  AnalyticsWorkerResponse,
} from "@/workers/analytics.worker";

interface ClickDataGridProps {
  clicks: ClickEvent[];
}

const DEFAULT_FILTERS: AnalyticsFilters = {
  search: "",
  country: null,
  device: null,
  slug: null,
  status: null,
};

const DEFAULT_SORT: AnalyticsSort = {
  field: "timestamp",
  direction: "desc",
};

function formatTimestamp(
  timestamp: number,
): string {
  return new Date(timestamp).toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    },
  );
}

function formatResponseTime(
  responseTime: number,
): string {
  return `${responseTime.toFixed(1)}ms`;
}

function truncate(
  value: string,
  length: number,
): string {
  if (value.length <= length) {
    return value;
  }

  return `${value.slice(0, length - 1)}…`;
}

export function ClickDataGrid({
  clicks,
}: ClickDataGridProps) {
  const workerRef =
    useRef<Worker | null>(null);

  const queryIdRef = useRef(0);

  const parentRef =
    useRef<HTMLDivElement>(null);

  const [filters, setFilters] =
    useState<AnalyticsFilters>(
      DEFAULT_FILTERS,
    );

  const [sort, setSort] =
    useState<AnalyticsSort>(
      DEFAULT_SORT,
    );

  const [rows, setRows] =
    useState<ClickEvent[]>([]);

  const [workerReady, setWorkerReady] =
    useState(false);

  const [workerTime, setWorkerTime] =
    useState(0);

  const [isProcessing, setIsProcessing] =
    useState(false);

  const [workerError, setWorkerError] =
    useState<string | null>(null);

  const [queryId, setQueryId] =
    useState(0);

  /*
   * Create the worker once when the component
   * mounts and terminate it when it unmounts.
   */
  useEffect(() => {
    const worker = new Worker(
      new URL(
        "../../workers/analytics.worker.ts",
        import.meta.url,
      ),
    );

    workerRef.current = worker;

    worker.onmessage = (
      event: MessageEvent<AnalyticsWorkerResponse>,
    ) => {
      const message = event.data;

      if (message.type === "ready") {
        setWorkerReady(true);
        setWorkerTime(message.duration);
        setWorkerError(null);
        return;
      }

      if (message.type === "result") {
        /*
         * Ignore stale results if a newer query
         * has already been sent.
         */
        if (
          message.queryId !== queryIdRef.current
        ) {
          return;
        }

        setRows(message.rows);
        setWorkerTime(message.duration);
        setIsProcessing(false);
        setWorkerError(null);
        return;
      }

      if (message.type === "error") {
        setIsProcessing(false);
        setWorkerError(message.message);
      }
    };

    worker.onerror = (event) => {
      setIsProcessing(false);
      setWorkerError(
        event.message ||
          "Analytics worker failed.",
      );
    };

    worker.postMessage({
      type: "load",
      clicks,
    });

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [clicks]);

  const runQuery = useCallback(
    (
      nextFilters: AnalyticsFilters,
      nextSort: AnalyticsSort,
    ) => {
      const worker = workerRef.current;

      if (!worker || !workerReady) {
        return;
      }

      const nextQueryId =
        queryIdRef.current + 1;

      queryIdRef.current = nextQueryId;

      const query: AnalyticsQuery = {
        filters: nextFilters,
        sort: nextSort,
      };

      setQueryId(nextQueryId);
      setIsProcessing(true);
      setWorkerError(null);

      worker.postMessage({
        type: "query",
        queryId: nextQueryId,
        query,
      });
    },
    [workerReady],
  );

  /*
   * Once the worker has loaded the dataset,
   * perform the initial query.
   */
  useEffect(() => {
    if (!workerReady) {
      return;
    }

    runQuery(filters, sort);
  }, [
    workerReady,
    runQuery,
    filters,
    sort,
  ]);

  function updateSearch(
    value: string,
  ) {
    setFilters((current) => ({
      ...current,
      search: value,
    }));
  }

  function updateCountry(
    value: string,
  ) {
    setFilters((current) => ({
      ...current,
      country:
        value === "" ? null : value,
    }));
  }

  function updateDevice(
    value: string,
  ) {
    setFilters((current) => ({
      ...current,
      device:
        value === "" ? null : value as ClickEvent["device"],
    }));
  }

  function updateSortField(
    field: AnalyticsSort["field"],
  ) {
    setSort((current) => ({
      field,
      direction:
        current.field === field
          ? current.direction === "asc"
            ? "desc"
            : "asc"
          : "desc",
    }));
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
    setSort(DEFAULT_SORT);
  }

  const countries = useMemo(() => {
    return Array.from(
      new Set(
        clicks.map(
          (click) => click.country,
        ),
      ),
    ).sort();
  }, [clicks]);

  const virtualizer =
    useVirtualizer({
      count: rows.length,
      getScrollElement: () =>
        parentRef.current,
      estimateSize: () => 42,
      overscan: 8,
    });

  const virtualRows =
    virtualizer.getVirtualItems();

  return (
    <section className="flex min-h-0 flex-1 flex-col py-6 sm:py-7">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-[#292927] pb-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#6d9b82]">
              Analytics / 100k events
            </p>

            <p className="mt-1 text-xs text-[#777771]">
              Search, filter, and sort without
              blocking the main thread.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden font-mono text-[9px] uppercase tracking-[0.1em] text-[#555550] sm:block">
              {rows.length.toLocaleString()}{" "}
              matches
            </span>

            <span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.1em]">
              <span
                aria-hidden="true"
                className={[
                  "size-1.5 rounded-full",
                  workerReady && !workerError
                    ? "bg-[#6d9b82]"
                    : "bg-[#a64a43]",
                ].join(" ")}
              />

              <span className="text-[#777771]">
                {workerError
                  ? "Worker error"
                  : workerReady
                    ? "Worker ready"
                    : "Loading worker"}
              </span>
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-2 lg:flex-row">
          <div className="flex min-w-0 flex-1 items-center border border-[#353532] bg-[#111110] focus-within:border-[#666660]">
            <span className="hidden px-3 font-mono text-[9px] uppercase tracking-[0.1em] text-[#555550] sm:block">
              Search
            </span>

            <input
              type="search"
              value={filters.search}
              onChange={(event) =>
                updateSearch(
                  event.target.value,
                )
              }
              placeholder="Search events..."
              className="min-w-0 flex-1 bg-transparent px-3 py-3 font-mono text-xs text-[#f2f1ed] outline-none placeholder:text-[#4f4f4b]"
              aria-label="Search analytics events"
            />
          </div>

          <select
            value={filters.country ?? ""}
            onChange={(event) =>
              updateCountry(event.target.value)
            }
            className="border border-[#353532] bg-[#111110] px-3 py-3 font-mono text-[10px] text-[#777771] outline-none focus:border-[#666660] lg:w-40"
            aria-label="Filter by country"
          >
            <option value="">
              All countries
            </option>

            {countries.map((country) => (
              <option
                key={country}
                value={country}
              >
                {country}
              </option>
            ))}
          </select>

          <select
            value={filters.device ?? ""}
            onChange={(event) =>
              updateDevice(event.target.value)
            }
            className="border border-[#353532] bg-[#111110] px-3 py-3 font-mono text-[10px] text-[#777771] outline-none focus:border-[#666660] lg:w-32"
            aria-label="Filter by device"
          >
            <option value="">
              All devices
            </option>
            <option value="desktop">
              Desktop
            </option>
            <option value="mobile">
              Mobile
            </option>
            <option value="tablet">
              Tablet
            </option>
            <option value="bot">
              Bot
            </option>
          </select>

          <button
            type="button"
            onClick={resetFilters}
            className="border border-[#353532] px-4 py-3 font-mono text-[9px] uppercase tracking-[0.1em] text-[#777771] transition-colors hover:border-[#666660] hover:text-[#f2f1ed]"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Error */}
      {workerError ? (
        <div className="border-b border-[#292927] px-1 py-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-[#a64a43]">
            {workerError}
          </p>
        </div>
      ) : null}

      {/* Performance bar */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-[#292927] py-3">
        <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-[#555550]">
          Dataset{" "}
          <span className="text-[#777771]">
            {clicks.length.toLocaleString()}
          </span>
        </span>

        <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-[#555550]">
          Matches{" "}
          <span className="text-[#777771]">
            {rows.length.toLocaleString()}
          </span>
        </span>

        <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-[#555550]">
          Worker{" "}
          <span className="text-[#6d9b82]">
            {workerTime.toFixed(2)}ms
          </span>
        </span>

        <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-[#555550]">
          DOM{" "}
          <span className="text-[#777771]">
            {virtualRows.length}
          </span>
        </span>

        <span className="ml-auto hidden font-mono text-[9px] uppercase tracking-[0.08em] text-[#555550] sm:block">
          Query #{queryId}
        </span>
      </div>

      {/* Data grid */}
      <div className="mt-4 min-h-0 flex-1 border-t border-[#292927]">
        <div className="grid grid-cols-[125px_minmax(100px,1fr)_130px_95px_90px] gap-4 border-b border-[#292927] px-3 py-2.5">
          <button
            type="button"
            onClick={() =>
              updateSortField("timestamp")
            }
            className="text-left font-mono text-[8px] uppercase tracking-[0.12em] text-[#555550] transition-colors hover:text-[#f2f1ed]"
          >
            Time
            {sort.field === "timestamp"
              ? sort.direction === "asc"
                ? " ↑"
                : " ↓"
              : null}
          </button>

          <button
            type="button"
            onClick={() =>
              updateSortField("slug")
            }
            className="text-left font-mono text-[8px] uppercase tracking-[0.12em] text-[#555550] transition-colors hover:text-[#f2f1ed]"
          >
            Link
            {sort.field === "slug"
              ? sort.direction === "asc"
                ? " ↑"
                : " ↓"
              : null}
          </button>

          <button
            type="button"
            onClick={() =>
              updateSortField("country")
            }
            className="text-left font-mono text-[8px] uppercase tracking-[0.12em] text-[#555550] transition-colors hover:text-[#f2f1ed]"
          >
            Location
            {sort.field === "country"
              ? sort.direction === "asc"
                ? " ↑"
                : " ↓"
              : null}
          </button>

          <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#555550]">
            Device
          </span>

          <button
            type="button"
            onClick={() =>
              updateSortField(
                "responseTime",
              )
            }
            className="text-right font-mono text-[8px] uppercase tracking-[0.12em] text-[#555550] transition-colors hover:text-[#f2f1ed]"
          >
            Latency
            {sort.field === "responseTime"
              ? sort.direction === "asc"
                ? " ↑"
                : " ↓"
              : null}
          </button>
        </div>

        <div
          ref={parentRef}
          className="h-[min(58vh,620px)] overflow-auto"
        >
          {!workerReady || isProcessing ? (
            <div className="flex h-full items-center justify-center">
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555550]">
                {workerReady
                  ? "Processing dataset..."
                  : "Loading dataset..."}
              </p>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555550]">
                No matching events
              </p>
            </div>
          ) : (
            <div
              className="relative w-full"
              style={{
                height: `${virtualizer.getTotalSize()}px`,
              }}
            >
              {virtualRows.map(
                (virtualRow) => {
                  const click =
                    rows[virtualRow.index];

                  return (
                    <div
                      key={click.id}
                      data-index={
                        virtualRow.index
                      }
                      ref={virtualizer.measureElement}
                      className="absolute left-0 top-0 grid w-full grid-cols-[125px_minmax(100px,1fr)_130px_95px_90px] gap-4 border-b border-[#292927] px-3 py-3"
                      style={{
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <span className="font-mono text-[10px] tabular-nums text-[#777771]">
                        {formatTimestamp(
                          click.timestamp,
                        )}
                      </span>

                      <div className="min-w-0">
                        <p className="truncate font-mono text-[10px] text-[#f2f1ed]">
                          /{click.slug}
                        </p>

                        <p className="mt-0.5 truncate font-mono text-[8px] text-[#555550]">
                          {truncate(
                            click.destination,
                            48,
                          )}
                        </p>
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-mono text-[10px] text-[#777771]">
                          {click.city}
                        </p>

                        <p className="mt-0.5 truncate font-mono text-[8px] text-[#555550]">
                          {click.country}
                        </p>
                      </div>

                      <span className="font-mono text-[9px] uppercase tracking-[0.06em] text-[#777771]">
                        {click.device}
                      </span>

                      <span className="text-right font-mono text-[10px] tabular-nums text-[#f2f1ed]">
                        {formatResponseTime(
                          click.responseTime,
                        )}
                      </span>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}