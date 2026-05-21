import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth";
import { updateGroupRequestStatus } from "@/lib/data";
import type { GroupRequestStatus } from "@/lib/types";

const allowedStatuses: GroupRequestStatus[] = ["NEW", "REVIEWED", "CREATED", "IGNORED"];

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    status?: GroupRequestStatus;
    createdGroupId?: string | null;
  } | null;

  if (!body?.status || !allowedStatuses.includes(body.status)) {
    return NextResponse.json({ error: "A valid request status is required." }, { status: 400 });
  }

  try {
    const { id } = await context.params;
    const groupRequest = await updateGroupRequestStatus(id, body.status, body.createdGroupId ?? null);

    return NextResponse.json({ groupRequest });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update request." }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const groupRequest = await updateGroupRequestStatus(id, "IGNORED");

    return NextResponse.json({ groupRequest });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to ignore request." }, { status: 400 });
  }
}
