import { existsSync } from "node:fs";
import path from "node:path";
import { readCsv } from "./csv.mjs";

const WEEKDAY_COLUMNS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

function resolveGtfsDir() {
  const candidates = [
    process.env.GTFS_DIR,
    path.resolve(process.cwd(), "data/gtfs"),
    path.resolve(process.cwd(), "../../data/gtfs"),
    path.resolve(process.cwd(), "apps/web/data/gtfs"),
  ].filter(Boolean);

  for (const dir of candidates) {
    if (existsSync(path.join(dir, "stops.txt"))) return dir;
  }

  throw new Error(
    "GTFS feed not found. Looked in:\n" +
      candidates.map((c) => "  " + c).join("\n") +
      "\nDownload http://data.pid.cz/PID_GTFS.zip and unpack it there, or set GTFS_DIR.",
  );
}

export const gtfsFile = (name) => path.join(resolveGtfsDir(), name);

export function timeToSeconds(value) {
  const [h, m, s] = value.split(":");
  return Number(h) * 3600 + Number(m) * 60 + Number(s ?? 0);
}

export function secondsToTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
}

function parseDistance(value) {
  if (value === "" || value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toDateNum(date) {
  return (
    date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
  );
}

export async function loadActiveServiceIds(date) {
  const dateNum = toDateNum(date);
  const weekday = WEEKDAY_COLUMNS[(date.getDay() + 6) % 7];
  const active = new Set();

  await readCsv(gtfsFile("calendar.txt"), (row) => {
    if (row[weekday] !== "1") return;
    if (dateNum < Number(row.start_date)) return;
    if (dateNum > Number(row.end_date)) return;
    active.add(row.service_id);
  });

  await readCsv(gtfsFile("calendar_dates.txt"), (row) => {
    if (Number(row.date) !== dateNum) return;
    if (row.exception_type === "1") active.add(row.service_id);
    else if (row.exception_type === "2") active.delete(row.service_id);
  });

  return active;
}

export async function loadStops() {
  const stops = new Map();
  const stopsByNode = new Map();
  const entrancesByStation = new Map();

  await readCsv(gtfsFile("stops.txt"), (row) => {
    if (row.location_type === "2") {
      const entrance = {
        id: row.stop_id,
        code: row.stop_name,
        lat: Number(row.stop_lat),
        lon: Number(row.stop_lon),
      };
      const list = entrancesByStation.get(row.parent_station);
      if (list) list.push(entrance);
      else entrancesByStation.set(row.parent_station, [entrance]);
      return;
    }

    const nodeId = row.asw_node_id || row.stop_id;

    stops.set(row.stop_id, {
      id: row.stop_id,
      name: row.stop_name,
      lat: Number(row.stop_lat),
      lon: Number(row.stop_lon),
      nodeId,
      stationId: row.parent_station || null,
    });

    const siblings = stopsByNode.get(nodeId);
    if (siblings) siblings.push(row.stop_id);
    else stopsByNode.set(nodeId, [row.stop_id]);
  });

  return { stops, stopsByNode, entrancesByStation };
}

export async function loadRoutes() {
  const routes = new Map();

  await readCsv(gtfsFile("routes.txt"), (row) => {
    routes.set(row.route_id, {
      id: row.route_id,
      shortName: row.route_short_name,
      longName: row.route_long_name,
      type: Number(row.route_type),
      color: row.route_color || null,
    });
  });

  return routes;
}

export async function loadActiveTrips(activeServiceIds) {
  const trips = new Map();

  await readCsv(gtfsFile("trips.txt"), (row) => {
    if (!activeServiceIds.has(row.service_id)) return;

    trips.set(row.trip_id, {
      id: row.trip_id,
      routeId: row.route_id,
      headsign: row.trip_headsign || null,
      shapeId: row.shape_id || null,
    });
  });

  return trips;
}

export async function loadStopTimes(activeTrips) {
  const stopTimesByTrip = new Map();

  await readCsv(gtfsFile("stop_times.txt"), (row) => {
    if (!activeTrips.has(row.trip_id)) return;

    const entry = {
      stopId: row.stop_id,
      seq: Number(row.stop_sequence),
      arr: timeToSeconds(row.arrival_time),
      dep: timeToSeconds(row.departure_time),
      dist: parseDistance(row.shape_dist_traveled),
    };

    const existing = stopTimesByTrip.get(row.trip_id);
    if (existing) existing.push(entry);
    else stopTimesByTrip.set(row.trip_id, [entry]);
  });

  const tripsByStop = new Map();

  for (const [tripId, stopTimes] of stopTimesByTrip) {
    stopTimes.sort((a, b) => a.seq - b.seq);

    for (let seqIndex = 0; seqIndex < stopTimes.length; seqIndex += 1) {
      const stopId = stopTimes[seqIndex].stopId;
      const boardings = tripsByStop.get(stopId);
      if (boardings) boardings.push({ tripId, seqIndex });
      else tripsByStop.set(stopId, [{ tripId, seqIndex }]);
    }
  }

  return { stopTimesByTrip, tripsByStop };
}

export async function loadShapes(activeTrips) {
  const neededShapeIds = new Set();
  for (const trip of activeTrips.values()) {
    if (trip.shapeId) neededShapeIds.add(trip.shapeId);
  }

  const shapes = new Map();

  await readCsv(gtfsFile("shapes.txt"), (row) => {
    if (!neededShapeIds.has(row.shape_id)) return;

    const point = {
      lat: Number(row.shape_pt_lat),
      lon: Number(row.shape_pt_lon),
      seq: Number(row.shape_pt_sequence),
      dist: parseDistance(row.shape_dist_traveled),
    };

    const existing = shapes.get(row.shape_id);
    if (existing) existing.push(point);
    else shapes.set(row.shape_id, [point]);
  });

  for (const points of shapes.values()) {
    points.sort((a, b) => a.seq - b.seq);
  }

  return shapes;
}

export function sliceShape(points, fromDist, toDist) {
  if (!points || fromDist == null || toDist == null) return null;

  const eps = 1e-6;
  const from = Math.min(fromDist, toDist);
  const to = Math.max(fromDist, toDist);

  const slice = points.filter(
    (p) => p.dist != null && p.dist >= from - eps && p.dist <= to + eps,
  );

  if (slice.length < 2) return null;
  return slice.map((p) => [p.lon, p.lat]);
}

export function normalizeStopName(value) {
  return value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function findStopsByName(stops, query) {
  const needle = normalizeStopName(query.trim());
  if (!needle) return [];

  const exact = [];
  const partial = [];

  for (const stop of stops.values()) {
    const name = normalizeStopName(stop.name);
    if (name === needle) exact.push(stop.id);
    else if (name.includes(needle)) partial.push(stop.id);
  }

  return exact.length > 0 ? exact : partial;
}

export async function loadFeedEndDate() {
  let endDate = null;

  await readCsv(gtfsFile("feed_info.txt"), (row) => {
    if (row.feed_end_date) endDate = Number(row.feed_end_date);
  });

  return endDate;
}

export async function loadGtfs(date = new Date()) {
  const startedAt = Date.now();

  const [
    { stops, stopsByNode, entrancesByStation },
    routes,
    activeServiceIds,
    feedEndDate,
  ] = await Promise.all([
    loadStops(),
    loadRoutes(),
    loadActiveServiceIds(date),
    loadFeedEndDate(),
  ]);

  const trips = await loadActiveTrips(activeServiceIds);

  const [{ stopTimesByTrip, tripsByStop }, shapes] = await Promise.all([
    loadStopTimes(trips),
    loadShapes(trips),
  ]);

  return {
    stops,
    stopsByNode,
    entrancesByStation,
    routes,
    trips,
    stopTimesByTrip,
    tripsByStop,
    shapes,
    stats: {
      date: toDateNum(date),
      feedEndDate,
      stops: stops.size,
      nodes: stopsByNode.size,
      routes: routes.size,
      services: activeServiceIds.size,
      trips: trips.size,
      shapes: shapes.size,
      loadMs: Date.now() - startedAt,
    },
  };
}
