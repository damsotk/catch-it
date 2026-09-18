"use client";

import { useMemo } from "react";
import { Layer, Marker, Source } from "react-map-gl/maplibre";
import { useZoomAtLeast } from "@/features/map/hooks/useZoomAtLeast";
import { RouteLeg } from "@/features/map/types";
import { ENTRANCE_ZOOM } from "./StopsLayer";

const FALLBACK_ROUTE_COLOR = "#4b9fff";
const TRANSFER_COLOR = "#9aa0a6";
const FINISH_COLOR = "#ff453a";

type RouteLayerProps = {
  legs: RouteLeg[];
};

export function RouteLayer({ legs }: RouteLayerProps) {
  const showEntrances = useZoomAtLeast(ENTRANCE_ZOOM);

  const geojson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: legs
        .filter((leg) => leg.geometry.length >= 2)
        .map((leg) => ({
          type: "Feature" as const,
          geometry: {
            type: "LineString" as const,
            coordinates: leg.geometry,
          },
          properties: {
            transfer: leg.transfer,
            color: leg.routeColor ?? FALLBACK_ROUTE_COLOR,
          },
        })),
    }),
    [legs],
  );

  const finish = useMemo(() => {
    for (let i = legs.length - 1; i >= 0; i -= 1) {
      const { geometry } = legs[i];
      if (geometry.length > 0) return geometry[geometry.length - 1];
    }
    return null;
  }, [legs]);

  return (
    <>
      <Source id="route-lines" type="geojson" data={geojson}>
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

      {legs.map((leg, index) => {
        const board = leg.stops[0];
        if (leg.transfer || !board) return null;

        return (
          <Marker
            key={`${board.id}-${index}`}
            longitude={board.lon}
            latitude={board.lat}
          >
            <span
              className="rounded-full px-2 py-0.5 text-xs font-bold text-white shadow-md shadow-black/40"
              style={{
                backgroundColor: leg.routeColor ?? FALLBACK_ROUTE_COLOR,
              }}
            >
              {leg.routeName}
            </span>
          </Marker>
        );
      })}

      {showEntrances &&
        legs.flatMap((leg, index) => {
          if (!leg.transfer || leg.geometry.length === 0) return [];
          const entrances = [
            {
              code: leg.startEntrance,
              at: leg.geometry[0],
              color: legs[index - 1]?.routeColor,
            },
            {
              code: leg.endEntrance,
              at: leg.geometry[leg.geometry.length - 1],
              color: legs[index + 1]?.routeColor,
            },
          ];

          return entrances
            .filter((entrance) => entrance.code)
            .map(({ code, at, color }) => (
              <Marker
                key={`entrance-${index}-${code}`}
                longitude={at[0]}
                latitude={at[1]}
              >
                <span
                  className="flex items-center gap-1 rounded-full py-0.5 pl-1 pr-2 text-xs font-bold text-white shadow-md shadow-black/40 ring-2 ring-white"
                  style={{ backgroundColor: color ?? FALLBACK_ROUTE_COLOR }}
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/25 text-[10px]">
                    M
                  </span>
                  Metro entrance
                </span>
              </Marker>
            ));
        })}

      {finish && (
        <Marker longitude={finish[0]} latitude={finish[1]}>
          <span
            className="block h-3.5 w-3.5 rounded-full ring-2 ring-white"
            style={{ backgroundColor: FINISH_COLOR }}
          />
        </Marker>
      )}
    </>
  );
}
