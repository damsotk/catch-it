"use client";

import { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import { Map, MapLayerMouseEvent, MapRef } from "react-map-gl/maplibre";
import { PRAGUE_CENTER, PRAGUE_DEFAULT_ZOOM } from "@catch-it/core";
import { hideBaseMapIcons } from "@/features/map/hideBaseMapIcons";
import { useFitRouteBounds } from "@/features/map/hooks/useFitRouteBounds";
import { useStops } from "@/features/map/hooks/useStops";
import { RouteLeg } from "@/features/map/types";
import { RouteLayer } from "./RouteLayer";
import { STOPS_LAYER_ID, StopsLayer } from "./StopsLayer";

const INTERACTIVE_LAYER_IDS = [STOPS_LAYER_ID];

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;

type PragueMapProps = {
  onLoad?: () => void;
  legs?: RouteLeg[] | null;
};

export function PragueMap({ onLoad, legs }: PragueMapProps) {
  const [loaded, setLoaded] = useState(false);
  const mapRef = useRef<MapRef>(null);
  const stops = useStops();
  const [hoveredStop, setHoveredStop] = useState<number | null>(null);

  useFitRouteBounds(mapRef, legs, loaded);

  const pickStop = (event: MapLayerMouseEvent) => {
    const id = event.features?.[0]?.id;
    setHoveredStop(typeof id === "number" ? id : null);
  };

  useEffect(() => {
    if (!MAPTILER_KEY) {
      onLoad?.();
    }
  }, [onLoad]);

  if (!MAPTILER_KEY) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-neutral-950 p-6 text-center text-sm text-neutral-400">
        No API key
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <Map
        initialViewState={{
          longitude: PRAGUE_CENTER.longitude,
          latitude: PRAGUE_CENTER.latitude,
          zoom: PRAGUE_DEFAULT_ZOOM,
        }}
        mapStyle={`https://api.maptiler.com/maps/streets-v4-dark/style.json?key=${MAPTILER_KEY}`}
        onLoad={(event) => {
          hideBaseMapIcons(event.target);
          setLoaded(true);
          onLoad?.();
        }}
        ref={mapRef}
        interactiveLayerIds={INTERACTIVE_LAYER_IDS}
        cursor={hoveredStop !== null ? "pointer" : undefined}
        onMouseMove={pickStop}
        onClick={pickStop}
        onMouseOut={() => setHoveredStop(null)}
      >
        <StopsLayer
          stops={stops}
          hoveredIndex={hoveredStop}
          dimmed={Boolean(legs)}
        />
        {legs && <RouteLayer legs={legs} />}
      </Map>

      <div
        className={`pointer-events-none absolute inset-0 flex items-center justify-center bg-neutral-950 transition-opacity duration-500 ${
          loaded ? "opacity-0" : "opacity-100"
        }`}
      >
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-white/70" />
      </div>
    </div>
  );
}
