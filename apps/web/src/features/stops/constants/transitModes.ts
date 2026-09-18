import type { TransitMode } from "@catch-it/core";

export const MODE_COLORS: Record<TransitMode, string> = {
  metro: "#ffffff",
  train: "#7d7aff",
  tram: "#ff9f0a",
  trolleybus: "#bf5af2",
  funicular: "#ff375f",
  ferry: "#40c8e0",
  bus: "#64d2ff",
  other: "#d1d1d6",
};

export const MODE_RANK: Record<TransitMode, number> = {
  metro: 7,
  train: 6,
  tram: 5,
  trolleybus: 4,
  funicular: 3,
  ferry: 2,
  bus: 1,
  other: 0,
};

export const MODE_SCALE: Record<TransitMode, number> = {
  metro: 1.8,
  train: 1.5,
  tram: 1.15,
  trolleybus: 1.15,
  funicular: 1.15,
  ferry: 1.15,
  bus: 1,
  other: 1,
};
