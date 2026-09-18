import { NextResponse } from "next/server";
import type { StopsResult } from "@catch-it/core";
import { getTransitStops } from "@/server/gtfs/transitStops.mjs";

export const runtime = "nodejs";

export async function GET() {
  const result: StopsResult = await getTransitStops();

  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-cache" },
  });
}
