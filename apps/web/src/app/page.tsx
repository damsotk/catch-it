"use client";

import { useMemo, useState } from "react";
import { PragueMap, RouteSearchPanel, useRouteSearch } from "@/features/map";

export default function Home() {
  const [mapLoaded, setMapLoaded] = useState(false);
  const { status, result, error, search } = useRouteSearch();

  const fastest = useMemo(() => {
    if (!result) return null;
    return (
      result.options.find((option) => option.isFastest) ??
      result.options[0] ??
      null
    );
  }, [result]);

  return (
    <main className="relative h-dvh w-dvw">
      <PragueMap
        onLoad={() => setMapLoaded(true)}
        legs={fastest?.legs ?? null}
      />
      <RouteSearchPanel
        ready={mapLoaded}
        status={status}
        error={error}
        option={fastest}
        onSearch={search}
      />
    </main>
  );
}
