export type RouteLegStop = {
  id: string;
  name: string;
  lat: number;
  lon: number;
};

export type RouteLeg = {
  transfer: boolean;
  routeName: string | null;
  routeColor: string | null;
  headsign: string | null;
  boardTime: number;
  alightTime: number;
  stops: RouteLegStop[];
  geometry: [number, number][];
};

export type RouteOption = {
  legs: RouteLeg[];
  departTimeSec: number;
  arriveTimeSec: number;
  durationSec: number;
  transfers: number;
  isFastest: boolean;
};

export type RouteSearchResult = {
  origin: string;
  destination: string;
  departureTimeSec: number;
  options: RouteOption[];
};
