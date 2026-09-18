"use client";

import { useMemo } from "react";
import { Layer, Source } from "react-map-gl/maplibre";
import type { RouteLeg } from "@catch-it/core";
import { useZoomAtLeast } from "@/features/map";
import { ENTRANCE_ZOOM } from "@/features/stops";
import {
  findBoardings,
  findFinish,
  findMetroEntrances,
  toRouteLineCollection,
} from "./utils/routeGeometry";
import {
  BoardingMarker,
  EntranceMarker,
  FinishMarker,
} from "./subcomponents/RouteMarkers";
import { TRANSFER_COLOR } from "./constants/routeStyle";
import { useFitRouteBounds } from "./hooks/useFitRouteBounds";

export function RouteLayer({ legs }: { legs: RouteLeg[] }) {
  useFitRouteBounds(legs);
  const showEntrances = useZoomAtLeast(ENTRANCE_ZOOM);

  const lines = useMemo(() => toRouteLineCollection(legs), [legs]);
  const boardings = findBoardings(legs);
  const entrances = findMetroEntrances(legs);
  const finish = findFinish(legs);

  return (
    <>
      <Source id="route-lines" type="geojson" data={lines}>
        <Layer
          id="route-lines-ride"
          type="line"
          filter={["==", ["get", "transfer"], false]}
          layout={{ "line-join": "round", "line-cap": "round" }}
          paint={{
            "line-color": ["get", "color"],
            "line-width": 5,
            "line-opacity": 0.9,
          }}
        />
        <Layer
          id="route-lines-transfer"
          type="line"
          filter={["==", ["get", "transfer"], true]}
          layout={{ "line-join": "round", "line-cap": "round" }}
          paint={{
            "line-color": TRANSFER_COLOR,
            "line-width": 3,
            "line-dasharray": [1, 1.5],
          }}
        />
      </Source>

      {boardings.map((boarding) => (
        <BoardingMarker key={boarding.key} boarding={boarding} />
      ))}

      {showEntrances &&
        entrances.map((entrance) => (
          <EntranceMarker
            key={entrance.key}
            position={entrance.position}
            color={entrance.color}
          />
        ))}

      {finish && <FinishMarker position={finish} />}
    </>
  );
}
