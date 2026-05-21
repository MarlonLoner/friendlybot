import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth";
import { createLodge, getLodges } from "@/lib/data";
import { parseLodgePayload } from "@/lib/lodge-parse";

export async function GET(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const lodges = await getLodges({
    includeArchived: true,
    status: (request.nextUrl.searchParams.get("status") as never) || "ALL",
    query: request.nextUrl.searchParams.get("q") ?? undefined
  });
  return NextResponse.json({ lodges });
}

export async function POST(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const lodge = await createLodge(parseLodgePayload(body, { status: "ACTIVE" }));
    return NextResponse.json({ lodge }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create lodge." }, { status: 400 });
  }
}
