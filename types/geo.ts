import type { DeviceType } from "@/types/click";

/**
 * Aggregated click data for one geographic location.
 *
 * Multiple ClickEvents can belong to the same city.
 * The globe renders this aggregated representation
 * instead of rendering every individual click.
 */
export interface GeoLocation {
  id: string;

  country: string;
  city: string;

  latitude: number;
  longitude: number;

  clicks: number;
  percentage: number;

  averageResponseTime: number;
  successRate: number;

  devices: Record<DeviceType, number>;

  topReferrer: string | null;
  topSlug: string | null;

  latestTimestamp: number;
}

/**
 * A visual connection between two geographic locations.
 *
 * These arcs are a visualization of traffic distribution,
 * not literal user-to-user network paths.
 */
export interface GeoArc {
  id: string;

  startLat: number;
  startLng: number;

  endLat: number;
  endLng: number;

  clicks: number;
}

/**
 * Summary metrics for the Day 3 globe.
 */
export interface GlobeStats {
  totalClicks: number;
  countries: number;
  locations: number;

  averageResponseTime: number;
  successRate: number;
}

/**
 * Complete geographic dataset consumed by the globe workspace.
 */
export interface GlobeData {
  locations: GeoLocation[];
  arcs: GeoArc[];
  stats: GlobeStats;
}
