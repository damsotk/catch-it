"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

function ClockGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth={1.5}
      className="h-4 w-4"
    >
      <circle cx="12" cy="12" r="8.25" />
      <path strokeLinecap="round" d="M12 8v4.2l2.6 1.6" />
    </svg>
  );
}

function CloseGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth={1.5}
      className="h-4 w-4"
    >
      <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function ChevronUpGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#5f6469"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M6 15l6-6 6 6" />
    </svg>
  );
}

const ROW_STAGGER_MS = 70;
const ROW_COUNT = 5;

function CollapsibleRow({
  expanded,
  order,
  maxHeight,
  className,
  children,
}: {
  expanded: boolean;
  order: number;
  maxHeight: number;
  className?: string;
  children: ReactNode;
}) {
  const delay = expanded
    ? order * ROW_STAGGER_MS
    : (ROW_COUNT - 1 - order) * ROW_STAGGER_MS;

  const style: CSSProperties = {
    maxHeight: expanded ? maxHeight : 0,
    opacity: expanded ? 1 : 0,
    transitionDelay: `${delay}ms`,
  };

  return (
    <div
      className={`overflow-hidden transition-all duration-300 ease-out ${className ?? ""}`}
      style={style}
    >
      {children}
    </div>
  );
}

type RouteSearchPanelProps = {
  ready?: boolean;
};

export function RouteSearchPanel({ ready = true }: RouteSearchPanelProps) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departure, setDeparture] = useState("");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!ready) return;
    const frame = requestAnimationFrame(() => setExpanded(true));
    return () => cancelAnimationFrame(frame);
  }, [ready]);

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <div
        onClick={!expanded ? () => setExpanded(true) : undefined}
        role={!expanded ? "button" : undefined}
        aria-label={!expanded ? "Expand route search" : undefined}
        tabIndex={!expanded ? 0 : undefined}
        className={`pointer-events-auto absolute bottom-1 left-3 flex w-80 flex-col overflow-hidden rounded-3xl bg-[#23262e] shadow-xl shadow-black/50 transition-[top] duration-500 ease-out ${
          expanded ? "top-[100px]" : "top-[calc(100%-2.5rem)] cursor-pointer"
        }`}
      >
        <div
          className="pointer-events-none absolute inset-x-0 bottom-1 flex h-9 items-center justify-center transition-opacity duration-200 ease-out"
          style={{
            opacity: expanded ? 0 : 1,
            transitionDelay: expanded ? "0ms" : "400ms",
          }}
        >
          <ChevronUpGlyph />
        </div>

        <CollapsibleRow expanded={expanded} order={0} maxHeight={56} className="px-5 pt-4">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-semibold text-neutral-100">
              Find a route
            </span>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              aria-label="Close route search"
              className="flex h-6 w-6 items-center justify-center"
            >
              <CloseGlyph />
            </button>
          </div>
        </CollapsibleRow>

        <CollapsibleRow expanded={expanded} order={1} maxHeight={64} className="px-5 pt-2.5">
          <div className="flex items-center gap-3 rounded-2xl bg-[#363941] px-4 py-3.5">
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
        </CollapsibleRow>

        <CollapsibleRow expanded={expanded} order={2} maxHeight={64} className="px-5 pt-2.5">
          <div className="flex items-center gap-3 rounded-2xl bg-[#363941] px-4 py-3.5">
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
        </CollapsibleRow>

        <CollapsibleRow expanded={expanded} order={3} maxHeight={64} className="px-5 pt-2.5">
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#363941] px-4 py-3.5">
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
        </CollapsibleRow>

        <div className="flex-1" />

        <CollapsibleRow expanded={expanded} order={4} maxHeight={80} className="px-5 pb-5 pt-2.5">
          <button
            type="button"
            className="w-full rounded-2xl bg-[#2ed058] py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-white shadow-lg shadow-black/30 transition-colors hover:brightness-110"
          >
            Find a route
          </button>
        </CollapsibleRow>
      </div>
    </div>
  );
}
