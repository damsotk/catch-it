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
  lines: TransitStopLine[];
};

export type StopsResult = {
  stops: TransitStop[];
};
