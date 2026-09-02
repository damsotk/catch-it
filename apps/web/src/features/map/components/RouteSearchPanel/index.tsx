"use client";

import { useEffect, useState } from "react";
import { CollapsibleRow } from "./CollapsibleRow";
import {
  ArrowGlyph,
  ChevronUpGlyph,
  ClockGlyph,
  CloseGlyph,
  PinGlyph,
} from "./icons";
import { RouteInputRow, RouteSubmitRow } from "./RouteInputRow";

const ROW_COUNT = 5;
const ROW_STAGGER_MS = 70;

function rowDelay(order: number, expanded: boolean) {
  return (expanded ? order : ROW_COUNT - 1 - order) * ROW_STAGGER_MS;
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

        <CollapsibleRow
          expanded={expanded}
          delayMs={rowDelay(0, expanded)}
          maxHeight={56}
          className="px-5 pt-4"
        >
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
          <CollapsibleRow
            expanded={expanded}
            delayMs={rowDelay(1, expanded)}
            maxHeight={56}
          >
            <RouteInputRow icon={<ArrowGlyph />} tone="blue" isFirst>
              <input
                value={origin}
                onChange={(event) => setOrigin(event.target.value)}
                placeholder="From"
                className="w-full bg-transparent text-sm text-neutral-100 placeholder:text-neutral-400 outline-none"
              />
            </RouteInputRow>
          </CollapsibleRow>

          <CollapsibleRow
            expanded={expanded}
            delayMs={rowDelay(2, expanded)}
            maxHeight={56}
          >
            <RouteInputRow icon={<PinGlyph />} tone="gray">
              <input
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                placeholder="To"
                className="w-full bg-transparent text-sm text-neutral-100 placeholder:text-neutral-400 outline-none"
              />
            </RouteInputRow>
          </CollapsibleRow>

          <CollapsibleRow
            expanded={expanded}
            delayMs={rowDelay(3, expanded)}
            maxHeight={56}
          >
            <RouteInputRow icon={<ClockGlyph />} tone="gray">
              <span className="text-sm text-neutral-100">Depart</span>
              <input
                type="time"
                value={departure}
                onChange={(event) => setDeparture(event.target.value)}
                className="bg-transparent text-sm text-neutral-100 outline-none [color-scheme:dark]"
              />
            </RouteInputRow>
          </CollapsibleRow>

          <CollapsibleRow
            expanded={expanded}
            delayMs={rowDelay(4, expanded)}
            maxHeight={56}
          >
            <RouteSubmitRow>Find a route</RouteSubmitRow>
          </CollapsibleRow>
        </div>

        <div className="flex-1" />
      </div>
    </div>
  );
}
