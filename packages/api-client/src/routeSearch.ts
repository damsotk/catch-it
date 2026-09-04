import type { RouteSearchRequest, RouteSearchResult } from "@catch-it/core";

const ROUTE_SEARCH_PATH = "/api/route-search";

export class RouteSearchError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "RouteSearchError";
    this.status = status;
  }
}

export type SearchRoutesOptions = {
  baseUrl?: string;
  signal?: AbortSignal;
};

export async function searchRoutes(
  request: RouteSearchRequest,
  { baseUrl = "", signal }: SearchRoutesOptions = {},
): Promise<RouteSearchResult> {
  const response = await fetch(`${baseUrl}${ROUTE_SEARCH_PATH}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof payload?.error === "string"
        ? payload.error
        : `Route search failed (${response.status}).`;
    throw new RouteSearchError(message, response.status);
  }

  return payload as RouteSearchResult;
}
