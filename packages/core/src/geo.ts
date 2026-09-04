import type { RouteLeg } from "./routing";

export const PRAGUE_CENTER = {
  latitude: 50.0755,
  longitude: 14.4378,
};

export const PRAGUE_DEFAULT_ZOOM = 12;
export type LngLatBounds = [[number, number], [number, number]];

export function getRouteBounds(
  legs: RouteLeg[] | null | undefined,
): LngLatBounds | null {
  if (!legs || legs.length === 0) return null;

  let minLon = Infinity;
  let minLat = Infinity;
  let maxLon = -Infinity;
  let maxLat = -Infinity;
  let seen = false;

  for (const leg of legs) {
    for (const [lon, lat] of leg.geometry) {
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      seen = true;
    }
  }

  if (!seen) return null;

  return [
    [minLon, minLat],
    [maxLon, maxLat],
  ];
}
