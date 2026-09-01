"use client";
import "maplibre-gl/dist/maplibre-gl.css";
import { Map } from "react-map-gl/maplibre";
import { PRAGUE_CENTER, PRAGUE_DEFAULT_ZOOM } from "@catch-it/core";

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;

export function PragueMap() {
  if (!MAPTILER_KEY) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-neutral-950 p-6 text-center text-sm text-neutral-400">
        No API key
      </div>
    );
  }
  return (
    <Map
      initialViewState={{
        longitude: PRAGUE_CENTER.longitude,
        latitude: PRAGUE_CENTER.latitude,
        zoom: PRAGUE_DEFAULT_ZOOM,
      }}
      mapStyle={`https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${MAPTILER_KEY}`}
    />
  );
}
