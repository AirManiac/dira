
import type { ClickEvent, ClickStatus, DeviceType } from "@/types/click";

export interface MetricBreakdown<T extends string = string> {
  label: T;
  count: number;
  percentage: number;
}

export interface CountryBreakdown {
  country: string;
  clicks: number;
  percentage: number;
}

export interface LinkBreakdown {
  slug: string;
  destination: string;
  clicks: number;
  averageResponseTime: number;
  successRate: number;
}

export interface ResponseTimeBucket {
  label: string;
  min: number;
  max: number | null;
  count: number;
  percentage: number;
}

export interface AnalyticsInsights {
  totalClicks: number;
  averageResponseTime: number;
  medianResponseTime: number;
  successRate: number;
  statusBreakdown: MetricBreakdown<ClickStatus>[];
  deviceBreakdown: MetricBreakdown<DeviceType>[];
  countryBreakdown: CountryBreakdown[];
  linkBreakdown: LinkBreakdown[];
  responseTimeDistribution: ResponseTimeBucket[];
  slowestEvent: ClickEvent | null;
  latestEvent: ClickEvent | null;
  mostActiveCountry: CountryBreakdown | null;
  mostClickedLink: LinkBreakdown | null;
}

const STATUSES: ClickStatus[] = [
  "success",
  "redirect",
  "not_found",
  "error",
];

const DEVICES: DeviceType[] = [
  "desktop",
  "mobile",
  "tablet",
  "bot",
];

const RESPONSE_TIME_BUCKETS = [
  { label: "0–50 ms", min: 0, max: 50 },
  { label: "51–100 ms", min: 51, max: 100 },
  { label: "101–200 ms", min: 101, max: 200 },
  { label: "201+ ms", min: 201, max: null },
] as const;

const SUCCESS_STATUSES = new Set<ClickStatus>([
  "success",
  "redirect",
]);

function percentage(count: number, total: number): number {
  if (total === 0) return 0;

  return Number(((count / total) * 100).toFixed(1));
}

function average(values: number[]): number {
  if (values.length === 0) return 0;

  const total = values.reduce((sum, value) => sum + value, 0);

  return Math.round(total / values.length);
}

function median(values: number[]): number {
  if (values.length === 0) return 0;

  // Sort a copy so the caller's data is never mutated.
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 !== 0) {
    return sorted[middle];
  }

  return Math.round(
    (sorted[middle - 1] + sorted[middle]) / 2,
  );
}

function getValidResponseTimes(clicks: ClickEvent[]): number[] {
  return clicks
    .map((click) => click.responseTime)
    .filter(
      (value) => Number.isFinite(value) && value >= 0,
    );
}

function getStatusBreakdown(
  clicks: ClickEvent[],
): MetricBreakdown<ClickStatus>[] {
  const counts = new Map<ClickStatus, number>();

  for (const status of STATUSES) {
    counts.set(status, 0);
  }

  for (const click of clicks) {
    counts.set(
      click.status,
      (counts.get(click.status) ?? 0) + 1,
    );
  }

  return STATUSES.map((status) => {
    const count = counts.get(status) ?? 0;

    return {
      label: status,
      count,
      percentage: percentage(count, clicks.length),
    };
  });
}

function getDeviceBreakdown(
  clicks: ClickEvent[],
): MetricBreakdown<DeviceType>[] {
  const counts = new Map<DeviceType, number>();

  for (const device of DEVICES) {
    counts.set(device, 0);
  }

  for (const click of clicks) {
    counts.set(
      click.device,
      (counts.get(click.device) ?? 0) + 1,
    );
  }

  return DEVICES.map((device) => {
    const count = counts.get(device) ?? 0;

    return {
      label: device,
      count,
      percentage: percentage(count, clicks.length),
    };
  });
}

function getCountryBreakdown(
  clicks: ClickEvent[],
): CountryBreakdown[] {
  const counts = new Map<string, number>();

  for (const click of clicks) {
    const country = click.country.trim() || "Unknown";

    counts.set(country, (counts.get(country) ?? 0) + 1);
  }

  return Array.from(counts, ([country, count]) => ({
    country,
    clicks: count,
    percentage: percentage(count, clicks.length),
  })).sort((a, b) => b.clicks - a.clicks);
}

function getLinkBreakdown(
  clicks: ClickEvent[],
): LinkBreakdown[] {
  const groups = new Map<
    string,
    {
      slug: string;
      destination: string;
      clicks: number;
      responseTimes: number[];
      successfulClicks: number;
    }
  >();

  for (const click of clicks) {
    const key = `${click.slug}\u0000${click.destination}`;

    let group = groups.get(key);

    if (!group) {
      group = {
        slug: click.slug,
        destination: click.destination,
        clicks: 0,
        responseTimes: [],
        successfulClicks: 0,
      };

      groups.set(key, group);
    }

    group.clicks += 1;

    if (
      Number.isFinite(click.responseTime) &&
      click.responseTime >= 0
    ) {
      group.responseTimes.push(click.responseTime);
    }

    if (SUCCESS_STATUSES.has(click.status)) {
      group.successfulClicks += 1;
    }
  }

  return Array.from(groups.values())
    .map((group) => ({
      slug: group.slug,
      destination: group.destination,
      clicks: group.clicks,
      averageResponseTime: average(group.responseTimes),
      successRate: percentage(
        group.successfulClicks,
        group.clicks,
      ),
    }))
    .sort((a, b) => b.clicks - a.clicks);
}

function getResponseTimeDistribution(
  responseTimes: number[],
): ResponseTimeBucket[] {
  return RESPONSE_TIME_BUCKETS.map((bucket) => {
    const count = responseTimes.filter((time) => {
      if (bucket.max === null) {
        return time >= bucket.min;
      }

      return time >= bucket.min && time <= bucket.max;
    }).length;

    return {
      ...bucket,
      count,
      percentage: percentage(count, responseTimes.length),
    };
  });
}

export function getAnalyticsInsights(
  clicks: ClickEvent[],
): AnalyticsInsights {
  const responseTimes = getValidResponseTimes(clicks);

  const successfulClicks = clicks.filter((click) =>
    SUCCESS_STATUSES.has(click.status),
  ).length;

  const countryBreakdown = getCountryBreakdown(clicks);
  const linkBreakdown = getLinkBreakdown(clicks);

  // Do not mutate the original event array when finding the latest event.
  const latestEvent =
    clicks.length === 0
      ? null
      : clicks.reduce((latest, click) =>
          click.timestamp > latest.timestamp ? click : latest,
        );

  const slowestEvent =
    clicks.reduce<ClickEvent | null>((slowest, click) => {
      if (
        !Number.isFinite(click.responseTime) ||
        click.responseTime < 0
      ) {
        return slowest;
      }

      if (
        slowest === null ||
        click.responseTime > slowest.responseTime
      ) {
        return click;
      }

      return slowest;
    }, null);

  return {
    totalClicks: clicks.length,
    averageResponseTime: average(responseTimes),
    medianResponseTime: median(responseTimes),
    successRate: percentage(successfulClicks, clicks.length),
    statusBreakdown: getStatusBreakdown(clicks),
    deviceBreakdown: getDeviceBreakdown(clicks),
    countryBreakdown,
    linkBreakdown,
    responseTimeDistribution:
      getResponseTimeDistribution(responseTimes),
    slowestEvent,
    latestEvent,
    mostActiveCountry: countryBreakdown[0] ?? null,
    mostClickedLink: linkBreakdown[0] ?? null,
  };
}
