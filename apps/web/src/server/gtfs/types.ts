export type GtfsStop = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  nodeId: string;
};

export type GtfsRoute = {
  id: string;
  shortName: string;
  longName: string;
  type: number;
  color: string | null;
};

export type GtfsTrip = {
  id: string;
  routeId: string;
  headsign: string | null;
  shapeId: string | null;
};

export type GtfsStopTime = {
  stopId: string;
  seq: number;
  arr: number;
  dep: number;
  dist: number | null;
};

export type GtfsShapePoint = {
  lat: number;
  lon: number;
  seq: number;
  dist: number | null;
};

export type GtfsContext = {
  stops: Map<string, GtfsStop>;
  stopsByNode: Map<string, string[]>;
  routes: Map<string, GtfsRoute>;
  trips: Map<string, GtfsTrip>;
  stopTimesByTrip: Map<string, GtfsStopTime[]>;
  tripsByStop: Map<string, { tripId: string; seqIndex: number }[]>;
  shapes: Map<string, GtfsShapePoint[]>;
  stats: Record<string, number>;
};

export type EngineLeg = {
  transfer: boolean;
  routeId: string | null;
  routeName: string | null;
  routeColor: string | null;
  headsign: string | null;
  boardStopId: string;
  boardStopName: string | null;
  boardTime: number;
  alightStopId: string;
  alightStopName: string | null;
  alightTime: number;
  stopIds: string[];
  shapeId: string | null;
  boardDist: number | null;
  alightDist: number | null;
};

export type EngineOption = {
  legs: EngineLeg[];
  departTimeSec: number;
  arriveTimeSec: number;
  durationSec: number;
  transfers: number;
  isFastest: boolean;
};
