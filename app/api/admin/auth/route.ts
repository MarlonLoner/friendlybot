import { NextRequest, NextResponse } from "next/server";
import { isValidAdminCode } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { code?: string };

  if (!isValidAdminCode(body.code)) {
    return NextResponse.json({ error: "Invalid access code." }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
