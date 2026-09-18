import { Marker } from "react-map-gl/maplibre";
import { LineBadge } from "@/components/ui/LineBadge";
import { FINISH_COLOR } from "../constants/routeStyle";
import type { Boarding, Position } from "../utils/routeGeometry";

export function BoardingMarker({ boarding }: { boarding: Boarding }) {
  return (
    <Marker longitude={boarding.stop.lon} latitude={boarding.stop.lat}>
      <LineBadge
        name={boarding.routeName}
        color={boarding.color}
        className="text-xs shadow-md shadow-black/40"
      />
    </Marker>
  );
}

type EntranceMarkerProps = {
  position: Position;
  color: string;
};

export function EntranceMarker({ position, color }: EntranceMarkerProps) {
  return (
    <Marker longitude={position[0]} latitude={position[1]}>
      <span
        className="flex items-center gap-1 rounded-full py-0.5 pl-1 pr-2 text-xs font-bold text-white shadow-md shadow-black/40 ring-2 ring-white"
        style={{ backgroundColor: color }}
      >
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/25 text-[10px]">
          M
        </span>
        Metro entrance
      </span>
    </Marker>
  );
}

export function FinishMarker({ position }: { position: Position }) {
  return (
    <Marker longitude={position[0]} latitude={position[1]}>
      <span
        className="block h-3.5 w-3.5 rounded-full ring-2 ring-white"
        style={{ backgroundColor: FINISH_COLOR }}
      />
    </Marker>
  );
}
