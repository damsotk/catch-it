"use client";

import { useEffect, type RefObject } from "react";
import type { MapRef } from "react-map-gl/maplibre";
import { getRouteBounds } from "@catch-it/core";
import type { RouteLeg } from "@/features/map/types";

const FIT_PADDING = { top: 64, right: 64, bottom: 64, left: 352 };

const FIT_DURATION_MS = 800;

export function useFitRouteBounds(
  mapRef: RefObject<MapRef | null>,
  legs: RouteLeg[] | null | undefined,
  ready: boolean,
) {
  useEffect(() => {
    if (!ready) return;

    const bounds = getRouteBounds(legs);
    if (!bounds) return;

    mapRef.current?.fitBounds(bounds, {
      padding: FIT_PADDING,
      duration: FIT_DURATION_MS,
    });
  }, [mapRef, legs, ready]);
}
