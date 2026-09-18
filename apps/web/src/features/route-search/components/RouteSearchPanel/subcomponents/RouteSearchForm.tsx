import type { RouteSearchRequest } from "@catch-it/core";
import { CollapsibleRow } from "./CollapsibleRow";
import { ArrowGlyph, ClockGlyph, PinGlyph } from "@/components/ui/icons";
import { RouteInputRow, RouteSubmitRow } from "./RouteInputRow";
import { useRouteSearchForm } from "../hooks/useRouteSearchForm";

const PLACE_INPUT_CLASS =
  "w-full bg-transparent text-sm text-neutral-100 placeholder:text-neutral-400 outline-none";

type RouteSearchFormProps = {
  expanded: boolean;
  searching: boolean;
  onSearch: (request: RouteSearchRequest) => void;
};

export function RouteSearchForm({
  expanded,
  searching,
  onSearch,
}: RouteSearchFormProps) {
  const form = useRouteSearchForm(onSearch);

  return (
    <div className="mx-5 mt-1 shrink-0 overflow-hidden rounded-2xl bg-[#1f2423]">
      <CollapsibleRow expanded={expanded} order={1}>
        <RouteInputRow icon={<ArrowGlyph />} tone="blue" isFirst>
          <input
            value={form.origin}
            onChange={(event) => form.setOrigin(event.target.value)}
            onKeyDown={form.submitOnEnter}
            placeholder="From"
            className={PLACE_INPUT_CLASS}
          />
        </RouteInputRow>
      </CollapsibleRow>

      <CollapsibleRow expanded={expanded} order={2}>
        <RouteInputRow icon={<PinGlyph />} tone="gray">
          <input
            value={form.destination}
            onChange={(event) => form.setDestination(event.target.value)}
            onKeyDown={form.submitOnEnter}
            placeholder="To"
            className={PLACE_INPUT_CLASS}
          />
        </RouteInputRow>
      </CollapsibleRow>

      <CollapsibleRow expanded={expanded} order={3}>
        <RouteInputRow icon={<ClockGlyph />} tone="gray">
          <span className="text-sm text-neutral-100">Depart</span>
          <input
            type="time"
            value={form.departure}
            onChange={(event) => form.setDeparture(event.target.value)}
            onKeyDown={form.submitOnEnter}
            className="bg-transparent text-sm text-neutral-100 outline-none [color-scheme:dark]"
          />
        </RouteInputRow>
      </CollapsibleRow>

      <CollapsibleRow expanded={expanded} order={4}>
        <RouteSubmitRow
          onClick={form.submit}
          disabled={!form.canSubmit || searching}
        >
          {searching ? "Searching…" : "Find a route"}
        </RouteSubmitRow>
      </CollapsibleRow>
    </div>
  );
}
