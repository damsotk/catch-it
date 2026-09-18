import type { ExpressionSpecification } from "maplibre-gl";
import {
  CORE_RADIUS,
  GLOW_RADIUS,
  MAJOR_RANK,
  type ZoomStops,
} from "../constants/stopStyle";

export const isMajor: ExpressionSpecification = [
  ">=",
  ["get", "rank"],
  MAJOR_RANK,
];

export const scaled = (base: number): ExpressionSpecification => [
  "*",
  ["get", "scale"],
  base,
];

export const byZoom = (
  stops: ZoomStops,
  value: (base: number) => ExpressionSpecification,
): ExpressionSpecification => [
  "interpolate",
  ["linear"],
  ["zoom"],
  ...stops.flatMap(([zoom, base]) => [zoom, value(base)]),
];

export const coreRadius = byZoom(CORE_RADIUS, scaled);
export const glowRadius = byZoom(GLOW_RADIUS, scaled);

export const fadeIn = (from: number): ExpressionSpecification => [
  "interpolate",
  ["linear"],
  ["zoom"],
  from,
  0,
  from + 0.6,
  1,
];

function coreRadiusAt(zoom: number) {
  for (let i = 1; i < CORE_RADIUS.length; i += 1) {
    const [z0, r0] = CORE_RADIUS[i - 1];
    const [z1, r1] = CORE_RADIUS[i];
    if (zoom <= z1) return r0 + ((r1 - r0) * (zoom - z0)) / (z1 - z0);
  }
  return CORE_RADIUS[CORE_RADIUS.length - 1][1];
}

export const coreRadiusFrom = (min: number): ZoomStops => [
  [min, coreRadiusAt(min)],
  ...CORE_RADIUS.filter(([zoom]) => zoom > min),
];
