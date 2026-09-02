"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

function ArrowGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="white" className="h-3.5 w-3.5">
      <path d="M12 2 19 21 12 17 5 21 12 2Z" />
    </svg>
  );
}

function PinGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth={1.6}
      className="h-3.5 w-3.5"
    >
      <path
        strokeLinejoin="round"
        d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z"
      />
      <circle cx="12" cy="9.3" r="2.1" />
    </svg>
  );
}

function ClockGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth={1.6}
      className="h-3.5 w-3.5"
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

function Badge({ tone, children }: { tone: "blue" | "gray"; children: ReactNode }) {
  return (
    <span
      className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
        tone === "blue" ? "bg-[#0a84ff]" : "bg-[#3a3f41]"
      }`}
    >
      {children}
    </span>
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
        className={`pointer-events-auto absolute bottom-[30px] left-3 flex w-80 flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#23262e]/75 shadow-xl shadow-black/50 backdrop-blur-2xl transition-[top] duration-500 ease-out ${
          expanded ? "top-[30px]" : "top-[calc(100%-66px)] cursor-pointer"
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

        <div className="mx-5 mt-1 overflow-hidden rounded-2xl bg-[#1f2423]">
          <CollapsibleRow expanded={expanded} order={1} maxHeight={56}>
            <div className="relative flex items-center gap-3 px-4">
              <span
                aria-hidden
                className="pointer-events-none absolute left-[30px] top-1/2 bottom-0 w-px bg-white/10"
              />
              <Badge tone="blue">
                <ArrowGlyph />
              </Badge>
              <div className="flex min-w-0 flex-1 items-center py-3.5">
                <input
                  value={origin}
                  onChange={(event) => setOrigin(event.target.value)}
                  placeholder="From"
                  className="w-full bg-transparent text-sm text-neutral-100 placeholder:text-neutral-400 outline-none"
                />
              </div>
            </div>
          </CollapsibleRow>

          <CollapsibleRow expanded={expanded} order={2} maxHeight={56}>
            <div className="relative flex items-center gap-3 px-4">
              <span
                aria-hidden
                className="pointer-events-none absolute left-[30px] top-0 bottom-0 w-px bg-white/10"
              />
              <Badge tone="gray">
                <PinGlyph />
              </Badge>
              <div className="flex min-w-0 flex-1 items-center border-t border-white/10 py-3.5">
                <input
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                  placeholder="To"
                  className="w-full bg-transparent text-sm text-neutral-100 placeholder:text-neutral-400 outline-none"
                />
              </div>
            </div>
          </CollapsibleRow>

          <CollapsibleRow expanded={expanded} order={3} maxHeight={56}>
            <div className="relative flex items-center gap-3 px-4">
              <span
                aria-hidden
                className="pointer-events-none absolute left-[30px] top-0 bottom-0 w-px bg-white/10"
              />
              <Badge tone="gray">
                <ClockGlyph />
              </Badge>
              <div className="flex min-w-0 flex-1 items-center justify-between border-t border-white/10 py-3.5">
                <span className="text-sm text-neutral-100">Depart</span>
                <input
                  type="time"
                  value={departure}
                  onChange={(event) => setDeparture(event.target.value)}
                  className="bg-transparent text-sm text-neutral-100 outline-none [color-scheme:dark]"
                />
              </div>
            </div>
          </CollapsibleRow>

          <CollapsibleRow expanded={expanded} order={4} maxHeight={56}>
            <button
              type="button"
              className="group relative flex w-full cursor-pointer items-center gap-3 px-4 text-left transition-colors duration-200 hover:bg-white/[0.04]"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute left-[30px] top-0 h-4 w-px bg-white/10"
              />
              <span className="h-7 w-7 shrink-0" />
              <span className="flex-1 border-t border-white/10 py-3.5 text-sm font-semibold text-[#2ed058] transition-colors duration-200 group-hover:text-[#3fe06c]">
                Find a route
              </span>
            </button>
          </CollapsibleRow>
        </div>

        <div className="flex-1" />
      </div>
    </div>
  );
}
