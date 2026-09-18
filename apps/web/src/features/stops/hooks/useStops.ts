import { useEffect, useState } from "react";
import { fetchStops } from "@catch-it/api-client";
import type { StopsResult } from "@catch-it/core";

export function useStops() {
  const [data, setData] = useState<StopsResult | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetchStops({ signal: controller.signal })
      .then(setData)
      .catch((cause) => {
        if (!controller.signal.aborted) console.error(cause);
      });

    return () => controller.abort();
  }, []);

  return data;
}
