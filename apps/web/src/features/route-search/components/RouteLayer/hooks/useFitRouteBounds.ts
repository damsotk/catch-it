import { useEffect } from "react";
import { useMap } from "react-map-gl/maplibre";
import { getRouteBounds, type RouteLeg } from "@catch-it/core";

const FIT_PADDING = { top: 64, right: 64, bottom: 64, left: 352 };
const FIT_DURATION_MS = 800;

export function useFitRouteBounds(legs: RouteLeg[]) {
  const { current: map } = useMap();

  useEffect(() => {
    const bounds = getRouteBounds(legs);
    if (!map || !bounds) return;

    map.fitBounds(bounds, { padding: FIT_PADDING, duration: FIT_DURATION_MS });
  }, [map, legs]);
}
