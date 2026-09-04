import type { RouteOption } from "@catch-it/core";
import { formatClock, formatDuration } from "./format";

const FALLBACK_ROUTE_COLOR = "#4b9fff";

function transfersLabel(transfers: number) {
  if (transfers === 0) return "Direct";
  return transfers === 1 ? "1 transfer" : `${transfers} transfers`;
}

export function RouteSummary({ option }: { option: RouteOption }) {
  const rides = option.legs.filter((leg) => !leg.transfer);

  return (
    <div className="mx-5 mt-3 rounded-2xl bg-[#1f2423] px-4 py-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-neutral-100">
          {formatClock(option.departTimeSec)} →{" "}
          {formatClock(option.arriveTimeSec)}
        </span>
        <span className="text-xs text-neutral-400">
          {formatDuration(option.durationSec)} ·{" "}
          {transfersLabel(option.transfers)}
        </span>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {rides.map((leg, index) => (
          <span
            key={`${leg.routeName}-${index}`}
            className="rounded-full px-2 py-0.5 text-[11px] font-bold text-white"
            style={{ backgroundColor: leg.routeColor ?? FALLBACK_ROUTE_COLOR }}
          >
            {leg.routeName}
          </span>
        ))}
      </div>
    </div>
  );
}
