import { NextRequest, NextResponse } from "next/server";
import { incrementLodgeWhatsappClicks } from "@/lib/data";

export async function POST(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const lodge = await incrementLodgeWhatsappClicks(id);
  if (!lodge) return NextResponse.json({ error: "Lodge not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
