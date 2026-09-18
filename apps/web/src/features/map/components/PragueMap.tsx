"use client";

import { useEffect, useState, type ReactNode } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import { Map } from "react-map-gl/maplibre";
import {
  INITIAL_VIEW,
  MAP_STYLE_URL,
  MAPTILER_KEY,
} from "../constants/mapConfig";
import { hideBaseMapIcons } from "../utils/hideBaseMapIcons";

type PragueMapProps = {
  onLoad?: () => void;
  children?: ReactNode;
};

export function PragueMap({ onLoad, children }: PragueMapProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!MAPTILER_KEY) onLoad?.();
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
        initialViewState={INITIAL_VIEW}
        mapStyle={MAP_STYLE_URL}
        onLoad={(event) => {
          hideBaseMapIcons(event.target);
          setLoaded(true);
          onLoad?.();
        }}
      >
        {children}
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
