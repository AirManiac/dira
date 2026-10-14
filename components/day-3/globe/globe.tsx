"use client";

import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import Globe from "react-globe.gl";

import type {
  GeoArc,
  GeoLocation,
  GlobeData,
} from "@/types/geo";

interface GlobeProps {
  data: GlobeData;
  onLocationSelect?: (
    location: GeoLocation | null,
  ) => void;
}

interface GlobeInstance {
  controls: () => {
    autoRotate: boolean;
    autoRotateSpeed: number;
    enableDamping: boolean;
    dampingFactor: number;
    minDistance: number;
    maxDistance: number;
  };
  pointOfView: (
    pov: {
      lat: number;
      lng: number;
      altitude: number;
    },
    transitionDuration?: number,
  ) => void;
}

/**
 * Main Day 3 geographic visualization.
 *
 * react-globe.gl handles the underlying Three.js/WebGL
 * scene. This component is intentionally responsible only
 * for configuring the globe and connecting our analytics
 * data to its visualization layers.
 */
export function GlobeVisualization({
  data,
  onLocationSelect,
}: GlobeProps) {
  const globeRef =
    useRef<GlobeInstance | undefined>(
      undefined,
    );

  const [hoveredLocation, setHoveredLocation] =
    useState<GeoLocation | null>(null);

  const [selectedLocation, setSelectedLocation] =
    useState<GeoLocation | null>(null);

  /*
   * Use the selected location when the user clicks,
   * otherwise use the currently hovered location.
   *
   * This gives us two interaction states:
   *
   * hover → temporary inspection
   * click → persistent inspection
   */
  const activeLocation =
    selectedLocation ?? hoveredLocation;

  /*
   * Scale point size based on traffic volume.
   *
   * The actual click count remains in the data; this
   * only converts it into a visual radius.
   */
  const pointRadius = useCallback(
    (location: object) => {
      const point =
        location as GeoLocation;

      const maxClicks = Math.max(
        ...data.locations.map(
          (item) => item.clicks,
        ),
        1,
      );

      const normalized =
        point.clicks / maxClicks;

      return 0.12 + normalized * 0.18;
    },
    [data.locations],
  );

  /*
   * Make high-traffic locations rise slightly higher
   * from the Earth's surface.
   */
  const pointAltitude = useCallback(
    (location: object) => {
      const point =
        location as GeoLocation;

      const maxClicks = Math.max(
        ...data.locations.map(
          (item) => item.clicks,
        ),
        1,
      );

      const normalized =
        point.clicks / maxClicks;

      return 0.015 + normalized * 0.08;
    },
    [data.locations],
  );

  /*
   * Keep the point palette restrained.
   *
   * The Earth remains realistic and photographic while
   * the analytics layer gets the visual accent.
   */
  const pointColor = useCallback(
    (location: object) => {
      const point =
        location as GeoLocation;

      if (
        selectedLocation?.id === point.id
      ) {
        return "#c9e7a5";
      }

      if (
        hoveredLocation?.id === point.id
      ) {
        return "#b7d68f";
      }

      return "#8ba870";
    },
    [
      hoveredLocation,
      selectedLocation,
    ],
  );

  /*
   * Arc appearance is deliberately subtle.
   *
   * We use animated dashes rather than thick solid
   * lines so the globe feels alive without becoming
   * visually noisy.
   */
  const arcColor = useCallback(
    () => "#8ba870",
    [],
  );

  const arcAltitude = useCallback(
    (arc: object) => {
      const item = arc as GeoArc;

      const maxClicks = Math.max(
        ...data.arcs.map(
          (entry) => entry.clicks,
        ),
        1,
      );

      return (
        0.08 +
        (item.clicks / maxClicks) * 0.12
      );
    },
    [data.arcs],
  );

  /*
   * Rings use the same geographic locations as the
   * points. Only the most active locations receive
   * rings so the scene doesn't become cluttered.
   */
  const rings = useMemo(() => {
    if (data.locations.length === 0) {
      return [];
    }

    const maxClicks = Math.max(
      ...data.locations.map(
        (location) => location.clicks,
      ),
      1,
    );

    return data.locations
      .filter(
        (location) =>
          location.clicks >=
          Math.max(1, maxClicks * 0.25),
      )
      .map((location) => ({
        ...location,
        maxRadius:
          1.5 +
          (location.clicks /
            maxClicks) *
            2.5,
      }));
  }, [data.locations]);

  const handlePointHover = useCallback(
    (
      location: object | null,
    ) => {
      const nextLocation =
        (location as GeoLocation | null) ??
        null;

      setHoveredLocation(nextLocation);
    },
    [],
  );

  const handlePointClick = useCallback(
    (location: object) => {
      const nextLocation =
        location as GeoLocation;

      setSelectedLocation(
        (current) =>
          current?.id === nextLocation.id
            ? null
            : nextLocation,
      );

      onLocationSelect?.(
        nextLocation,
      );

      /*
       * When a location is selected, smoothly move
       * the camera toward it.
       */
      globeRef.current?.pointOfView(
        {
          lat: nextLocation.latitude,
          lng: nextLocation.longitude,
          altitude: 2.2,
        },
        800,
      );
    },
    [onLocationSelect],
  );

  const handleGlobeClick = useCallback(() => {
    /*
     * Clicking empty globe space clears the persistent
     * selection and returns control to hover state.
     */
    setSelectedLocation(null);
    onLocationSelect?.(null);
  }, [onLocationSelect]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Globe
        ref={globeRef}
        width={undefined}
        height={undefined}

        /*
         * Real Earth texture.
         *
         * These files live in /public/globe and should be
         * equirectangular Earth textures.
         */
        globeImageUrl="/earth.jpg"
        bumpImageUrl="/earth-bump.jpg"

        /*
         * Keep the surrounding scene dark so the Earth
         * remains the visual focal point.
         */
        backgroundColor="#0d0d0c"

        /*
         * Realistic atmospheric halo.
         */
        showAtmosphere
        atmosphereColor="#8ba870"
        atmosphereAltitude={0.12}

        /*
         * Disable graticules. We want an editorial,
         * photographic Earth rather than a data-science
         * demo with latitude/longitude lines everywhere.
         */
        showGraticules={false}

        /*
         * Traffic locations.
         */
        pointsData={data.locations}
        pointLat="latitude"
        pointLng="longitude"
        pointRadius={pointRadius}
        pointAltitude={pointAltitude}
        pointColor={pointColor}
        pointResolution={16}
        pointsMerge={false}
        pointsTransitionDuration={600}

        /*
         * Keep native tooltip output disabled. Our own
         * LocationPanel will provide the premium UI.
         */
        pointLabel={() => ""}

        onPointHover={handlePointHover}
        onPointClick={handlePointClick}

        /*
         * Traffic arcs.
         */
        arcsData={data.arcs}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor={arcColor}
        arcAltitude={arcAltitude}
        arcAltitudeAutoScale={0.7}
        arcStroke={0.35}
        arcDashLength={0.45}
        arcDashGap={1.2}
        arcDashAnimateTime={1600}
        arcsTransitionDuration={700}
        arcLabel={() => ""}

        /*
         * Animated activity rings.
         */
        ringsData={rings}
        ringLat="latitude"
        ringLng="longitude"
        ringAltitude={0.018}
        ringColor={() => "#8ba870"}
        ringMaxRadius="maxRadius"
        ringPropagationSpeed={0.7}
        ringRepeatPeriod={1800}

        /*
         * Pointer interaction is required for the
         * location hover/click experience.
         */
        enablePointerInteraction

        /*
         * Initialize the globe at a useful world view.
         */
        onGlobeReady={() => {
          const controls =
            globeRef.current?.controls();

          if (!controls) {
            return;
          }

          controls.autoRotate = true;
          controls.autoRotateSpeed = 0.25;

          controls.enableDamping = true;
          controls.dampingFactor = 0.08;

          controls.minDistance = 120;
          controls.maxDistance = 350;
        }}

        onGlobeClick={
          handleGlobeClick
        }

        /*
         * A clean initial camera position.
         *
         * This is intentionally not centered on Lagos
         * or any particular country. The user discovers
         * the traffic map by interacting with it.
         */
        globeOffset={[0, 0]}
      />

      {activeLocation && (
        <div className="pointer-events-none absolute left-6 top-6 z-10">
          <div className="border border-white/10 bg-[#0d0d0c]/90 px-3 py-2 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8ba870]" />

              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#8ba870]">
                {selectedLocation
                  ? "Location selected"
                  : "Live location"}
              </span>
            </div>

            <div className="mt-1 text-sm text-[#f2f1ed]">
              {activeLocation.city},{" "}
              {activeLocation.country}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GlobeVisualization;
