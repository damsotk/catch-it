import type { RouteLeg } from "@catch-it/core";

const FALLBACK_ROUTE_COLOR = "#4b9fff";

export const routeColor = (leg: RouteLeg | undefined) =>
  leg?.routeColor ?? FALLBACK_ROUTE_COLOR;
