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
  color?: string;
};

export type TransitStop = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  mode: TransitMode;
  stationId: string | null;
  color: string | null;
  bearing: number | null;
  lines: TransitStopLine[];
};

export type TransitEntrance = {
  id: string;
  stationId: string;
  name: string;
  code: string;
  lat: number;
  lon: number;
  accessible: boolean;
  color: string | null;
  lines: TransitStopLine[];
};

export type StopsResult = {
  stops: TransitStop[];
  entrances: TransitEntrance[];
};
