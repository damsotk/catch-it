const TRANSFER_BUFFER_SEC = 120;

const MAX_LEGS = 32;
const MAX_JOURNEY_SEC = 3 * 3600;

function reconstructPath(reached, destStopId, gtfs) {
  const { stops, trips, routes, stopTimesByTrip } = gtfs;
  const legs = [];

  let current = destStopId;

  for (let step = 0; step < MAX_LEGS; step += 1) {
    const entry = reached.get(current);
    if (!entry || entry.viaTripId === null) break;

    const boardStopId = entry.boardStopId;
    const boardStop = stops.get(boardStopId);
    const alightStop = stops.get(current);

    if (entry.viaTripId === "TRANSFER") {
      legs.unshift({
        transfer: true,
        routeId: null,
        routeName: null,
        routeColor: null,
        headsign: null,
        boardStopId,
        boardStopName: boardStop?.name ?? null,
        boardTime: entry.boardTime,
        alightStopId: current,
        alightStopName: alightStop?.name ?? null,
        alightTime: entry.time,
        stopIds: [boardStopId, current],
        shapeId: null,
        boardDist: null,
        alightDist: null,
      });
    } else {
      const trip = trips.get(entry.viaTripId);
      const route = trip ? routes.get(trip.routeId) : null;
      const stopTimes = stopTimesByTrip.get(entry.viaTripId) ?? [];
      const ridden = stopTimes.slice(
        entry.boardSeqIndex,
        entry.alightSeqIndex + 1,
      );

      legs.unshift({
        transfer: false,
        routeId: trip?.routeId ?? null,
        routeName: route ? route.shortName || route.longName || null : null,
        routeColor: route?.color ?? null,
        headsign: trip?.headsign ?? null,
        boardStopId,
        boardStopName: boardStop?.name ?? null,
        boardTime: entry.boardTime,
        alightStopId: current,
        alightStopName: alightStop?.name ?? null,
        alightTime: entry.time,
        stopIds: ridden.map((st) => st.stopId),
        shapeId: trip?.shapeId ?? null,
        boardDist: ridden[0]?.dist ?? null,
        alightDist: ridden[ridden.length - 1]?.dist ?? null,
      });
    }

    current = boardStopId;
  }

  return legs;
}

export function searchRoute(
  gtfs,
  originStopIds,
  destinationStopIds,
  startTimeSec,
  { maxRounds = 4, excludeRouteIds = null } = {},
) {
  const { stops, stopsByNode, trips, stopTimesByTrip, tripsByStop } = gtfs;

  const reached = new Map();
  for (const stopId of originStopIds) {
    if (!stops.has(stopId)) continue;
    reached.set(stopId, {
      time: startTimeSec,
      viaTripId: null,
      boardStopId: null,
      boardTime: startTimeSec,
    });
  }
  if (reached.size === 0) return null;

  const destinations = new Set(destinationStopIds);

  const earliestOf = (source) => {
    let best = null;
    for (const stopId of destinations) {
      const entry = source.get(stopId);
      if (!entry) continue;
      if (best === null || entry.time < source.get(best).time) best = stopId;
    }
    return best;
  };

  const finish = (stopId) => {
    const legs = reconstructPath(reached, stopId, gtfs);
    return legs.length > 0 ? legs : null;
  };

  const alreadyThere = earliestOf(reached);
  if (alreadyThere) return finish(alreadyThere);

  let frontier = [...reached.keys()];

  let bestArrival = startTimeSec + MAX_JOURNEY_SEC;

  for (let round = 0; round < maxRounds; round += 1) {
    const updates = new Map();

    const consider = (stopId, candidate) => {
      if (candidate.time >= bestArrival) return;

      const known = reached.get(stopId);
      if (known && known.time <= candidate.time) return;
      const pending = updates.get(stopId);
      if (pending && pending.time <= candidate.time) return;

      updates.set(stopId, candidate);
      if (destinations.has(stopId)) bestArrival = candidate.time;
    };

    const boardingByTrip = new Map();

    for (const stopId of frontier) {
      const from = reached.get(stopId);
      if (!from) continue;
      if (from.time >= bestArrival) continue;

      const boardings = tripsByStop.get(stopId);
      if (!boardings) continue;

      for (const { tripId, seqIndex } of boardings) {
        const known = boardingByTrip.get(tripId);
        if (known && known.seqIndex <= seqIndex) continue;

        const trip = trips.get(tripId);
        if (!trip) continue;
        if (excludeRouteIds && excludeRouteIds.has(trip.routeId)) continue;

        const stopTimes = stopTimesByTrip.get(tripId);
        if (!stopTimes) continue;
        if (stopTimes[seqIndex].dep < from.time) continue;

        boardingByTrip.set(tripId, { stopId, seqIndex });
      }
    }

    for (const [tripId, boarding] of boardingByTrip) {
      const stopTimes = stopTimesByTrip.get(tripId);
      const board = stopTimes[boarding.seqIndex];
      if (board.dep >= bestArrival) continue;

      for (let i = boarding.seqIndex + 1; i < stopTimes.length; i += 1) {
        const alight = stopTimes[i];
        if (alight.arr >= bestArrival) break;

        consider(alight.stopId, {
          time: alight.arr,
          viaTripId: tripId,
          boardStopId: boarding.stopId,
          boardTime: board.dep,
          boardSeqIndex: boarding.seqIndex,
          alightSeqIndex: i,
        });
      }
    }

    for (const [stopId, update] of [...updates]) {
      const stop = stops.get(stopId);
      if (!stop) continue;

      const siblings = stopsByNode.get(stop.nodeId);
      if (!siblings) continue;

      for (const siblingId of siblings) {
        if (siblingId === stopId) continue;
        consider(siblingId, {
          time: update.time + TRANSFER_BUFFER_SEC,
          viaTripId: "TRANSFER",
          boardStopId: stopId,
          boardTime: update.time,
        });
      }
    }

    if (updates.size === 0) break;

    frontier = [];
    for (const [stopId, update] of updates) {
      reached.set(stopId, update);
      if (update.time < bestArrival) frontier.push(stopId);
    }
  }

  const reachedDest = earliestOf(reached);
  return reachedDest ? finish(reachedDest) : null;
}

function summarize(legs) {
  const rides = legs.filter((leg) => !leg.transfer).length;

  return {
    legs,
    departTimeSec: legs[0].boardTime,
    arriveTimeSec: legs[legs.length - 1].alightTime,
    durationSec: legs[legs.length - 1].alightTime - legs[0].boardTime,
    transfers: Math.max(0, rides - 1),
  };
}

export function searchDepartures(
  gtfs,
  originStopIds,
  destinationStopIds,
  startTimeSec,
  maxOptions = 15,
) {
  const options = [];
  let departAfter = startTimeSec;

  for (let round = 0; round < maxOptions; round += 1) {
    const legs = searchRoute(
      gtfs,
      originStopIds,
      destinationStopIds,
      departAfter,
    );
    if (!legs) break;

    const option = summarize(legs);
    options.push(option);
    departAfter = option.departTimeSec + 1;
  }

  let fastest = 0;
  for (let i = 1; i < options.length; i += 1) {
    if (options[i].durationSec < options[fastest].durationSec) fastest = i;
  }

  return options.map((option, index) => ({
    ...option,
    isFastest: index === fastest,
  }));
}
