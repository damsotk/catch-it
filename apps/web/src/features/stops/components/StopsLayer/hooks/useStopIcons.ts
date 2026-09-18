import { useEffect, useMemo, useState } from "react";
import { useMap } from "react-map-gl/maplibre";
import { registerStopIcons } from "@/features/stops/utils/stopIcons";
import type { StopMapItem } from "../utils/stopFeatures";

export function useStopIcons(items: StopMapItem[]) {
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
