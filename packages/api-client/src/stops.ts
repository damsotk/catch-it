import type { StopsResult } from "@catch-it/core";

const STOPS_PATH = "/api/stops";

export type FetchStopsOptions = {
  baseUrl?: string;
  signal?: AbortSignal;
};

export async function fetchStops({
  baseUrl = "",
  signal,
}: FetchStopsOptions = {}): Promise<StopsResult> {
  // "no-cache" makes the browser ask the server every time, so a stale copy
  // cached under an older response shape can never be reused.
  const response = await fetch(`${baseUrl}${STOPS_PATH}`, {
    signal,
    cache: "no-cache",
  });

  if (!response.ok) {
    throw new Error(`Loading stops failed (${response.status}).`);
  }

  return (await response.json()) as StopsResult;
}
