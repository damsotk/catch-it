import type { RouteOption } from "@catch-it/core";
import { formatClock, formatDuration } from "./format";

const FALLBACK_ROUTE_COLOR = "#4b9fff";

function transfersLabel(transfers: number) {
  if (transfers === 0) return "Direct";
  return transfers === 1 ? "1 transfer" : `${transfers} transfers`;
}

type RouteOptionCardProps = {
  option: RouteOption;
  selected: boolean;
  onSelect: () => void;
};

export function RouteOptionCard({
  option,
  selected,
  onSelect,
}: RouteOptionCardProps) {
  const rides = option.legs.filter((leg) => !leg.transfer);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected}
      className={`w-full rounded-2xl px-4 py-3 text-left transition-colors duration-200 ${
        selected
          ? "bg-[#2b3230] ring-1 ring-white/15"
          : "bg-[#1f2423] hover:bg-[#242a29]"
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-neutral-100">
          {formatClock(option.departTimeSec)} →{" "}
          {formatClock(option.arriveTimeSec)}
        </span>
        <span className="shrink-0 text-xs text-neutral-400">
          {formatDuration(option.durationSec)}
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

      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs text-neutral-400">
          {transfersLabel(option.transfers)}
        </span>
        {option.isFastest && (
          <span className="rounded-full bg-[#2ed058]/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#2ed058]">
            Fastest
          </span>
        )}
      </div>
    </button>
  );
}
