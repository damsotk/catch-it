"use client";

import { useState } from "react";
import { PragueMap, RouteSearchPanel } from "@/features/map";

export default function Home() {
  const [mapLoaded, setMapLoaded] = useState(false);

  return (
    <main className="relative h-dvh w-dvw">
      <PragueMap onLoad={() => setMapLoaded(true)} />
      <RouteSearchPanel ready={mapLoaded} />
    </main>
  );
}
