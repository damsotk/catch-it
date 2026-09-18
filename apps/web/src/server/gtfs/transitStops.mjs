import { readCsv } from "./csv.mjs";
import { gtfsFile } from "./loadGtfs.mjs";

const MODE_BY_ROUTE_TYPE = {
  0: "tram",
  1: "metro",
  2: "train",
  3: "bus",
  4: "ferry",
  7: "funicular",
  11: "trolleybus",
};

const MODE_PRIORITY = [
  "metro",
  "train",
  "tram",
  "trolleybus",
  "funicular",
  "ferry",
  "bus",
  "other",
];

// Fare zones P, 0 and B cover Prague itself. Zone B also reaches a few
// villages past the border, but those are named "Town,Stop" like every other
// regional stop, while Prague stops never contain a comma.
const PRAGUE_ZONES = new Set(["P", "0", "B"]);

// Cities with 20k+ inhabitants that the PID feed reaches.
const BIG_CITIES = [
  "Plzeň",
  "Liberec",
  "Kladno",
  "Chomutov",
  "Mladá Boleslav",
  "Česká Lípa",
  "Tábor",
  "Příbram",
  "Kolín",
  "Písek",
  "Litoměřice",
  "Kutná Hora",
  "Beroun",
];

function isInCity(row) {
  const name = row.stop_name;

  if (!name.includes(",")) {
    if (row.zone_id.split(",").some((zone) => PRAGUE_ZONES.has(zone))) {
      return true;
    }
  }

  return BIG_CITIES.some(
    (city) => name === city || name.startsWith(`${city},`),
  );
}

const modeRank = (mode) => MODE_PRIORITY.indexOf(mode);

const compareLines = (a, b) =>
  modeRank(a.mode) - modeRank(b.mode) ||
  a.name.localeCompare(b.name, "cs", { numeric: true });

let cached = null;

async function loadTransitStops() {
  const routes = new Map();

  await readCsv(gtfsFile("routes.txt"), (row) => {
    routes.set(row.route_id, {
      name: row.route_short_name,
      mode: MODE_BY_ROUTE_TYPE[row.route_type] ?? "other",
      color: row.route_color ? `#${row.route_color}` : null,
    });
  });

  const routeIdsByStop = new Map();

  await readCsv(gtfsFile("route_stops.txt"), (row) => {
    if (!routes.has(row.route_id)) return;

    const routeIds = routeIdsByStop.get(row.stop_id);
    if (routeIds) routeIds.add(row.route_id);
    else routeIdsByStop.set(row.stop_id, new Set([row.route_id]));
  });

  // Platforms of one station often repeat at identical coordinates (one row
  // per fare zone), so they are merged into a single map point.
  const byPosition = new Map();

  await readCsv(gtfsFile("stops.txt"), (row) => {
    if (row.location_type && row.location_type !== "0") return;

    const routeIds = routeIdsByStop.get(row.stop_id);
    if (!routeIds) return;

    const key = `${row.stop_name}|${row.stop_lat}|${row.stop_lon}`;
    let entry = byPosition.get(key);
    if (!entry) {
      entry = {
        id: row.stop_id,
        name: row.stop_name,
        lat: Number(row.stop_lat),
        lon: Number(row.stop_lon),
        routeIds: new Set(),
        inCity: false,
      };
      byPosition.set(key, entry);
    }

    if (isInCity(row)) entry.inCity = true;
    for (const routeId of routeIds) entry.routeIds.add(routeId);
  });

  const stops = [];

  for (const entry of byPosition.values()) {
    const lineRoutes = [...entry.routeIds]
      .map((id) => routes.get(id))
      .sort(compareLines);

    // Train stations stay everywhere so the rail network remains visible.
    const hasTrain = lineRoutes.some((route) => route.mode === "train");
    if (!entry.inCity && !hasTrain) continue;

    const lines = [];
    const seen = new Set();
    for (const route of lineRoutes) {
      const lineKey = `${route.mode}|${route.name}`;
      if (seen.has(lineKey)) continue;
      seen.add(lineKey);
      lines.push({ name: route.name, mode: route.mode });
    }

    const primary = lineRoutes[0];

    stops.push({
      id: entry.id,
      name: entry.name,
      lat: entry.lat,
      lon: entry.lon,
      mode: primary.mode,
      color: primary.mode === "metro" ? primary.color : null,
      lines,
    });
  }

  return stops;
}

export function getTransitStops() {
  if (!cached) {
    const promise = loadTransitStops();
    cached = promise;

    promise.catch(() => {
      if (cached === promise) cached = null;
    });
  }

  return cached;
}
