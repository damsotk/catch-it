import { NextResponse } from "next/server";
import type {
  RouteLeg,
  RouteLegStop,
  RouteSearchRequest,
  RouteSearchResult,
} from "@catch-it/core";
import {
  findStopsByName,
  sliceShape,
  timeToSeconds,
} from "@/server/gtfs/loadGtfs.mjs";
import { searchDepartures } from "@/server/gtfs/search.mjs";
import { getGtfs } from "@/server/gtfs/store.mjs";
import type {
  EngineLeg,
  EngineOption,
  GtfsContext,
  GtfsEntrance,
  GtfsStop,
} from "@/server/gtfs/types";

export const runtime = "nodejs";

const MAX_OPTIONS = 15;

function nowSeconds(): number {
  const now = new Date();
  return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
}

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

type Point = { lat: number; lon: number };

function distance2(a: Point, b: Point): number {
  const dx = (a.lon - b.lon) * Math.cos((a.lat * Math.PI) / 180);
  const dy = a.lat - b.lat;
  return dx * dx + dy * dy;
}

function entranceFor(
  stop: GtfsStop | undefined,
  other: GtfsStop | undefined,
  gtfs: GtfsContext,
): GtfsEntrance | null {
  if (!stop?.stationId || !other) return null;
  if (other.stationId === stop.stationId) return null;

  const entrances = gtfs.entrancesByStation.get(stop.stationId);
  if (!entrances?.length) return null;

  return entrances.reduce((best, entrance) =>
    distance2(entrance, other) < distance2(best, other) ? entrance : best,
  );
}

function walkLeg(leg: EngineLeg, stops: RouteLegStop[], gtfs: GtfsContext) {
  const from = gtfs.stops.get(leg.boardStopId);
  const to = gtfs.stops.get(leg.alightStopId);
  const exit = entranceFor(from, to, gtfs);
  const entry = entranceFor(to, from, gtfs);

  const points = stops.map((stop) => [stop.lon, stop.lat] as [number, number]);
  if (exit) points[0] = [exit.lon, exit.lat];
  if (entry) points[points.length - 1] = [entry.lon, entry.lat];

  return {
    geometry: points,
    ...(exit && { startEntrance: exit.code }),
    ...(entry && { endEntrance: entry.code }),
  };
}

function toWireLeg(leg: EngineLeg, gtfs: GtfsContext): RouteLeg {
  const stops: RouteLegStop[] = leg.stopIds
    .map((id) => gtfs.stops.get(id))
    .filter((stop) => stop !== undefined)
    .map((stop) => ({
      id: stop.id,
      name: stop.name,
      lat: stop.lat,
      lon: stop.lon,
    }));

  const base = {
    transfer: leg.transfer,
    routeName: leg.routeName,
    routeColor: leg.routeColor ? `#${leg.routeColor}` : null,
    headsign: leg.headsign,
    boardTime: leg.boardTime,
    alightTime: leg.alightTime,
    stops,
  };

  if (leg.transfer) return { ...base, ...walkLeg(leg, stops, gtfs) };

  const shapePoints = leg.shapeId ? gtfs.shapes.get(leg.shapeId) : null;
  const exact = sliceShape(shapePoints, leg.boardDist, leg.alightDist);

  return {
    ...base,
    geometry:
      exact ?? stops.map((stop) => [stop.lon, stop.lat] as [number, number]),
  };
}

export async function POST(request: Request) {
  let body: Partial<RouteSearchRequest>;
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.", 400);
  }

  const origin = body.origin?.trim() ?? "";
  const destination = body.destination?.trim() ?? "";

  if (!origin || !destination) {
    return error("Both origin and destination are required.", 400);
  }

  let startTimeSec = nowSeconds();
  if (body.time) {
    if (!/^\d{1,2}:\d{2}$/.test(body.time)) {
      return error(`Invalid time "${body.time}", expected HH:MM.`, 400);
    }
    startTimeSec = timeToSeconds(`${body.time}:00`);
  }

  const gtfs: GtfsContext = await getGtfs();

  const { date, feedEndDate } = gtfs.stats;
  if (feedEndDate !== null && date > feedEndDate) {
    return error(
      `The GTFS feed expired on ${feedEndDate}. Download a fresh http://data.pid.cz/PID_GTFS.zip into data/gtfs and restart the server.`,
      503,
    );
  }

  const originStopIds = findStopsByName(gtfs.stops, origin);
  if (originStopIds.length === 0) {
    return error(`No stop found matching "${origin}".`, 404);
  }

  const destinationStopIds = findStopsByName(gtfs.stops, destination);
  if (destinationStopIds.length === 0) {
    return error(`No stop found matching "${destination}".`, 404);
  }

  const options: EngineOption[] = searchDepartures(
    gtfs,
    originStopIds,
    destinationStopIds,
    startTimeSec,
    MAX_OPTIONS,
  );

  if (options.length === 0) {
    return error(
      `No route found from "${origin}" to "${destination}" within the round limit.`,
      404,
    );
  }

  const result: RouteSearchResult = {
    origin,
    destination,
    departureTimeSec: startTimeSec,
    options: options.map((option) => ({
      departTimeSec: option.departTimeSec,
      arriveTimeSec: option.arriveTimeSec,
      durationSec: option.durationSec,
      transfers: option.transfers,
      isFastest: option.isFastest,
      legs: option.legs.map((leg) => toWireLeg(leg, gtfs)),
    })),
  };

  return NextResponse.json(result);
}
