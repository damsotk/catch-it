import { PragueMap, RouteSearchPanel } from "@/features/map";

export default function Home() {
  return (
    <main className="relative h-dvh w-dvw">
      <PragueMap />
      <RouteSearchPanel />
    </main>
  );
}
