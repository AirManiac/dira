import type { ClickEvent, DeviceType } from "@/types/click";
import type {
  GeoArc,
  GeoLocation,
  GlobeData,
  GlobeStats,
} from "@/types/geo";

interface LocationAccumulator {
  country: string;
  city: string;
  latitude: number;
  longitude: number;

  clicks: number;
  totalResponseTime: number;
  successfulClicks: number;

  devices: Record<DeviceType, number>;

  referrers: Map<string, number>;
  slugs: Map<string, number>;

  latestTimestamp: number;
}

/**
 * Creates the initial device counter for a location.
 *
 * Keeping all device keys present means the UI can safely
 * render desktop/mobile/tablet/bot statistics without
 * checking whether a property exists first.
 */
function createDeviceCounts(): Record<DeviceType, number> {
  return {
    desktop: 0,
    mobile: 0,
    tablet: 0,
    bot: 0,
  };
}

/**
 * Creates a stable identifier for a geographic location.
 */
function createLocationId(
  country: string,
  city: string,
): string {
  return `${country}:${city}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Finds the most frequently occurring value in a counter map.
 */
function getTopValue(
  values: Map<string, number>,
): string | null {
  let topValue: string | null = null;
  let topCount = 0;

  for (const [value, count] of values) {
    if (count > topCount) {
      topValue = value;
      topCount = count;
    }
  }

  return topValue;
}

/**
 * Aggregate raw click events into geographic locations.
 *
 * Multiple clicks from the same city become one GeoLocation.
 *
 * Example:
 *
 * Lagos
 * Lagos
 * Lagos
 * London
 *
 * becomes:
 *
 * Lagos  -> 3 clicks
 * London -> 1 click
 */
function aggregateLocations(
  clicks: ClickEvent[],
): GeoLocation[] {
  const locations = new Map<
    string,
    LocationAccumulator
  >();

  for (const click of clicks) {
    const id = createLocationId(
      click.country,
      click.city,
    );

    let location = locations.get(id);

    if (!location) {
      location = {
        country: click.country,
        city: click.city,
        latitude: click.latitude,
        longitude: click.longitude,

        clicks: 0,
        totalResponseTime: 0,
        successfulClicks: 0,

        devices: createDeviceCounts(),

        referrers: new Map(),
        slugs: new Map(),

        latestTimestamp: click.timestamp,
      };

      locations.set(id, location);
    }

    location.clicks += 1;
    location.totalResponseTime +=
      click.responseTime;

    if (click.status === "success") {
      location.successfulClicks += 1;
    }

    location.devices[click.device] += 1;

    if (click.referrer) {
      location.referrers.set(
        click.referrer,
        (location.referrers.get(
          click.referrer,
        ) ?? 0) + 1,
      );
    }

    location.slugs.set(
      click.slug,
      (location.slugs.get(click.slug) ?? 0) + 1,
    );

    location.latestTimestamp = Math.max(
      location.latestTimestamp,
      click.timestamp,
    );
  }

  const totalClicks = clicks.length;

  return Array.from(locations.entries())
    .map(([id, location]): GeoLocation => ({
      id,

      country: location.country,
      city: location.city,

      latitude: location.latitude,
      longitude: location.longitude,

      clicks: location.clicks,

      percentage:
        totalClicks === 0
          ? 0
          : Number(
              (
                (location.clicks /
                  totalClicks) *
                100
              ).toFixed(1),
            ),

      averageResponseTime:
        location.clicks === 0
          ? 0
          : Number(
              (
                location.totalResponseTime /
                location.clicks
              ).toFixed(2),
            ),

      successRate:
        location.clicks === 0
          ? 0
          : Number(
              (
                (location.successfulClicks /
                  location.clicks) *
                100
              ).toFixed(1),
            ),

      devices: location.devices,

      topReferrer: getTopValue(
        location.referrers,
      ),

      topSlug: getTopValue(location.slugs),

      latestTimestamp:
        location.latestTimestamp,
    }))
    .sort((a, b) => b.clicks - a.clicks);
}

/**
 * Creates visual traffic arcs between the most active
 * geographic locations.
 *
 * These are intentionally visual connections rather
 * than claims about actual network paths.
 */
function createArcs(
  locations: GeoLocation[],
): GeoArc[] {
  if (locations.length < 2) {
    return [];
  }

  /*
   * Only use the most active locations.
   *
   * This keeps the globe visually clean when the dataset
   * eventually grows beyond the current 10–50 events.
   */
  const activeLocations = locations
    .slice()
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 6);

  const arcs: GeoArc[] = [];

  /*
   * Connect each active location to the next active
   * location. This produces a simple visual network
   * without pretending that individual clicks have
   * source/destination coordinates.
   */
  for (
    let index = 0;
    index < activeLocations.length - 1;
    index += 1
  ) {
    const start = activeLocations[index];
    const end = activeLocations[index + 1];

    arcs.push({
      id: `${start.id}-${end.id}`,

      startLat: start.latitude,
      startLng: start.longitude,

      endLat: end.latitude,
      endLng: end.longitude,

      clicks: Math.min(
        start.clicks,
        end.clicks,
      ),
    });
  }

  return arcs;
}

/**
 * Calculate global summary metrics.
 */
function createStats(
  clicks: ClickEvent[],
  locations: GeoLocation[],
): GlobeStats {
  if (clicks.length === 0) {
    return {
      totalClicks: 0,
      countries: 0,
      locations: 0,
      averageResponseTime: 0,
      successRate: 0,
    };
  }

  const countries = new Set(
    clicks.map((click) => click.country),
  );

  const totalResponseTime = clicks.reduce(
    (total, click) =>
      total + click.responseTime,
    0,
  );

  const successfulClicks = clicks.filter(
    (click) => click.status === "success",
  ).length;

  return {
    totalClicks: clicks.length,

    countries: countries.size,

    locations: locations.length,

    averageResponseTime: Number(
      (
        totalResponseTime / clicks.length
      ).toFixed(2),
    ),

    successRate: Number(
      (
        (successfulClicks /
          clicks.length) *
        100
      ).toFixed(1),
    ),
  };
}

/**
 * Transform raw analytics events into the compact
 * dataset consumed by the Day 3 globe.
 */
export function aggregateGeo(
  clicks: ClickEvent[],
): GlobeData {
  const locations = aggregateLocations(
    clicks,
  );

  const arcs = createArcs(locations);

  const stats = createStats(
    clicks,
    locations,
  );

  return {
    locations,
    arcs,
    stats,
  };
}