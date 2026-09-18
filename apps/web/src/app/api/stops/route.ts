import { NextResponse } from "next/server";
import type { StopsResult, TransitStop } from "@catch-it/core";
import { getTransitStops } from "@/server/gtfs/transitStops.mjs";

export const runtime = "nodejs";

export async function GET() {
  const stops: TransitStop[] = await getTransitStops();
  const result: StopsResult = { stops };

  // Always revalidate: a long max-age kept serving an old payload shape after
  // the stop format changed, and the server already caches the list itself.
  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-cache" },
  });
}
