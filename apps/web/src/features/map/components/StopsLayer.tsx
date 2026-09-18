"use client";

import { useMemo } from "react";
import { Layer, Marker, Source } from "react-map-gl/maplibre";
import type { ExpressionSpecification } from "maplibre-gl";
import type { TransitStop } from "@catch-it/core";
import {
  MODE_COLORS,
  MODE_RANK,
  MODE_SCALE,
} from "@/features/map/transitModes";

export const STOPS_LAYER_ID = "stops-core";

const MAJOR_RANK = MODE_RANK.train;
const MAX_POPUP_LINES = 14;
const LABEL_FONT = ["Roboto Medium", "Noto Sans Medium"];

const radius = (base: [number, number, number]): ExpressionSpecification => [
  "interpolate",
  ["linear"],
  ["zoom"],
  10,
  ["*", ["get", "scale"], base[0]],
  13,
  ["*", ["get", "scale"], base[1]],
  16,
  ["*", ["get", "scale"], base[2]],
];

const stopColor = (stop: TransitStop) => stop.color ?? MODE_COLORS[stop.mode];

type StopsLayerProps = {
  stops: TransitStop[] | null;
  hoveredIndex: number | null;
  dimmed: boolean;
};

export function StopsLayer({ stops, hoveredIndex, dimmed }: StopsLayerProps) {
  const geojson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: (stops ?? []).map((stop, index) => {
        const rank = MODE_RANK[stop.mode];
        return {
          type: "Feature" as const,
          id: index,
          geometry: {
            type: "Point" as const,
            coordinates: [stop.lon, stop.lat],
          },
          properties: {
            name: stop.name,
            color: stopColor(stop),
            ring: rank >= MAJOR_RANK ? "#ffffff" : "#0b0d12",
            rank,
            scale: MODE_SCALE[stop.mode],
          },
        };
      }),
    }),
    [stops],
  );

  const hovered =
    hoveredIndex !== null ? (stops?.[hoveredIndex] ?? null) : null;

  return (
    <>
      <Source id="stops" type="geojson" data={geojson}>
        <Layer
          id="stops-glow"
          type="circle"
          layout={{ "circle-sort-key": ["get", "rank"] }}
          paint={{
            "circle-color": ["get", "color"],
            "circle-radius": radius([3, 8, 15]),
            "circle-blur": 1,
            "circle-opacity": dimmed
              ? 0
              : ["case", [">=", ["get", "rank"], MAJOR_RANK], 0.55, 0.3],
          }}
        />
        <Layer
          id={STOPS_LAYER_ID}
          type="circle"
          layout={{ "circle-sort-key": ["get", "rank"] }}
          paint={{
            "circle-color": ["get", "color"],
            "circle-radius": radius([1.3, 3.2, 6]),
            "circle-stroke-color": ["get", "ring"],
            "circle-stroke-width": [
              "interpolate",
              ["linear"],
              ["zoom"],
              10,
              ["case", [">=", ["get", "rank"], MAJOR_RANK], 1, 0.3],
              15,
              ["case", [">=", ["get", "rank"], MAJOR_RANK], 2.5, 1.2],
            ],
            "circle-opacity": dimmed ? 0.35 : 1,
            "circle-stroke-opacity": dimmed ? 0.35 : 1,
          }}
        />
        <Layer
          id="stops-labels-major"
          type="symbol"
          minzoom={13}
          filter={[">=", ["get", "rank"], MAJOR_RANK]}
          layout={{
            "text-field": ["get", "name"],
            "text-font": LABEL_FONT,
            "text-size": 12,
            "text-anchor": "top",
            "text-offset": [0, 0.9],
            "symbol-sort-key": ["-", ["get", "rank"]],
          }}
          paint={{
            "text-color": "#f2f2f7",
            "text-halo-color": "#0b0d12",
            "text-halo-width": 1.5,
            "text-opacity": dimmed ? 0.4 : 1,
          }}
        />
        <Layer
          id="stops-labels-minor"
          type="symbol"
          minzoom={15.5}
          filter={["<", ["get", "rank"], MAJOR_RANK]}
          layout={{
            "text-field": ["get", "name"],
            "text-font": LABEL_FONT,
            "text-size": 11,
            "text-anchor": "top",
            "text-offset": [0, 0.8],
            "symbol-sort-key": ["-", ["get", "rank"]],
          }}
          paint={{
            "text-color": ["get", "color"],
            "text-halo-color": "#0b0d12",
            "text-halo-width": 1.5,
            "text-opacity": dimmed ? 0.4 : 1,
          }}
        />
      </Source>

      {hovered && <StopPopup stop={hovered} />}
    </>
  );
}

function StopPopup({ stop }: { stop: TransitStop }) {
  const visible = stop.lines.slice(0, MAX_POPUP_LINES);
  const hidden = stop.lines.length - visible.length;

  return (
    <Marker
      longitude={stop.lon}
      latitude={stop.lat}
      anchor="bottom"
      offset={[0, -14]}
      style={{ pointerEvents: "none", zIndex: 20 }}
    >
      <div className="max-w-64 rounded-2xl border border-white/10 bg-[#23262e]/90 px-3 py-2 shadow-xl shadow-black/50 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: stopColor(stop) }}
          />
          <span className="truncate">{stop.name}</span>
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {visible.map((line) => {
            const color =
              line.mode === "metro" && stop.color
                ? stop.color
                : MODE_COLORS[line.mode];
            return (
              <span
                key={`${line.mode}-${line.name}`}
                className="rounded-md border px-1.5 py-px text-[11px] font-bold leading-4"
                style={{
                  color,
                  borderColor: `${color}66`,
                  backgroundColor: `${color}1f`,
                }}
              >
                {line.name}
              </span>
            );
          })}
          {hidden > 0 && (
            <span className="px-1 text-[11px] leading-5 text-white/50">
              +{hidden}
            </span>
          )}
        </div>
      </div>
    </Marker>
  );
}
