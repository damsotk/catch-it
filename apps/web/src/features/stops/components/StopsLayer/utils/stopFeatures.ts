import type { StopsResult, TransitMode, TransitStopLine } from "@catch-it/core";
import { arrowImageId, glyphImageId } from "@/features/stops/utils/stopIcons";
import {
  MODE_COLORS,
  MODE_RANK,
  MODE_SCALE,
} from "@/features/stops/constants/transitModes";
import { ENTRANCE_SCALE, MAJOR_RANK } from "../constants/stopStyle";

export type StopMapItem = {
  kind: "stop" | "station" | "entrance";
  name: string;
  lat: number;
  lon: number;
  mode: TransitMode;
  color: string;
  bearing: number | null;
  lines: TransitStopLine[];
  accessible?: boolean;
};

export function toStopMapItems(data: StopsResult | null): StopMapItem[] {
  if (!data) return [];

  const stops = data.stops.map((stop): StopMapItem => ({
    kind: stop.stationId ? "station" : "stop",
    name: stop.name,
    lat: stop.lat,
    lon: stop.lon,
    mode: stop.mode,
    color: stop.color ?? MODE_COLORS[stop.mode],
    bearing: stop.bearing,
    lines: stop.lines,
  }));

  const entrances = data.entrances.map((entrance): StopMapItem => ({
    kind: "entrance",
    name: entrance.name,
    lat: entrance.lat,
    lon: entrance.lon,
    mode: "metro",
    color: entrance.color ?? MODE_COLORS.metro,
    bearing: null,
    lines: entrance.lines,
    accessible: entrance.accessible,
  }));

  return [...stops, ...entrances];
}

function toStopFeature(item: StopMapItem, index: number) {
  const rank = MODE_RANK[item.mode];

  return {
    type: "Feature" as const,
    id: index,
    geometry: { type: "Point" as const, coordinates: [item.lon, item.lat] },
    properties: {
      kind: item.kind,
      name: item.name,
      color: item.color,
      ring: rank >= MAJOR_RANK ? "#ffffff" : "#0b0d12",
      rank,
      scale: item.kind === "entrance" ? ENTRANCE_SCALE : MODE_SCALE[item.mode],
      glyph: glyphImageId(item.mode, item.color),
      ...(item.bearing !== null && {
        bearing: item.bearing,
        arrow: arrowImageId(item.color),
      }),
    },
  };
}

export function toStopFeatureCollection(items: StopMapItem[]) {
  return {
    type: "FeatureCollection" as const,
    features: items.map(toStopFeature),
  };
}
