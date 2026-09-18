"use client";

import { useState } from "react";
import { PragueMap } from "@/features/map";
import {
  RouteLayer,
  RouteSearchPanel,
  useRouteSearch,
  useSelectedRouteOption,
} from "@/features/route-search";
import { StopsLayer } from "@/features/stops";

const NO_OPTIONS: never[] = [];

export default function Home() {
  const [mapLoaded, setMapLoaded] = useState(false);
  const { status, result, error, search } = useRouteSearch();
  const options = result?.options ?? NO_OPTIONS;
  const { selectedOption, selectedIndex, selectOption } =
    useSelectedRouteOption(options);

  return (
    <main className="relative h-dvh w-dvw">
      <PragueMap onLoad={() => setMapLoaded(true)}>
        <StopsLayer hidden={selectedOption !== null} />
        {selectedOption && <RouteLayer legs={selectedOption.legs} />}
      </PragueMap>

      <RouteSearchPanel
        ready={mapLoaded}
        status={status}
        error={error}
        options={options}
        selectedIndex={selectedIndex}
        onSelectOption={selectOption}
        onSearch={search}
      />
    </main>
  );
}
