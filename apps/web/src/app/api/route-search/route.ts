import { NextResponse } from "next/server";
import mockData from "@/mocks/route-search.kamenicka-hradcanska.json";

export async function POST() {
  return NextResponse.json(mockData);
}
