import { NextRequest, NextResponse } from "next/server";
import { incrementLodgeViews } from "@/lib/data";

export async function POST(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await incrementLodgeViews(id);
  return NextResponse.json({ ok: true });
}
