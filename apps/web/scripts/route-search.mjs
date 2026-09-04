import {
  findStopsByName,
  secondsToTime,
  sliceShape,
  timeToSeconds,
} from "../src/server/gtfs/loadGtfs.mjs";
import { searchDepartures } from "../src/server/gtfs/search.mjs";
import { getGtfs } from "../src/server/gtfs/store.mjs";

const [origin, destination, time] = process.argv.slice(2);

if (!origin || !destination) {
  console.error(
    'Usage: node scripts/route-search.mjs "<origin>" "<destination>" [HH:MM]',
  );
  process.exit(1);
}

const gtfs = await getGtfs();
console.log("feed:", gtfs.stats);

const originStopIds = findStopsByName(gtfs.stops, origin);
const destinationStopIds = findStopsByName(gtfs.stops, destination);
console.log(
  `resolved: "${origin}" -> ${originStopIds.length} stop(s), "${destination}" -> ${destinationStopIds.length} stop(s)`,
);

if (originStopIds.length === 0 || destinationStopIds.length === 0) {
  console.error("No matching stops, nothing to search.");
  process.exit(1);
}

const startTimeSec = time
  ? timeToSeconds(`${time}:00`)
  : (() => {
      const now = new Date();
      return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    })();

const startedAt = Date.now();
const options = searchDepartures(
  gtfs,
  originStopIds,
  destinationStopIds,
  startTimeSec,
  15,
);
console.log(
  `search from ${secondsToTime(startTimeSec)}: ${options.length} option(s) in ${Date.now() - startedAt}ms\n`,
);

for (const option of options) {
  const minutes = Math.round(option.durationSec / 60);
  console.log(
    `${option.isFastest ? "*" : " "} ${secondsToTime(option.departTimeSec)} -> ${secondsToTime(option.arriveTimeSec)}  ${minutes} min, ${option.transfers} transfer(s)`,
  );

  for (const leg of option.legs) {
    if (leg.transfer) {
      console.log(
        `    walk   ${leg.boardStopName} -> ${leg.alightStopName} (${secondsToTime(leg.boardTime)})`,
      );
      continue;
    }

    const shapePoints = leg.shapeId ? gtfs.shapes.get(leg.shapeId) : null;
    const geometry = sliceShape(shapePoints, leg.boardDist, leg.alightDist);

    console.log(
      `    ${String(leg.routeName).padEnd(6)} ${leg.boardStopName} (${secondsToTime(leg.boardTime)}) -> ${leg.alightStopName} (${secondsToTime(leg.alightTime)})` +
        `  ${leg.stopIds.length} stops, geometry: ${geometry ? `${geometry.length} pts` : "fallback"}`,
    );
  }

  console.log();
}
