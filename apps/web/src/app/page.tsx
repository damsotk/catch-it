"use client";

import { useState } from "react";
import { PragueMap, RouteSearchPanel } from "@/features/map";
import { MOCK_ROUTE_SEARCH } from "@/mocks/route-search";

const selectedOption = MOCK_ROUTE_SEARCH.options[0];

export default function Home() {
  const [mapLoaded, setMapLoaded] = useState(false);

  return (
    <main className="relative h-dvh w-dvw">
      <PragueMap onLoad={() => setMapLoaded(true)} legs={selectedOption.legs} />
      <RouteSearchPanel ready={mapLoaded} />
    </main>
  );
}
