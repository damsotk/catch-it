"use client";

import { useMemo } from "react";
import { Source } from "react-map-gl/maplibre";
import { useStops } from "@/features/stops/hooks/useStops";
import { StopDotLayers } from "./subcomponents/StopDotLayers";
import { toStopFeatureCollection, toStopMapItems } from "./utils/stopFeatures";
import { StopLabelLayers } from "./subcomponents/StopLabelLayers";
import { StopPopup } from "./subcomponents/StopPopup";
import {
  SOURCE_ID,
  STOP_DOT_LAYER_IDS,
  STOP_GROUPS,
} from "./constants/stopStyle";
import { useHoveredStop } from "./hooks/useHoveredStop";
import { useStopIcons } from "./hooks/useStopIcons";

export function StopsLayer({ hidden }: { hidden: boolean }) {
  const stopsData = useStops();
  const stops = useMemo(() => toStopMapItems(stopsData), [stopsData]);
  const geojson = useMemo(() => toStopFeatureCollection(stops), [stops]);

  const iconsReady = useStopIcons(stops);
  const hoveredIndex = useHoveredStop(STOP_DOT_LAYER_IDS);

  const visibility = hidden ? "none" : "visible";
  const hoveredStop =
    hidden || hoveredIndex === null ? null : (stops[hoveredIndex] ?? null);

  return (
    <>
      <Source id={SOURCE_ID} type="geojson" data={geojson}>
        {STOP_GROUPS.map((group) => (
          <StopDotLayers
            key={group.id}
            group={group}
            visibility={visibility}
            iconsReady={iconsReady}
          />
        ))}
        <StopLabelLayers visibility={visibility} />
      </Source>

      {hoveredStop && <StopPopup stop={hoveredStop} />}
    </>
  );
}
