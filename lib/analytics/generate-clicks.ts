import type {
  ClickEvent,
  DeviceType,
} from "@/types/click";

const COUNTRIES = [
  {
    country: "Nigeria",
    cities: [
      { city: "Lagos", latitude: 6.5244, longitude: 3.3792 },
      { city: "Abuja", latitude: 9.0765, longitude: 7.3986 },
      { city: "Ibadan", latitude: 7.3775, longitude: 3.947 },
    ],
  },
  {
    country: "United States",
    cities: [
      {
        city: "New York",
        latitude: 40.7128,
        longitude: -74.006,
      },
      {
        city: "San Francisco",
        latitude: 37.7749,
        longitude: -122.4194,
      },
      {
        city: "Chicago",
        latitude: 41.8781,
        longitude: -87.6298,
      },
    ],
  },
  {
    country: "United Kingdom",
    cities: [
      {
        city: "London",
        latitude: 51.5074,
        longitude: -0.1278,
      },
      {
        city: "Manchester",
        latitude: 53.4808,
        longitude: -2.2426,
      },
    ],
  },
  {
    country: "Germany",
    cities: [
      {
        city: "Berlin",
        latitude: 52.52,
        longitude: 13.405,
      },
      {
        city: "Munich",
        latitude: 48.1351,
        longitude: 11.582,
      },
    ],
  },
  {
    country: "Japan",
    cities: [
      {
        city: "Tokyo",
        latitude: 35.6762,
        longitude: 139.6503,
      },
      {
        city: "Osaka",
        latitude: 34.6937,
        longitude: 135.5023,
      },
    ],
  },
];

const DEVICES: DeviceType[] = [
  "desktop",
  "desktop",
  "desktop",
  "mobile",
  "mobile",
  "tablet",
];

const REFERRERS = [
  "https://google.com",
  "https://twitter.com",
  "https://github.com",
  "https://linkedin.com",
  "https://news.ycombinator.com",
  null,
];

const USER_AGENTS = {
  desktop:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/148.0.0.0",
  mobile:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 Mobile",
  tablet:
    "Mozilla/5.0 (iPad; CPU OS 18_6 like Mac OS X) AppleWebKit/605.1.15 Mobile",
  bot:
    "Mozilla/5.0 compatible; LinkPerformanceBot/1.0",
} satisfies Record<DeviceType, string>;

export interface SyntheticLink {
  id: string;
  slug: string;
  destination: string;
}

export interface GenerateClicksOptions {
  count: number;
  links: SyntheticLink[];
  seed?: number;
  startTime?: number;
}

function createRandom(seed: number) {
  let state = seed >>> 0;

  return function random() {
    state += 0x6d2b79f5;

    let value = state;

    value = Math.imul(
      value ^ (value >>> 15),
      value | 1,
    );

    value ^= value + Math.imul(
      value ^ (value >>> 7),
      value | 61,
    );

    return (
      ((value ^ (value >>> 14)) >>> 0) /
      4294967296
    );
  };
}

function pick<T>(
  items: readonly T[],
  random: () => number,
): T {
  return items[
    Math.floor(random() * items.length)
  ];
}

function createId(index: number, seed: number) {
  return `synthetic-${seed}-${index}`;
}

function createTimestamp(
  index: number,
  count: number,
  startTime: number,
  random: () => number,
) {
  const spread = 24 * 60 * 60 * 1000;

  const position =
    count <= 1 ? 0 : index / (count - 1);

  const jitter =
    (random() - 0.5) * 60 * 60 * 1000;

  return Math.round(
    startTime - spread * (1 - position) + jitter,
  );
}

function createResponseTime(
  random: () => number,
) {
  const base = 2.5 + random() * 5;

  return Number(
    base.toFixed(2),
  );
}

export function generateClicks({
  count,
  links,
  seed = 42,
  startTime = Date.now(),
}: GenerateClicksOptions): ClickEvent[] {
  if (count < 0) {
    throw new Error(
      "Click count cannot be negative.",
    );
  }

  if (links.length === 0 && count > 0) {
    throw new Error(
      "At least one link is required to generate clicks.",
    );
  }

  const random = createRandom(seed);

  return Array.from(
    { length: count },
    (_, index): ClickEvent => {
      const link = pick(links, random);

      const locationGroup = pick(
        COUNTRIES,
        random,
      );

      const location = pick(
        locationGroup.cities,
        random,
      );

      const device = pick(
        DEVICES,
        random,
      );

      const referrer = pick(
        REFERRERS,
        random,
      );

      return {
        id: createId(index, seed),
        timestamp: createTimestamp(
          index,
          count,
          startTime,
          random,
        ),
        linkId: link.id,
        slug: link.slug,
        destination: link.destination,
        country: locationGroup.country,
        city: location.city,
        latitude: location.latitude,
        longitude: location.longitude,
        referrer,
        userAgent: USER_AGENTS[device],
        device,
        status: "success",
        responseTime: createResponseTime(
          random,
        ),
      };
    },
  );
}