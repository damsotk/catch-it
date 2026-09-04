"use client";

import { useRef } from "react";
import type { RouteOption, RouteSearchRequest } from "@catch-it/core";
import type { RouteSearchStatus } from "@/features/map/hooks/useRouteSearch";
import { CollapsibleRow } from "./CollapsibleRow";
import {
  ArrowGlyph,
  ChevronUpGlyph,
  ClockGlyph,
  CloseGlyph,
  PinGlyph,
} from "./icons";
import { RouteInputRow, RouteSubmitRow } from "./RouteInputRow";
import { RouteOptionCard } from "./RouteOptionCard";
import { usePanelReveal } from "./usePanelReveal";
import { useRouteSearchForm } from "./useRouteSearchForm";
import { useScrollReveal } from "./useScrollReveal";

const ROW_COUNT = 5;
const ROW_STAGGER_MS = 70;

function rowDelay(order: number, expanded: boolean) {
  return (expanded ? order : ROW_COUNT - 1 - order) * ROW_STAGGER_MS;
}

type RouteSearchPanelProps = {
  ready?: boolean;
  status: RouteSearchStatus;
  error: string | null;
  options: RouteOption[];
  selectedIndex: number;
  onSelectOption: (index: number) => void;
  onSearch: (request: RouteSearchRequest) => void;
};

export function RouteSearchPanel({
  ready = true,
  status,
  error,
  options,
  selectedIndex,
  onSelectOption,
  onSearch,
}: RouteSearchPanelProps) {
  const { expanded, setExpanded } = usePanelReveal(ready);
  const {
    origin,
    setOrigin,
    destination,
    setDestination,
    departure,
    setDeparture,
    canSubmit,
    submit,
    submitOnEnter,
  } = useRouteSearchForm(onSearch);

  const listRef = useRef<HTMLDivElement>(null);
  useScrollReveal(listRef, options);

  const searching = status === "loading";

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

        <div className="mx-5 mt-1 shrink-0 overflow-hidden rounded-2xl bg-[#1f2423]">
          <CollapsibleRow
            expanded={expanded}
            delayMs={rowDelay(1, expanded)}
            maxHeight={56}
          >
            <RouteInputRow icon={<ArrowGlyph />} tone="blue" isFirst>
              <input
                value={origin}
                onChange={(event) => setOrigin(event.target.value)}
                onKeyDown={submitOnEnter}
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
                onKeyDown={submitOnEnter}
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
                onKeyDown={submitOnEnter}
                className="bg-transparent text-sm text-neutral-100 outline-none [color-scheme:dark]"
              />
            </RouteInputRow>
          </CollapsibleRow>

          <CollapsibleRow
            expanded={expanded}
            delayMs={rowDelay(4, expanded)}
            maxHeight={56}
          >
            <RouteSubmitRow onClick={submit} disabled={!canSubmit || searching}>
              {searching ? "Searching…" : "Find a route"}
            </RouteSubmitRow>
          </CollapsibleRow>
        </div>

        {status === "error" && (
          <p className="mx-5 mt-3 shrink-0 rounded-2xl bg-[#2a1f21] px-4 py-3 text-xs text-[#ff8a80]">
            {error}
          </p>
        )}

        <div
          ref={listRef}
          className={`mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto px-5 pb-5 transition-opacity duration-300 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            expanded ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          {options.map((option, index) => (
            <RouteOptionCard
              key={`${option.departTimeSec}-${index}`}
              option={option}
              selected={index === selectedIndex}
              onSelect={() => onSelectOption(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
