import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth";
import { deleteLodge, getLodgeById, toggleLodgeFeatured, updateLodge, updateLodgeStatus } from "@/lib/data";
import { parseLodgePayload } from "@/lib/lodge-parse";
import type { LodgeStatus } from "@/lib/types";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isAuthorizedAdminRequest(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await context.params;
  const lodge = await getLodgeById(id);
  if (!lodge) return NextResponse.json({ error: "Lodge not found." }, { status: 404 });
  return NextResponse.json({ lodge });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isAuthorizedAdminRequest(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await context.params;
  const body = (await request.json()) as Record<string, unknown>;
  try {
    if (body.action === "status") return NextResponse.json({ lodge: await updateLodgeStatus(id, body.status as LodgeStatus) });
    if (body.action === "featured") return NextResponse.json({ lodge: await toggleLodgeFeatured(id, Boolean(body.isFeatured)) });
    return NextResponse.json({ lodge: await updateLodge(id, parseLodgePayload(body)) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update lodge." }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isAuthorizedAdminRequest(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await context.params;
  await deleteLodge(id);
  return NextResponse.json({ ok: true });
}
