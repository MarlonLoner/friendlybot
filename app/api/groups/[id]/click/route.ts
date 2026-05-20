import { NextRequest, NextResponse } from "next/server";
import { incrementGroupClicks } from "@/lib/data";

export async function POST(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const group = await incrementGroupClicks(id);

  if (!group) {
    return NextResponse.json({ error: "Group not found." }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    inviteLink: group.inviteLink
  });
}
