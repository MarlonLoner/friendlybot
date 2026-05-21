import { NextRequest, NextResponse } from "next/server";
import { createLodge, getLodges } from "@/lib/data";
import { parseLodgePayload } from "@/lib/lodge-parse";

export async function GET(request: NextRequest) {
  const facilities = request.nextUrl.searchParams.get("facilities")?.split(",").filter(Boolean) ?? [];
  const lodges = await getLodges({
    query: request.nextUrl.searchParams.get("q") ?? undefined,
    location: request.nextUrl.searchParams.get("location") ?? undefined,
    priceRange: request.nextUrl.searchParams.get("priceRange") ?? undefined,
    lodgeType: request.nextUrl.searchParams.get("lodgeType") ?? undefined,
    facilities
  });

  return NextResponse.json({ lodges });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "A JSON request body is required." }, { status: 400 });

  try {
    const lodge = await createLodge(parseLodgePayload(body, { status: "PENDING", isFeatured: false, subscriptionStatus: "NONE" }));
    return NextResponse.json({ lodge }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to submit lodge." }, { status: 400 });
  }
}
