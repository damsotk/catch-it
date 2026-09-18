"use client";

import { useEffect, useState } from "react";
import { fetchStops } from "@catch-it/api-client";
import type { TransitStop } from "@catch-it/core";

export function useStops() {
  const [stops, setStops] = useState<TransitStop[] | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetchStops({ signal: controller.signal })
      .then((result) => setStops(result.stops))
      .catch((cause) => {
        if (!controller.signal.aborted) console.error(cause);
      });

    return () => controller.abort();
  }, []);

  return stops;
}
