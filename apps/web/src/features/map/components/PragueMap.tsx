"use client";

import { useEffect, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import { Map } from "react-map-gl/maplibre";
import { PRAGUE_CENTER, PRAGUE_DEFAULT_ZOOM } from "@catch-it/core";

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;

type PragueMapProps = {
  onLoad?: () => void;
};

export function PragueMap({ onLoad }: PragueMapProps) {
  const [loaded, setLoaded] = useState(false);

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
        onLoad={() => {
          setLoaded(true);
          onLoad?.();
        }}
      />
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
