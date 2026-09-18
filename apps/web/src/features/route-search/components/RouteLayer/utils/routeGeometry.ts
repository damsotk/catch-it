import type { RouteLeg, RouteLegStop } from "@catch-it/core";
import { routeColor } from "@/features/route-search/utils/routeColor";

export type Position = [number, number];

export type Boarding = {
  key: string;
  stop: RouteLegStop;
  routeName: string | null;
  color: string;
};

export type EntrancePoint = {
  key: string;
  position: Position;
  color: string;
};

export function toRouteLineCollection(legs: RouteLeg[]) {
  return {
    type: "FeatureCollection" as const,
    features: legs
      .filter((leg) => leg.geometry.length >= 2)
      .map((leg) => ({
        type: "Feature" as const,
        geometry: { type: "LineString" as const, coordinates: leg.geometry },
        properties: { transfer: leg.transfer, color: routeColor(leg) },
      })),
  };
}

export function findBoardings(legs: RouteLeg[]): Boarding[] {
  return legs.flatMap((leg, index) => {
    const stop = leg.stops[0];
    if (leg.transfer || !stop) return [];

    return {
      key: `${stop.id}-${index}`,
      stop,
      routeName: leg.routeName,
      color: routeColor(leg),
    };
  });
}

export function findMetroEntrances(legs: RouteLeg[]): EntrancePoint[] {
  return legs.flatMap((leg, index) => {
    if (!leg.transfer || leg.geometry.length === 0) return [];

    const ends = [
      {
        code: leg.startEntrance,
        position: leg.geometry[0],
        ride: legs[index - 1],
      },
      {
        code: leg.endEntrance,
        position: leg.geometry[leg.geometry.length - 1],
        ride: legs[index + 1],
      },
    ];

    return ends
      .filter((end) => end.code)
      .map((end) => ({
        key: `entrance-${index}-${end.code}`,
        position: end.position,
        color: routeColor(end.ride),
      }));
  });
}

export function findFinish(legs: RouteLeg[]): Position | null {
  for (let i = legs.length - 1; i >= 0; i -= 1) {
    const { geometry } = legs[i];
    if (geometry.length > 0) return geometry[geometry.length - 1];
  }
  return null;
}
