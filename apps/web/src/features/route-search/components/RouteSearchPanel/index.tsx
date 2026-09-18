"use client";

import { useRef } from "react";
import type { RouteOption, RouteSearchRequest } from "@catch-it/core";
import type { RouteSearchStatus } from "@/features/route-search/hooks/useRouteSearch";
import { CollapsibleRow } from "./subcomponents/CollapsibleRow";
import { ChevronUpGlyph, CloseGlyph } from "@/components/ui/icons";
import { RouteOptionCard } from "./subcomponents/RouteOptionCard";
import { RouteSearchForm } from "./subcomponents/RouteSearchForm";
import { usePanelReveal } from "./hooks/usePanelReveal";
import { useScrollReveal } from "./hooks/useScrollReveal";

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

  const listRef = useRef<HTMLDivElement>(null);
  useScrollReveal(listRef, options);

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

        <CollapsibleRow expanded={expanded} order={0} className="px-5 pt-4">
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

        <RouteSearchForm
          expanded={expanded}
          searching={status === "loading"}
          onSearch={onSearch}
        />

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
