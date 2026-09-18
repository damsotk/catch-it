import { useState } from "react";
import type { RouteOption } from "@catch-it/core";

export function useSelectedRouteOption(options: RouteOption[]) {
  const [selectedDeparture, setSelectedDeparture] = useState<number | null>(
    null,
  );

  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.departTimeSec === selectedDeparture),
  );

  const selectOption = (index: number) =>
    setSelectedDeparture(options[index]?.departTimeSec ?? null);

  return {
    selectedOption: options[selectedIndex] ?? null,
    selectedIndex,
    selectOption,
  };
}
