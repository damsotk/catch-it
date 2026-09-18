"use client";

import { useEffect, useMemo, useState } from "react";
import { Layer, Marker, Source, useMap } from "react-map-gl/maplibre";
import type { ExpressionSpecification } from "maplibre-gl";
import type { StopsResult, TransitMode, TransitStopLine } from "@catch-it/core";
import {
  MODE_COLORS,
  MODE_RANK,
  MODE_SCALE,
} from "@/features/map/transitModes";
import {
  ARROW_BASE,
  arrowImageId,
  glyphImageId,
  registerStopIcons,
} from "@/features/map/stopIcons";

const ENTRANCE_ZOOM = 16;
const ENTRANCE_SCALE = 1.3;
const SOURCE_ID = "stops";

const GROUPS = {
  stops: { filter: ["==", ["get", "kind"], "stop"] },
  stations: {
    filter: ["==", ["get", "kind"], "station"],
    maxzoom: ENTRANCE_ZOOM,
  },
  entrances: {
    filter: ["==", ["get", "kind"], "entrance"],
    minzoom: ENTRANCE_ZOOM,
  },
} satisfies Record<string, DotGroup>;

export const STOPS_INTERACTIVE_LAYER_IDS = Object.keys(GROUPS).map(
  (group) => `${group}-core`,
);

const MAJOR_RANK = MODE_RANK.train;
const MAX_POPUP_LINES = 14;
const LABEL_FONT = ["Roboto Medium", "Noto Sans Medium"];

type ZoomStops = [zoom: number, value: number][];

const CORE_RADIUS: ZoomStops = [
  [10, 1.3],
  [13, 3.2],
  [15, 5.5],
  [17, 10],
];
const GLOW_RADIUS: ZoomStops = [
  [10, 3],
  [13, 8],
  [16, 15],
  [17, 18],
];

const GLYPH_MIN_ZOOM = 15;
const ARROW_MIN_ZOOM = 14;
const GLYPH_FILL = 1.45;
const GLYPH_SIZE = 24;
const ARROW_GAP = 2.5;

const byZoom = (
  stops: ZoomStops,
  value: (base: number) => ExpressionSpecification,
): ExpressionSpecification => [
  "interpolate",
  ["linear"],
  ["zoom"],
  ...stops.flatMap(([zoom, base]) => [zoom, value(base)]),
];

const scaled = (base: number): ExpressionSpecification => [
  "*",
  ["get", "scale"],
  base,
];

const radiusAt = (zoom: number) => {
  for (let i = 1; i < CORE_RADIUS.length; i += 1) {
    const [z0, r0] = CORE_RADIUS[i - 1];
    const [z1, r1] = CORE_RADIUS[i];
    if (zoom <= z1) return r0 + ((r1 - r0) * (zoom - z0)) / (z1 - z0);
  }
  return CORE_RADIUS[CORE_RADIUS.length - 1][1];
};

const fromZoom = (min: number): ZoomStops => [
  [min, radiusAt(min)],
  ...CORE_RADIUS.filter(([zoom]) => zoom > min),
];

const radius = (stops: ZoomStops) => byZoom(stops, scaled);

const fadeIn = (from: number): ExpressionSpecification => [
  "interpolate",
  ["linear"],
  ["zoom"],
  from,
  0,
  from + 0.6,
  1,
];

type MapItem = {
  kind: "stop" | "station" | "entrance";
  name: string;
  lat: number;
  lon: number;
  mode: TransitMode;
  color: string;
  bearing: number | null;
  lines: TransitStopLine[];
  code?: string;
  accessible?: boolean;
};

function toMapItems(data: StopsResult | null): MapItem[] {
  if (!data) return [];

  const stops = data.stops.map(
    (stop): MapItem => ({
      kind: stop.stationId ? "station" : "stop",
      name: stop.name,
      lat: stop.lat,
      lon: stop.lon,
      mode: stop.mode,
      color: stop.color ?? MODE_COLORS[stop.mode],
      bearing: stop.bearing,
      lines: stop.lines,
    }),
  );

  const entrances = data.entrances.map(
    (entrance): MapItem => ({
      kind: "entrance",
      name: entrance.name,
      lat: entrance.lat,
      lon: entrance.lon,
      mode: "metro",
      color: entrance.color ?? MODE_COLORS.metro,
      bearing: null,
      lines: entrance.lines,
      code: entrance.code,
      accessible: entrance.accessible,
    }),
  );

  return [...stops, ...entrances];
}

