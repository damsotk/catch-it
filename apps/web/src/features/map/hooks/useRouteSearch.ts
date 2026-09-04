"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { searchRoutes } from "@catch-it/api-client";
import type { RouteSearchRequest, RouteSearchResult } from "@catch-it/core";

export type RouteSearchStatus = "idle" | "loading" | "success" | "error";

export function useRouteSearch() {
  const [status, setStatus] = useState<RouteSearchStatus>("idle");
  const [result, setResult] = useState<RouteSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inFlight = useRef<AbortController | null>(null);

  useEffect(() => () => inFlight.current?.abort(), []);

  const search = useCallback(async (request: RouteSearchRequest) => {
    inFlight.current?.abort();

    const controller = new AbortController();
    inFlight.current = controller;

    setStatus("loading");
    setError(null);

    try {
      const next = await searchRoutes(request, { signal: controller.signal });
      if (controller.signal.aborted) return;

      setResult(next);
      setStatus("success");
    } catch (cause) {
      if (controller.signal.aborted) return;

      setResult(null);
      setError(cause instanceof Error ? cause.message : "Route search failed.");
      setStatus("error");
    }
  }, []);

  return { status, result, error, search };
}
