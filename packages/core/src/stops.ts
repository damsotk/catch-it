export type TransitMode =
  | "metro"
  | "train"
  | "tram"
  | "trolleybus"
  | "ferry"
  | "funicular"
  | "bus"
  | "other";

export type TransitStopLine = {
  name: string;
  mode: TransitMode;
};

export type TransitStop = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  mode: TransitMode;
  color: string | null;
  /** Compass bearing the stop's main mode departs in; null if ambiguous. */
  bearing: number | null;
  lines: TransitStopLine[];
};

export type StopsResult = {
  stops: TransitStop[];
};
