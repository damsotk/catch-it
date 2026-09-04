"use client";

import { useState } from "react";
import { PragueMap, RouteSearchPanel, useRouteSearch } from "@/features/map";

const NO_OPTIONS: never[] = [];

export default function Home() {
  const [mapLoaded, setMapLoaded] = useState(false);
  const { status, result, error, search } = useRouteSearch();

  const options = result?.options ?? NO_OPTIONS;

  const [selectedDeparture, setSelectedDeparture] = useState<number | null>(
    null,
  );
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.departTimeSec === selectedDeparture),
  );
  const selected = options[selectedIndex] ?? null;

  return (
    <main className="relative h-dvh w-dvw">
      <PragueMap
        onLoad={() => setMapLoaded(true)}
        legs={selected?.legs ?? null}
      />
      <RouteSearchPanel
        ready={mapLoaded}
        status={status}
        error={error}
        options={options}
        selectedIndex={selectedIndex}
        onSelectOption={(index) =>
          setSelectedDeparture(options[index]?.departTimeSec ?? null)
        }
        onSearch={search}
      />
    </main>
  );
}
