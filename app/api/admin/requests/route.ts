import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth";
import { getGroupRequests, getGroupRequestStats } from "@/lib/data";

export async function GET(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const [requests, stats] = await Promise.all([getGroupRequests(), getGroupRequestStats()]);

  return NextResponse.json({ requests, stats });
}
