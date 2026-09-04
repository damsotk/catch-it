"use client";

import { useState } from "react";
import { PragueMap, RouteSearchPanel } from "@/features/map";
import type { RouteLeg } from "@/features/map/types";

export default function Home() {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedLegs] = useState<RouteLeg[] | null>(null);

  return (
    <main className="relative h-dvh w-dvw">
      <PragueMap onLoad={() => setMapLoaded(true)} legs={selectedLegs} />
      <RouteSearchPanel ready={mapLoaded} />
    </main>
  );
}