type StopsLayerProps = {
  data: StopsResult | null;
  hoveredIndex: number | null;
  dimmed: boolean;
};

export function StopsLayer({ data, hoveredIndex, dimmed }: StopsLayerProps) {
  const items = useMemo(() => toMapItems(data), [data]);
  const iconsReady = useStopIcons(items);

  const geojson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: items.map((item, index) => {
        const rank = MODE_RANK[item.mode];
        return {
          type: "Feature" as const,
          id: index,
          geometry: {
            type: "Point" as const,
            coordinates: [item.lon, item.lat],
          },
          properties: {
            kind: item.kind,
            name: item.name,
            code: item.code ?? "",
            color: item.color,
            ring: rank >= MAJOR_RANK ? "#ffffff" : "#0b0d12",
            rank,
            scale:
              item.kind === "entrance" ? ENTRANCE_SCALE : MODE_SCALE[item.mode],
            glyph: glyphImageId(item.mode, item.color),
            ...(item.bearing !== null && {
              bearing: item.bearing,
              arrow: arrowImageId(item.color),
            }),
          },
        };
      }),
    }),
    [items],
  );

  const hovered = hoveredIndex !== null ? (items[hoveredIndex] ?? null) : null;

  return (
    <>
      <Source id={SOURCE_ID} type="geojson" data={geojson}>
        {Object.entries(GROUPS).map(([id, group]) => (
          <DotLayers
            key={id}
            id={id}
            group={group}
            dimmed={dimmed}
            iconsReady={iconsReady}
          />
        ))}
        <Layer
          id="stops-labels-major"
          type="symbol"
          minzoom={13}
          filter={[
            "all",
            [">=", ["get", "rank"], MAJOR_RANK],
            ["!=", ["get", "kind"], "entrance"],
          ]}
          layout={{
            "text-field": ["get", "name"],
            "text-font": LABEL_FONT,
            "text-size": 12,
            "text-anchor": "top",
            "text-offset": [
              "interpolate",
              ["linear"],
              ["zoom"],
              13,
              ["literal", [0, 0.9]],
              17,
              ["literal", [0, 2]],
            ],
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
            "text-offset": [
              "interpolate",
              ["linear"],
              ["zoom"],
              15.5,
              ["literal", [0, 0.8]],
              17,
              ["literal", [0, 1.4]],
            ],
            "symbol-sort-key": ["-", ["get", "rank"]],
          }}
          paint={{
            "text-color": ["get", "color"],
            "text-halo-color": "#0b0d12",
            "text-halo-width": 1.5,
            "text-opacity": dimmed ? 0.4 : 1,
          }}
        />
        <Layer
          id="stops-labels-entrance"
          type="symbol"
          minzoom={ENTRANCE_ZOOM + 0.5}
          filter={GROUPS.entrances.filter}
          layout={{
            "text-field": ["get", "code"],
            "text-font": LABEL_FONT,
            "text-size": 11,
            "text-anchor": "left",
            "text-offset": [1.3, 0],
          }}
          paint={{
            "text-color": "#f2f2f7",
            "text-halo-color": "#0b0d12",
            "text-halo-width": 1.5,
            "text-opacity": dimmed ? 0.4 : 1,
          }}
        />
      </Source>

      {hovered && <StopPopup item={hovered} />}
    </>
  );
}

type DotGroup = {
  filter: ExpressionSpecification;
  minzoom?: number;
  maxzoom?: number;
};

