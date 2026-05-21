import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth";
import { getSearchAnalytics } from "@/lib/data";

export async function GET(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const filter = request.nextUrl.searchParams.get("filter");
  const analytics = await getSearchAnalytics(filter === "FOUND" || filter === "NO_RESULTS" ? filter : "ALL");
  return NextResponse.json(analytics);
}
