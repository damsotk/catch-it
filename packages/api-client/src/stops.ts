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
  const response = await fetch(`${baseUrl}${STOPS_PATH}`, { signal });

  if (!response.ok) {
    throw new Error(`Loading stops failed (${response.status}).`);
  }

  return (await response.json()) as StopsResult;
}
