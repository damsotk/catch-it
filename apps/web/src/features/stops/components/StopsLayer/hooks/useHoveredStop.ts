import { useEffect, useState } from "react";
import type { MapMouseEvent } from "maplibre-gl";
import { useMap } from "react-map-gl/maplibre";

export function useHoveredStop(layerIds: string[]) {
  const { current: mapRef } = useMap();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map) return;

    const canvas = map.getCanvas();

    const hover = (index: number | null) => {
      canvas.style.cursor = index === null ? "" : "pointer";
      setHoveredIndex(index);
    };

    const pickStop = (event: MapMouseEvent) => {
      const layers = layerIds.filter((id) => map.getLayer(id));
      const [feature] = layers.length
        ? map.queryRenderedFeatures(event.point, { layers })
        : [];
      hover(typeof feature?.id === "number" ? feature.id : null);
    };

    const clearHover = () => hover(null);

    map.on("mousemove", pickStop);
    map.on("click", pickStop);
    map.on("mouseout", clearHover);

    return () => {
      map.off("mousemove", pickStop);
      map.off("click", pickStop);
      map.off("mouseout", clearHover);
    };
  }, [mapRef, layerIds]);

  return hoveredIndex;
}
