"use client";

import { useEffect, useState } from "react";

function ClockGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="h-4 w-4 text-neutral-400"
    >
      <circle cx="12" cy="12" r="8.25" />
      <path strokeLinecap="round" d="M12 8v4.2l2.6 1.6" />
    </svg>
  );
}

type RouteSearchPanelProps = {
  ready?: boolean;
};

export function RouteSearchPanel({ ready = true }: RouteSearchPanelProps) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departure, setDeparture] = useState("");
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!ready) return;
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, [ready]);

  return (
    <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex overflow-hidden">
      <div
        className={`pointer-events-auto flex h-full w-80 flex-col border-r border-white/10 bg-neutral-900/35 shadow-xl shadow-black/50 backdrop-blur-2xl transition-transform duration-700 ease-out ${
          entered ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col gap-2.5 p-5">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3.5 shadow-md shadow-black/20">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center">
              <span className="h-2 w-2 rounded-full bg-emerald-400/90" />
            </span>
            <input
              value={origin}
              onChange={(event) => setOrigin(event.target.value)}
              placeholder="From"
              className="w-full bg-transparent text-sm text-neutral-100 placeholder:text-neutral-400 outline-none"
            />
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3.5 shadow-md shadow-black/20">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center">
              <span className="h-2 w-2 rounded-full border border-neutral-300" />
            </span>
            <input
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              placeholder="To"
              className="w-full bg-transparent text-sm text-neutral-100 placeholder:text-neutral-400 outline-none"
            />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3.5 shadow-md shadow-black/20">
            <div className="flex items-center gap-2.5">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                <ClockGlyph />
              </span>
              <span className="text-xs text-neutral-300">Depart</span>
            </div>
            <input
              type="time"
              value={departure}
              onChange={(event) => setDeparture(event.target.value)}
              className="bg-transparent text-sm text-neutral-100 outline-none [color-scheme:dark]"
            />
          </div>
        </div>

        <div className="mt-auto p-5">
          <button
            type="button"
            className="w-full rounded-2xl bg-neutral-50 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-neutral-900 shadow-lg shadow-black/30 transition-colors hover:bg-white"
          >
            Find a route
          </button>
        </div>
      </div>
    </div>
  );
}
