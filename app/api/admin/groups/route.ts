import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth";
import { createGroup, getGroups } from "@/lib/data";
import type { GroupStatus } from "@/lib/types";

const allowedStatuses: GroupStatus[] = ["ACTIVE", "ALMOST_FULL", "FULL", "ARCHIVED"];

function parseGroupPayload(body: Record<string, unknown>) {
  const name = String(body.name ?? "").trim();
  const inviteLink = String(body.inviteLink ?? "").trim();
  const categoryId = String(body.categoryId ?? "").trim();
  const description = String(body.description ?? "").trim();
  const status = String(body.status ?? "ACTIVE") as GroupStatus;

  if (!name || !inviteLink || !categoryId || !description) {
    throw new Error("Name, invite link, category and description are required.");
  }

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid group status.");
  }

  return {
    name,
    inviteLink,
    categoryId,
    description,
    subcategory: body.subcategory ? String(body.subcategory).trim() : null,
    location: body.location ? String(body.location).trim() : null,
    tags: Array.isArray(body.tags) ? body.tags.map((tag) => String(tag).trim()).filter(Boolean) : [],
    status,
    isFeatured: Boolean(body.isFeatured),
    lastVerifiedAt: body.lastVerifiedAt ? String(body.lastVerifiedAt) : null
  };
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const includeArchived = request.nextUrl.searchParams.get("includeArchived") === "true";
  const groups = await getGroups({ includeArchived });

  return NextResponse.json({ groups });
}

export async function POST(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const group = await createGroup(parseGroupPayload(body));

    return NextResponse.json({ group }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create group." }, { status: 400 });
  }
}
