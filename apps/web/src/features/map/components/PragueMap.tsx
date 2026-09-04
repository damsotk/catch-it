"use client";

import { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import { Map, MapRef } from "react-map-gl/maplibre";
import { PRAGUE_CENTER, PRAGUE_DEFAULT_ZOOM } from "@catch-it/core";
import { RouteLeg } from "@/features/map/types";
import { RouteLayer } from "./RouteLayer";

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;

type PragueMapProps = {
  onLoad?: () => void;
  legs?: RouteLeg[] | null;
};

export function PragueMap({ onLoad, legs }: PragueMapProps) {
  const [loaded, setLoaded] = useState(false);
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    if (!MAPTILER_KEY) {
      onLoad?.();
    }
  }, [onLoad]);

  useEffect(() => {
    if (!legs?.length) return;

    const points = legs?.flatMap((leg) => leg.geometry);

    let minLon = Infinity,
      minLat = Infinity;
    let maxLon = -Infinity,
      maxLat = -Infinity;

    for (const [lon, lat] of points) {
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }

    mapRef.current?.fitBounds(
      [
        [minLon, minLat],
        [maxLon, maxLat],
      ],
      { padding: 80, duration: 800 },
    );
  }, [legs]);

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
        onLoad={() => {
          setLoaded(true);
          onLoad?.();
        }}
        ref={mapRef}
      >
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
