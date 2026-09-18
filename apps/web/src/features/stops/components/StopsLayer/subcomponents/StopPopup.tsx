import { Marker } from "react-map-gl/maplibre";
import { LineBadge } from "@/components/ui/LineBadge";
import { MODE_COLORS } from "@/features/stops/constants/transitModes";
import type { StopMapItem } from "../utils/stopFeatures";

const MAX_VISIBLE_LINES = 14;

export function StopPopup({ stop }: { stop: StopMapItem }) {
  const visibleLines = stop.lines.slice(0, MAX_VISIBLE_LINES);
  const hiddenCount = stop.lines.length - visibleLines.length;

  return (
    <Marker
      longitude={stop.lon}
      latitude={stop.lat}
      anchor="bottom"
      offset={[0, -14]}
      style={{ pointerEvents: "none", zIndex: 20 }}
    >
      <div className="max-w-64 rounded-2xl border border-white/10 bg-[#23262e]/90 px-3 py-2 shadow-xl shadow-black/50 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: stop.color }}
          />
          <span className="truncate">{stop.name}</span>
        </div>

        {stop.kind === "entrance" && (
          <div className="mt-0.5 text-xs text-white/60">
            Metro entrance
            {stop.accessible && " · step-free"}
          </div>
        )}

        <div className="mt-1.5 flex flex-wrap gap-1">
          {visibleLines.map((line) => (
            <LineBadge
              key={`${line.mode}-${line.name}`}
              name={line.name}
              color={line.color ?? MODE_COLORS[line.mode]}
              variant="outline"
            />
          ))}
          {hiddenCount > 0 && (
            <span className="px-1 text-[11px] leading-5 text-white/50">
              +{hiddenCount}
            </span>
          )}
        </div>
      </div>
    </Marker>
  );
}
