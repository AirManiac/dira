import type { ClickEvent } from "@/types/click";

type SortField =
  | "timestamp"
  | "responseTime"
  | "slug"
  | "country"
  | "city";

type SortDirection = "asc" | "desc";

export interface AnalyticsFilters {
  search: string;
  country: string | null;
  device: ClickEvent["device"] | null;
  slug: string | null;
  status: ClickEvent["status"] | null;
}

export interface AnalyticsSort {
  field: SortField;
  direction: SortDirection;
}

export interface AnalyticsQuery {
  filters: AnalyticsFilters;
  sort: AnalyticsSort;
}

export interface AnalyticsResult {
  type: "result";
  queryId: number;
  rows: ClickEvent[];
  total: number;
  duration: number;
}

export interface AnalyticsReadyResult {
  type: "ready";
  count: number;
  duration: number;
}

export interface AnalyticsError {
  type: "error";
  queryId?: number;
  message: string;
}

export type AnalyticsWorkerResponse =
  | AnalyticsResult
  | AnalyticsReadyResult
  | AnalyticsError;

type WorkerRequest =
  | {
      type: "load";
      clicks: ClickEvent[];
    }
  | {
      type: "query";
      queryId: number;
      query: AnalyticsQuery;
    };

let dataset: ClickEvent[] = [];

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

function normalizeSearch(
  value: string,
): string {
  return value.trim().toLowerCase();
}

function matchesSearch(
  click: ClickEvent,
  search: string,
): boolean {
  if (!search) {
    return true;
  }

  return [
    click.id,
    click.slug,
    click.destination,
    click.country,
    click.city,
    click.referrer ?? "",
    click.device,
    click.status,
  ].some((value) =>
    value.toLowerCase().includes(search),
  );
}

function matchesFilters(
  click: ClickEvent,
  filters: AnalyticsFilters,
): boolean {
  if (
    filters.country !== null &&
    click.country !== filters.country
  ) {
    return false;
  }

  if (
    filters.device !== null &&
    click.device !== filters.device
  ) {
    return false;
  }

  if (
    filters.slug !== null &&
    click.slug !== filters.slug
  ) {
    return false;
  }

  if (
    filters.status !== null &&
    click.status !== filters.status
  ) {
    return false;
  }

  return matchesSearch(
    click,
    normalizeSearch(filters.search),
  );
}

function compareValues(
  a: ClickEvent,
  b: ClickEvent,
  field: SortField,
): number {
  switch (field) {
    case "timestamp":
      return a.timestamp - b.timestamp;

    case "responseTime":
      return a.responseTime - b.responseTime;

    case "slug":
      return a.slug.localeCompare(b.slug);

    case "country":
      return a.country.localeCompare(b.country);

    case "city":
      return a.city.localeCompare(b.city);

    default:
      return 0;
  }
}

function sortClicks(
  clicks: ClickEvent[],
  sort: AnalyticsSort,
): ClickEvent[] {
  return clicks.sort((a, b) => {
    const comparison = compareValues(
      a,
      b,
      sort.field,
    );

    return sort.direction === "asc"
      ? comparison
      : -comparison;
  });
}

function queryDataset(
  query: AnalyticsQuery,
): ClickEvent[] {
  const filtered = dataset.filter(
    (click) =>
      matchesFilters(
        click,
        query.filters,
      ),
  );

  return sortClicks(
    filtered,
    query.sort,
  );
}

function postMessage(
  message: AnalyticsWorkerResponse,
): void {
  self.postMessage(message);
}

self.onmessage = (
  event: MessageEvent<WorkerRequest>,
) => {
  try {
    const message = event.data;

    if (message.type === "load") {
      const startedAt = performance.now();

      dataset = message.clicks;

      postMessage({
        type: "ready",
        count: dataset.length,
        duration: Number(
          (
            performance.now() - startedAt
          ).toFixed(2),
        ),
      });

      return;
    }

    if (message.type === "query") {
      const startedAt = performance.now();

      const rows = queryDataset(
        message.query,
      );

      postMessage({
        type: "result",
        queryId: message.queryId,
        rows,
        total: rows.length,
        duration: Number(
          (
            performance.now() - startedAt
          ).toFixed(2),
        ),
      });

      return;
    }
  } catch (error) {
    postMessage({
      type: "error",
      message:
        error instanceof Error
          ? error.message
          : "Analytics worker failed.",
    });
  }
};

/*
 * Keep the defaults referenced so they can be
 * reused when the worker protocol expands.
 */
void DEFAULT_FILTERS;
void DEFAULT_SORT;
