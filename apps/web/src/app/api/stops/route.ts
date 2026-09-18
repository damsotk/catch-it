import { NextResponse } from "next/server";
import type { StopsResult, TransitStop } from "@catch-it/core";
import { getTransitStops } from "@/server/gtfs/transitStops.mjs";

export const runtime = "nodejs";

export async function GET() {
  const stops: TransitStop[] = await getTransitStops();
  const result: StopsResult = { stops };

  return NextResponse.json(result, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
