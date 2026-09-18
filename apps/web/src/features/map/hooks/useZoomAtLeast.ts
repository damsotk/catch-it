"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useMap } from "react-map-gl/maplibre";

export function useZoomAtLeast(min: number) {
  const { current: map } = useMap();

  const subscribe = useCallback(
    (onChange: () => void) => {
      map?.on("zoom", onChange);
      return () => {
        map?.off("zoom", onChange);
      };
    },
    [map],
  );

  return useSyncExternalStore(
    subscribe,
    () => (map ? map.getZoom() >= min : false),
    () => false,
  );
}