function DotLayers({
  id,
  group,
  dimmed,
  iconsReady,
}: {
  id: string;
  group: DotGroup;
  dimmed: boolean;
  iconsReady: boolean;
}) {
  const { filter, minzoom = 0, maxzoom = 24 } = group;
  const arrowZoom = Math.max(minzoom, ARROW_MIN_ZOOM);
  const glyphZoom = Math.max(minzoom, GLYPH_MIN_ZOOM);

  return (
    <>
      <Layer
        id={`${id}-glow`}
        source={SOURCE_ID}
        type="circle"
        minzoom={minzoom}
        maxzoom={maxzoom}
        filter={filter}
        layout={{ "circle-sort-key": ["get", "rank"] }}
        paint={{
          "circle-color": ["get", "color"],
          "circle-radius": radius(GLOW_RADIUS),
          "circle-blur": 1,
          "circle-opacity": dimmed
            ? 0
            : ["case", [">=", ["get", "rank"], MAJOR_RANK], 0.55, 0.3],
        }}
      />
      {iconsReady && arrowZoom < maxzoom && (
        <Layer
          id={`${id}-direction`}
          source={SOURCE_ID}
          type="symbol"
          minzoom={arrowZoom}
          maxzoom={maxzoom}
          filter={["all", filter, ["has", "bearing"]]}
          layout={{
            "icon-image": ["get", "arrow"],
            "icon-size": byZoom(fromZoom(arrowZoom), (base) => [
              "/",
              ["+", scaled(base), ARROW_GAP],
              ARROW_BASE,
            ]),
            "icon-rotate": ["get", "bearing"],
            "icon-rotation-alignment": "map",
            "icon-pitch-alignment": "map",
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
            "symbol-sort-key": ["get", "rank"],
          }}
          paint={{
            "icon-opacity": dimmed ? 0.35 : fadeIn(arrowZoom),
          }}
        />
      )}
      <Layer
        id={`${id}-core`}
        source={SOURCE_ID}
        type="circle"
        minzoom={minzoom}
        maxzoom={maxzoom}
        filter={filter}
        layout={{ "circle-sort-key": ["get", "rank"] }}
        paint={{
          "circle-color": ["get", "color"],
          "circle-radius": radius(CORE_RADIUS),
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
      {iconsReady && glyphZoom < maxzoom && (
        <Layer
          id={`${id}-glyphs`}
          source={SOURCE_ID}
          type="symbol"
          minzoom={glyphZoom}
          maxzoom={maxzoom}
          filter={filter}
          layout={{
            "icon-image": ["get", "glyph"],
            "icon-size": byZoom(fromZoom(glyphZoom), (base) =>
              scaled((base * GLYPH_FILL) / GLYPH_SIZE),
            ),
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
            "symbol-sort-key": ["get", "rank"],
          }}
          paint={{
            "icon-opacity": dimmed ? 0.35 : fadeIn(glyphZoom),
          }}
        />
      )}
    </>
  );
}

function useStopIcons(items: MapItem[]) {
  const { current: mapRef } = useMap();
  const [readyKey, setReadyKey] = useState<string | null>(null);

  const colors = useMemo(
    () => [...new Set(items.map((item) => item.color))].sort(),
    [items],
  );
  const key = colors.join(",");

  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map) return;

    let cancelled = false;
    registerStopIcons(map, colors)
      .then(() => {
        if (!cancelled) setReadyKey(key);
      })
      .catch((cause) => console.error(cause));

    return () => {
      cancelled = true;
    };
  }, [mapRef, colors, key]);

  return readyKey === key;
}

function StopPopup({ item }: { item: MapItem }) {
  const visible = item.lines.slice(0, MAX_POPUP_LINES);
  const hidden = item.lines.length - visible.length;

  return (
    <Marker
      longitude={item.lon}
      latitude={item.lat}
      anchor="bottom"
      offset={[0, -14]}
      style={{ pointerEvents: "none", zIndex: 20 }}
    >
      <div className="max-w-64 rounded-2xl border border-white/10 bg-[#23262e]/90 px-3 py-2 shadow-xl shadow-black/50 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="truncate">{item.name}</span>
        </div>
        {item.kind === "entrance" && (
          <div className="mt-0.5 text-xs text-white/60">
            Entrance {item.code}
            {item.accessible && " · step-free"}
          </div>
        )}
        <div className="mt-1.5 flex flex-wrap gap-1">
          {visible.map((line) => {
            const color = line.color ?? MODE_COLORS[line.mode];
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
